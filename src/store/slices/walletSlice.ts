/**
 * Wallet Management Slice for Redux Store
 * 
 * This module implements a Redux slice for managing Cardano wallet state and interactions.
 * It provides comprehensive wallet management including UTxO tracking, wallet connection,
 * balance calculations, and WebSocket notifications for wallet events.
 * 
 * Key Features:
 * - Wallet connection and disconnection management
 * - UTxO tracking and virtual wallet support
 * - Balance calculations for various tokens (ADA, OADA, sOADA, OPTIMiz)
 * - WebSocket notifications for wallet events
 * - Reward account management
 * - CIP-30 compliant wallet API interactions
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState, Services, ThunkAPI } from "../index";
import { UITypes } from "../../types";
import {lucid} from "../hooks";
import {Wallet} from "../../types/store";
import {Result} from "../../utils/result";
import {Utils, WalletApi, UTxO as LucidUtxo} from "lucid-cardano";
import * as L from '../../utils/lucid'
import * as Lucid from 'lucid-cardano'
import * as St from "../../types/store";
import Big from "big.js";
import { Utxo, Value }from '../../types/server'

import { oadaNetwork } from "../../network";
import { makeJsonRpcNotif } from "../../JsonRpc";
import { getLatestUtxosFromPersistedVirtualWalletUtxoMap, getMostRecentUtxosFromLucidUtxos, getWalletUtxoMap, pruneWalletUtxoMap, setWalletUtxoMap } from "../../utils/wallet-stuff";
import {selectOadaLpToken} from "src/oada/actions";
import {filter, lucidUtxoToUtxo} from "src/utils";

/**
 * Represents a value in the Gimbalabs (GY) format
 * Contains lovelace amount and optional asset class quantities
 */
export type GYValue = {
  lovelace: string,
  [assetClass: string]: string
}

/**
 * Represents a reward account with associated payment credentials and value
 */
export type RewardAccount = {
  paymentPkh: string;
  distId: number;
  value: GYValue;
};

/**
 * Interface defining the wallet state structure
 */
interface WalletState {
  wallet: UITypes.Wallets.Wallet | null,
  partialWallet: St.PartialWallet,
  showWalletSelect: boolean,
  lastTxId?: string,
  feeAddress: string | null
  rewardAccounts: RewardAccount[];
}

/**
 * Initial state for the wallet slice
 */
const initialState: WalletState = {
  wallet: null,
  partialWallet: {
    utxos: [],
  },
  showWalletSelect: false,
  lastTxId: undefined,
  feeAddress: null,
  rewardAccounts: [],
};

/**
 * Converts a server-side value format to Lucid's asset format
 * @param value - Server-side value representation
 * @returns Lucid-compatible asset format
 */
export const serverValueToLucid = (value: Value): Lucid.Assets => {
  const o: Lucid.Assets = {
    lovelace: value.lovelace
  }
  for (const [k, v] of Object.entries(value.assets)) {
    const keyWithoutSep = k.replace('.', '')
    o[keyWithoutSep] = BigInt(v)
  }
  return o
}

/**
 * Converts a server-side UTxO to Lucid's UTxO format
 * @param serverUtxo - Server-side UTxO representation
 * @returns Lucid-compatible UTxO format
 */
const serverUtxoToLucid = (serverUtxo: Utxo): Lucid.UTxO => {
  return {
    txHash: serverUtxo.utxoRef.txHash,
    outputIndex: serverUtxo.utxoRef.outputIndex,
    assets: serverValueToLucid(serverUtxo.value),
    address: serverUtxo.address
  }
}

/**
 * Prunes and updates UTxO map with most recent UTxOs
 * Handles both wallet and virtual UTxO management
 * @param utxos - Array of Lucid UTxOs to process
 * @returns Combined array of most recent UTxOs
 */
export const pruneAndMostRecentUtxos = (utxos: Lucid.UTxO[]) => {
  console.log('BEFORE GET WALLET UTXOS MAP')
  const walletUtxoMap = getWalletUtxoMap()
  console.log('BEFORE PRUNING')
  console.log(walletUtxoMap)
  pruneWalletUtxoMap(walletUtxoMap, utxos)
  console.log('AFTER PRUNING')
  console.log(walletUtxoMap)
  setWalletUtxoMap(walletUtxoMap)
  const [lucidUtxos, serverUtxos] = getMostRecentUtxosFromLucidUtxos(walletUtxoMap, utxos)
  console.log(lucidUtxos)
  console.log(serverUtxos)
  return lucidUtxos.concat(serverUtxos.map(serverUtxoToLucid))
}

/**
 * Type guard for non-null values
 */
const isNotNull = <A>(a: A | null): a is A => {
  return a !== null
}

/**
 * Structure representing wallet UTxOs including collateral
 */
type WalletUtxos = {
  utxos: LucidUtxo[],
  collateralUtxos: LucidUtxo[],
}

/**
 * Retrieves UTxOs for a given wallet, including collateral UTxOs
 * Handles CIP-30 wallet API compatibility
 * @param storeWallet - Wallet to fetch UTxOs for
 * @returns Promise resolving to wallet UTxOs and collateral
 */
export const getUtxos = async (storeWallet: Wallet): Promise<WalletUtxos> => {
  const cip30Api = walletApiByProviderByAddress?.[storeWallet.provider]?.[storeWallet.address]
  const getCollateral =
    cip30Api?.getCollateral === undefined
      ? cip30Api?.experimental?.getCollateral === undefined
        ? async () => []
        : cip30Api.experimental.getCollateral
      : cip30Api.getCollateral

  const getCollateralResult = await getCollateral()
  const collateral =
    getCollateralResult === null || getCollateralResult === undefined
      ? []
      : getCollateralResult

  const collateralUtxos = filter<LucidUtxo>(isNotNull)(collateral.map(L.cborToUtxo))

  console.log(`COLLAT:`)
  console.log(collateralUtxos)
  const utxos = await lucid.wallet.getUtxos()
  const utxoRefToUtxoMap = utxos.reduce((hasSeens, utxo) => {
    const utxoRef = `${utxo.txHash}#${utxo.outputIndex}`
    const hasSeen = hasSeens[utxoRef] !== undefined
    if (!hasSeen) {
      hasSeens[utxoRef] = utxo
    }
    return hasSeens
  }, {} as { [utxoId: string]: LucidUtxo })
  const uniqueUtxos = Object.values(utxoRefToUtxoMap)

  return {
    utxos: uniqueUtxos,
    collateralUtxos,
  }
}

/**
 * Wallet management slice for Redux store
 * Handles wallet state updates and interactions
 */
export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    /**
     * Sets the fee address for the wallet
     */
    setWalletFeeAddress: (state, action: PayloadAction<string | null>) => {
      state.feeAddress = action.payload;
    },
    /**
     * Toggles wallet selection dialog visibility
     */
    toggleShowWalletSelect: (state) => {
      state.showWalletSelect = !state.showWalletSelect;
    },
    /**
     * Updates reward accounts for the wallet
     */
    setRewardAccounts: (state, action: PayloadAction<RewardAccount[]>) => {
      state.rewardAccounts = action.payload;
      console.log("setRewardAccounts fulfilled");
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateWalletUtxosThunk.fulfilled, (state, action) => {
        if (state.wallet === null || action.payload === null) {
          state.partialWallet = { utxos: [] }
          return;
        }
        const utxos = action.payload

        const utxoRefs = new Set(utxos.map(utxoToUtxoRefString))
        if (!(state.partialWallet.utxos.every(u => utxoRefs.has(utxoToUtxoRefString(u)))
              && state.partialWallet.utxos.length === utxoRefs.size)) {
          console.log('updateWalletUtxosThunk changed utxos')
          state.partialWallet = { utxos }
        }
        console.log("updateWalletUtxosThunk fulfilled")
      })
      .addCase(setWalletByProvider.fulfilled, (state, action) => {
        state.wallet = action.payload
        state.showWalletSelect = false
        console.log('setWalletByProvider fulfilled')
      })
      .addCase(disconnectWalletThunk.fulfilled, (state, _action) => {
        if (state.wallet !== null) {
          state.wallet = null
          state.partialWallet.utxos = []
        }
      })
  }
})

export const { setWalletFeeAddress, toggleShowWalletSelect, setRewardAccounts } = walletSlice.actions;
export default walletSlice.reducer

/** 
 * Global wallet API cache
 * Maps provider names to address-specific wallet APIs
 * Updated by setWalletByProvider thunk
 */
export const walletApiByProviderByAddress: { [name: string]: { [address: string]: WalletApi } } = {}

/**
 * Parameters for wallet disconnection
 */
type DisconnectWalletParams = {
  ws: WebSocket | null,
}

/**
 * Thunk for handling wallet disconnection
 * Cleans up wallet state and sends WebSocket notification
 */
export const disconnectWalletThunk = createAsyncThunk<
  void,
  DisconnectWalletParams,
  {
    state: RootState,
    extra: Services,
  }
>(
  'wallet/disconnectWalletThunk',
  async (params: DisconnectWalletParams, thunkApi: ThunkAPI) => {
    const dispatch = thunkApi.dispatch
    const wallet = thunkApi.getState().wallet.wallet
    const walletProviderName = wallet?.provider
    if (walletProviderName !== undefined) {
      localStorage.removeItem('walletProviderName')
      const walletAddress = wallet?.address
      if (walletAddress !== undefined) {
        const address = await lucid.wallet.address()
        sendDisconnectWalletWsNotif(params.ws, address)
        dispatch(setRewardAccounts([]))
      }
    }
  }
)

/**
 * Thunk for updating wallet UTxOs
 * Handles both regular and virtual wallet UTxOs
 */
export const updateWalletUtxosThunk = createAsyncThunk<
  St.Utxo[],
  unknown,
  {
    state: RootState,
    extra: Services,
  }
>(
  'wallet/updateWalletUtxosThunk',
  async (_: unknown) => {
    const utxos = await lucid.wallet.getUtxos()
    // virtual wallet stuff
    const mostRecentUtxos = pruneAndMostRecentUtxos(utxos)
    // yes we currently have 2 virtual utxo systems...
    // TODO: make it so we have 1
    const mostRecentUtxos2 = getLatestUtxosFromPersistedVirtualWalletUtxoMap(mostRecentUtxos)

    return mostRecentUtxos2.map(lucidUtxoToUtxo) 
  }
)

/**
 * Parameters for setting wallet by provider
 */
type SetWalletByProviderParams = {
  name: string,
  ws: WebSocket | null,
}

/**
 * Thunk for setting wallet by provider
 * Handles wallet selection and initialization
 */
export const setWalletByProvider = createAsyncThunk<
  UITypes.Wallets.Wallet | null,
  SetWalletByProviderParams,
  {
    state: RootState,
    extra: Services,
  }
>(
  'wallet/selectByProvider', 
  async (params, thunkAPI) => {
    const walletProviderName = params.name
    const ws = params.ws
    if (thunkAPI.getState().wallet.wallet !== null) return thunkAPI.getState().wallet.wallet
    const { walletApiProvider } = thunkAPI.extra

    const walletApi = await walletApiProvider.getWalletApi(walletProviderName)

    lucid.selectWallet(walletApi)

    const address = await lucid.wallet.address()
    sendWalletConnectWsNotif(ws, address)

    walletApiByProviderByAddress[walletProviderName] = {
      [address]: walletApi
    }

    const serializableWallet: UITypes.Wallets.Wallet = { 
      provider: walletProviderName,
      address: address,
      utxos: [],
    }
    localStorage.setItem('walletProviderName', walletProviderName)
    return serializableWallet
  }
)

/**
 * Sends wallet connect notification via WebSocket
 */
export const sendWalletConnectWsNotif = (ws: WebSocket | null, address: string) => {
  sendWsWalletNotif(ws, 'ConnectWallet', address)
}

/**
 * Sends wallet disconnect notification via WebSocket
 */
const sendDisconnectWalletWsNotif = async (ws: WebSocket | null, address: string) => {
  sendWsWalletNotif(ws, 'DisconnectWallet', address)
}

/**
 * WebSocket notification method types
 */
type WalletNotifMethod = 'ConnectWallet' | 'DisconnectWallet'

/**
 * Generic function for sending wallet notifications via WebSocket
 */
const sendWsWalletNotif = (ws: WebSocket | null, method: WalletNotifMethod, address: string) => {
  const notif = makeJsonRpcNotif(method, {address})
  if (ws !== null) {
    console.log('Wallet Ws Notif Send:')
    console.log(JSON.stringify(notif))

    const timer = setInterval(function() {
      console.log('WebsocketSendWalletNotif')
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(notif))
        clearInterval(timer)
        console.log(`WebsocketSendWalletNotif cleared: ${timer}`)
      }
    }, 1000)
  }
}

/**
 * Custom error for non-existent wallet at provider
 */
class WalletAtProviderDoesNotExist extends Error {
  constructor(public wallet: Wallet) {
    super(wallet.provider + '.' + wallet.address)
    this.name = 'WalletAtProviderDoesNotExist'
  }
}

/**
 * Custom error for non-existent wallet at address
 */
class WalletAtAddressDoesNotExist extends Error {
  constructor(public wallet: Wallet) {
    super(wallet.provider + '.' + wallet.address)
    this.name = 'WalletAtAddressDoesNotExist'
  }
}

/**
 * Custom error for wallet not selected
 */
class WalletNotSelectedError extends Error {
  constructor(message: string = '') {
    super(message)
    this.name = 'WalletNotSelectedError'
  }
}

/**
 * Custom error for address without payment credentials
 */
class AddressHasNoPaymentCredentialsError extends Error {
  constructor(message: string = '') {
    super(message)
    this.name = 'AddressHasNoPaymentCredentialsError'
  }
}

/**
 * Gets wallet from store state
 */
export const getStoreWallet = (thunkAPI: ThunkAPI): Result<Wallet, WalletNotSelectedError> => {
  const wallet = thunkAPI.getState().wallet.wallet
  return Result.fromNullable(wallet, new WalletNotSelectedError())
}

/**
 * Gets wallet provider API
 */
export const getWalletProvider = (
  storeWallet: Wallet
): Result<WalletApi, WalletAtProviderDoesNotExist | WalletAtAddressDoesNotExist> => {
  return Result
    .fromNullable(walletApiByProviderByAddress[storeWallet.provider], new WalletAtProviderDoesNotExist(storeWallet))
    .chainR(walletByAddress => Result.fromNullable(walletByAddress[storeWallet.address], new WalletAtAddressDoesNotExist(storeWallet)))
}

/**
 * Gets wallet fee address from store
 */
export const getWalletFeeAddress = (thunkAPI: ThunkAPI): string | null => {
  return thunkAPI.getState().wallet.feeAddress
}

/**
 * Gets payment credential from wallet address
 */
export const getPaymentCredentialFromWallet = (wallet: Wallet): Result<Lucid.Credential, AddressHasNoPaymentCredentialsError> => {
  const paymentCredential = new Utils(lucid).getAddressDetails(wallet.address).paymentCredential
  return Result.fromNullable(paymentCredential, new AddressHasNoPaymentCredentialsError())
}

// SELECTORS

/**
 * Selectors for accessing wallet state
 */
export const selectPartialWallet: (state: RootState) => St.PartialWallet = (state: RootState) => state.wallet.partialWallet
export const selectPartialWalletUtxos: (state: RootState) => St.Utxo[] = (state: RootState) => state.wallet.partialWallet.utxos
export const selectWallet: (state: RootState) => (UITypes.Wallets.Wallet | null) = (state: RootState) => state.wallet.wallet
export const selectShowWalletSelect: (state: RootState) => boolean = (state: RootState) => state.wallet.showWalletSelect

/**
 * Selects total lovelace amount in wallet
 */
export const selectWalletLovelaceAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  return sumAssets(utxos, 'lovelace')
}

/**
 * Selects total ADA amount in wallet
 */
export const selectWalletAdaAmount = (state: RootState): Big => {
  return lovelaceToAda(selectWalletLovelaceAmount(state))
}

/**
 * Sums assets across UTxOs for a given asset class
 */
export const sumAssets = (utxos: St.Utxo[], assetClass: string): Big => {
  let sum = Big(0)
  for (const utxo of utxos) {
    const amountString = utxo.assets[assetClass]
    const quantity = amountString === undefined ? Big(0) : Big(amountString)
    sum = sum.add(quantity)
  }
  return sum
}

/**
 * Token-specific balance selectors
 */
export const selectWalletOadaletAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  const assetClass =  `${oadaNetwork.oadaPolicyId}${oadaNetwork.oadaTokenName}`
  return sumAssets(utxos, assetClass)
}

export const selectWalletSoadaletAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  return sumAssets(utxos, `${oadaNetwork.soadaPolicyId}${oadaNetwork.soadaTokenName}`)
}

export const selectWalletOadaLpAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  const lpToken = selectOadaLpToken(state)
  if (lpToken === undefined)
    return Big(0)
  return sumAssets(utxos, `${lpToken.policyId}${lpToken.tokenName}`)
}

export const selectWalletOptimizAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  const assetClass =  `${oadaNetwork.optimizPolicyId}${oadaNetwork.optimizTokenName}`
  return assetClass ? sumAssets(utxos, assetClass) : Big(0)
}

/**
 * Generic token balance selector
 */
export const selectWalletTokenCount = (currencySymbol: string, tokenName: string) => (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  const targetAssetName = currencySymbol + tokenName
  let sum = Big(0)
  for (const utxo of utxos) {
    const assets = utxo.assets
    for (const [k, quantity] of Object.entries(assets)) {
      if (targetAssetName === k) {
        sum = sum.add(Big(quantity))
        break;
      }
    }
  }
  return sum
}

// UTILITY

/**
 * Converts lovelace to ADA
 */
export function lovelaceToAda(lovelace: Big): Big {
  return lovelace.div(Big(1_000_000))
}

/**
 * Converts UTxO to string reference
 */
function utxoToUtxoRefString(utxo: St.Utxo): string {
  return utxo.txId + "#" + utxo.txIx.toString()
}

/**
 * Type guards for reward accounts
 */
const isRewardAccount = (o: unknown): o is RewardAccount => {
  return typeof o === "object";
};

export const isArrayOf = <T>(typeGuard: (o: any) => o is T) => (o: any): o is T[] => {
  return Array.isArray(o) && o.every(typeGuard)
}

export const isRewardAccounts = (o: unknown): o is RewardAccount[] => {
  return isArrayOf(isRewardAccount)(o);
};
