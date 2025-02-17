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

export type GYValue = {
  lovelace: string,
  [assetClass: string]: string
}

export type RewardAccount = {
  paymentPkh: string;
  distId: number;
  value: GYValue;
};

interface WalletState {
  wallet: UITypes.Wallets.Wallet | null,
  partialWallet: St.PartialWallet,
  showWalletSelect: boolean,
  lastTxId?: string,
  feeAddress: string | null
  rewardAccounts: RewardAccount[];
}

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

const serverUtxoToLucid = (serverUtxo: Utxo): Lucid.UTxO => {
  return {
    txHash: serverUtxo.utxoRef.txHash,
    outputIndex: serverUtxo.utxoRef.outputIndex,
    assets: serverValueToLucid(serverUtxo.value),
    address: serverUtxo.address
  }
}


// NOTE: as long as a storage get and set happen within the
// same callback/function/resulting callstack then we have no race
// condition within a single tab. We DO have a race condition
// across several tabs/windows, but I assume it's rare to the point
// that no one will ever see it.
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

const isNotNull = <A>(a: A | null): a is A => {
  return a !== null
}

type WalletUtxos = {
  utxos: LucidUtxo[],
  collateralUtxos: LucidUtxo[],
}

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


export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletFeeAddress: (state, action: PayloadAction<string | null>) => {
      state.feeAddress = action.payload;
    },
    toggleShowWalletSelect: (state) => {
      state.showWalletSelect = !state.showWalletSelect;
    },
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
 * Global variable 
 * Gets updated only by selectWalletByProvider async thunk
 * TODO: Maybe we can just put this in the store.
 */
export const walletApiByProviderByAddress: { [name: string]: { [address: string]: WalletApi } } = {}

type DisconnectWalletParams = {
  ws: WebSocket | null,
}

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

// TODO: we don't handle/catch possible errors
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

type SetWalletByProviderParams = {
  name: string,
  ws: WebSocket | null,
}

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

    // NOTE: now lucid contains the wallet api we used before
    // and the wallet api is the raw api in the CIP (probably)
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

export const sendWalletConnectWsNotif = (ws: WebSocket | null, address: string) => {
  sendWsWalletNotif(ws, 'ConnectWallet', address)
}

const sendDisconnectWalletWsNotif = async (ws: WebSocket | null, address: string) => {
  sendWsWalletNotif(ws, 'DisconnectWallet', address)
}

type WalletNotifMethod = 'ConnectWallet' | 'DisconnectWallet'
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

class WalletAtProviderDoesNotExist extends Error {
  constructor(public wallet: Wallet) {
    super(wallet.provider + '.' + wallet.address)
    this.name = 'WalletAtProviderDoesNotExist'
  }
}
class WalletAtAddressDoesNotExist extends Error {
  constructor(public wallet: Wallet) {
    super(wallet.provider + '.' + wallet.address)
    this.name = 'WalletAtAddressDoesNotExist'
  }
}
class WalletNotSelectedError extends Error {
  constructor(message: string = '') {
    super(message)
    this.name = 'WalletNotSelectedError'
  }
}
class AddressHasNoPaymentCredentialsError extends Error {
  constructor(message: string = '') {
    super(message)
    this.name = 'AddressHasNoPaymentCredentialsError'
  }
}

export const getStoreWallet = (thunkAPI: ThunkAPI): Result<Wallet, WalletNotSelectedError> => {
  const wallet = thunkAPI.getState().wallet.wallet
  return Result.fromNullable(wallet, new WalletNotSelectedError())
}

export const getWalletProvider = (
  storeWallet: Wallet
): Result<WalletApi, WalletAtProviderDoesNotExist | WalletAtAddressDoesNotExist> => {
  return Result
    .fromNullable(walletApiByProviderByAddress[storeWallet.provider], new WalletAtProviderDoesNotExist(storeWallet))
    .chainR(walletByAddress => Result.fromNullable(walletByAddress[storeWallet.address], new WalletAtAddressDoesNotExist(storeWallet)))
}

export const getWalletFeeAddress = (thunkAPI: ThunkAPI): string | null => {
  return thunkAPI.getState().wallet.feeAddress
}

export const getPaymentCredentialFromWallet = (wallet: Wallet): Result<Lucid.Credential, AddressHasNoPaymentCredentialsError> => {
  const paymentCredential = new Utils(lucid).getAddressDetails(wallet.address).paymentCredential

  return Result.fromNullable(paymentCredential, new AddressHasNoPaymentCredentialsError())
}

// SELECTORS

export const selectPartialWallet: (state: RootState) => St.PartialWallet = (state: RootState) => state.wallet.partialWallet
export const selectPartialWalletUtxos: (state: RootState) => St.Utxo[] = (state: RootState) => state.wallet.partialWallet.utxos
export const selectWallet: (state: RootState) => (UITypes.Wallets.Wallet | null) = (state: RootState) => state.wallet.wallet
export const selectShowWalletSelect: (state: RootState) => boolean = (state: RootState) => state.wallet.showWalletSelect

export const selectWalletLovelaceAmount = (state: RootState): Big => {
  const utxos = state.wallet.partialWallet.utxos
  return sumAssets(utxos, 'lovelace')
}

export const selectWalletAdaAmount = (state: RootState): Big => {
  return lovelaceToAda(selectWalletLovelaceAmount(state))
}

export const sumAssets = (utxos: St.Utxo[], assetClass: string): Big => {
  let sum = Big(0)
  for (const utxo of utxos) {
    const amountString = utxo.assets[assetClass]
    const quantity = amountString === undefined ? Big(0) : Big(amountString)
    sum = sum.add(quantity)
  }
  return sum
}

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

export function lovelaceToAda(lovelace: Big): Big {
  return lovelace.div(Big(1_000_000))
}

function utxoToUtxoRefString(utxo: St.Utxo): string {
  return utxo.txId + "#" + utxo.txIx.toString()
}

const isRewardAccount = (o: unknown): o is RewardAccount => {
  return typeof o === "object";
};

export const isArrayOf = <T>(typeGuard: (o: any) => o is T) => (o: any): o is T[] => {
  return Array.isArray(o) && o.every(typeGuard)
}

export const isRewardAccounts = (o: unknown): o is RewardAccount[] => {
  return isArrayOf(isRewardAccount)(o);
};
