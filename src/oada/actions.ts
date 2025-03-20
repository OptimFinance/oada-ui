/**
 * OADA Protocol Redux Actions and State Management
 * 
 * This file implements the core Redux actions and state management for the OADA protocol,
 * including transaction handling, staking operations, auction bidding, and protocol interactions.
 * It provides a comprehensive set of async thunks for interacting with the OADA smart contracts
 * on the Cardano blockchain.
 */

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BasicResponse, FailResponse } from '../utils';
import { AppDispatch, RootState, Services } from '../store/index';
import makeJSONBigInt, { } from "json-bigint"
import { oadaEndpointsUrl, oadaFeeAddress, oadaMintFee, oadaStakeFee } from '../config.local';
import { TxRecipe, txRecipeToTx } from '../tx-recipe';
import { getLatestUtxosFromPersistedVirtualWalletUtxoMap, makeVirtualWalletUtxoMap, updatePersistedVirtualWalletUtxoMap } from '../utils/wallet-stuff';
import { lucid } from '../store/hooks';
import Big from 'big.js';
import { UITypes } from 'src/types/ui';
import { UTxO } from 'lucid-cardano';
import { bech32AddressToPaymentPkh } from 'src/utils/lucid';
import { oadaNetwork } from 'src/network';
import { addressToStakeAddress, relativeEpochToAbsoluteEpoch } from 'src/utils';
import { bidIdToTxOutRef } from './view';
import {getUtxos} from 'src/store/slices/walletSlice';

/**
 * JSON BigInt Configuration
 * Configures JSON handling to properly manage BigInt values in protocol interactions
 */
const JSONBigInt = makeJSONBigInt({ useNativeBigInt: true, alwaysParseAsBig: true, constructorAction: 'preserve' })
const Json = JSONBigInt

/**
 * OADA Protocol State Interface
 * Defines the structure of the Redux state for OADA protocol actions
 * Includes responses from various protocol operations like buying, staking,
 * and auction interactions
 */
type OadaState = {
  buyOadaResponse: BasicResponse<string> | undefined,
  stakeOadaResponse: BasicResponse<string> | undefined,
  unstakeOadaResponse: BasicResponse<string> | undefined,
  stakeAuctionBidResponse: BasicResponse<string> | undefined,
  cancelStakeAuctionBidResponse: BasicResponse<string> | undefined,
  cancelStakeOrderResponse: BasicResponse<string> | undefined,
  getOadaFrontendInfoResponse: BasicResponse<OadaFrontendInfo> | undefined,
  getStakeLockHistoricVolumeResponse: BasicResponse<number> | undefined,
  getSoadaHistoricalReturnResponse: BasicResponse<SoadaHistoricalReturn> | undefined
  getStakeAuctionVolumeResponse: BasicResponse<StakeAuctionVolume> | undefined
  getOadaGeneralInfoResponse: BasicResponse<OadaGeneralInfo> | undefined,
  unlockOptimizResponse: BasicResponse<string> | undefined,
  getOptimizToOptimInfoResponse: BasicResponse<OptimizToOptimInfo> | undefined,
}

/**
 * Initial Redux State
 * Sets up the initial state for all OADA protocol actions with undefined responses
 */
const initialState: OadaState = {
  buyOadaResponse: undefined,
  stakeOadaResponse: undefined,
  unstakeOadaResponse: undefined,
  stakeAuctionBidResponse: undefined,
  cancelStakeAuctionBidResponse: undefined,
  cancelStakeOrderResponse: undefined,
  getOadaFrontendInfoResponse: undefined,
  getStakeLockHistoricVolumeResponse: undefined,
  getSoadaHistoricalReturnResponse: undefined,
  getStakeAuctionVolumeResponse: undefined,
  getOadaGeneralInfoResponse: undefined,
  unlockOptimizResponse: undefined,
  getOptimizToOptimInfoResponse: undefined,
}

/**
 * OADA Actions Redux Slice
 * Creates a Redux slice for managing OADA protocol actions
 * Handles state updates for all protocol operations
 */
export const oadaActionsSlice = createSlice({
  name: 'oada-actions',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(buyOada.fulfilled, (state, action) => {
        state.buyOadaResponse = action.payload
      })
      .addCase(buyOada.rejected, (state, err) => {
        state.buyOadaResponse = err.payload
        console.error("Buy oada request failed:", err);
      })
      .addCase(stakeOada.fulfilled, (state, action) => {
        state.stakeOadaResponse = action.payload
      })
      .addCase(stakeOada.rejected, (state, err) => {
        state.stakeOadaResponse = err.payload
        console.error("Stake oada request failed:", err);
      })
      .addCase(unstakeOada.fulfilled, (state, action) => {
        state.unstakeOadaResponse = action.payload
      })
      .addCase(unstakeOada.rejected, (state, err) => {
        state.unstakeOadaResponse = err.payload
        console.error("Unstake oada request failed:", err);
      })
      .addCase(stakeAuctionBid.fulfilled, (state, action) => {
        state.stakeAuctionBidResponse = action.payload
      })
      .addCase(stakeAuctionBid.rejected, (state, err) => {
        state.stakeAuctionBidResponse = err.payload
        console.error("Stake auction bid request failed:", err);
      })
      .addCase(cancelStakeAuctionBid.fulfilled, (state, action) => {
        state.cancelStakeAuctionBidResponse = action.payload
      })
      .addCase(cancelStakeAuctionBid.rejected, (state, err) => {
        state.cancelStakeAuctionBidResponse = err.payload
        console.error("Stake auction bid cancel request failed:", err);
      })
      .addCase(cancelStakeOrder.fulfilled, (state, action) => {
        state.cancelStakeOrderResponse = action.payload
      })
      .addCase(cancelStakeOrder.rejected, (state, err) => {
        state.cancelStakeOrderResponse = err.payload
        console.error("Stake order cancel request failed:", err);
      })
      .addCase(getOadaFrontendInfo.fulfilled, (state, action) => {
        state.getOadaFrontendInfoResponse = action.payload
      })
      .addCase(getStakeLockHistoricVolume.fulfilled, (state, action) => {
        state.getStakeLockHistoricVolumeResponse = action.payload
      })
      .addCase(getSoadaHistoricalReturn.fulfilled, (state, action) => {
        state.getSoadaHistoricalReturnResponse = action.payload
      })
      .addCase(getStakeAuctionVolume.fulfilled, (state, action) => {
        state.getStakeAuctionVolumeResponse = action.payload
      })
      .addCase(getOadaFrontendInfo.rejected, (state, err) => {
        state.getOadaFrontendInfoResponse = err.payload
        console.error("Get oada frontend info request failed:", err);
      })
      // optimiz locks
      .addCase(unlockOptimiz.fulfilled, (state, action) => {
        state.unlockOptimizResponse = action.payload
      })
      .addCase(unlockOptimiz.rejected, (state, err) => {
        state.unlockOptimizResponse = err.payload
        console.error("Unlock optimiz request failed:", err);
      })
      .addCase(getOptimizToOptimInfo.fulfilled, (state, action) => {
        state.getOptimizToOptimInfoResponse = action.payload
      })
      .addCase(getOptimizToOptimInfo.rejected, (state, err) => {
        state.getOptimizToOptimInfoResponse = err.payload
        console.error("Get optimiz to optim info request failed:", err);
      })
  }
})

export const oadaReducer = oadaActionsSlice.reducer

/**
 * Redux Selectors
 * Provide access to specific parts of the OADA protocol state
 */

/**
 * Selects the buy OADA transaction response from state
 */
export const selectBuyOadaResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.buyOadaResponse
}

/**
 * Selects the stake OADA transaction response from state
 */
export const selectStakeOadaResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.stakeOadaResponse
}

export const selectUnstakeOadaResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.unstakeOadaResponse
}

export const selectStakeAuctionBidResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.stakeAuctionBidResponse
}

export const selectCancelStakeAuctionBidResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.cancelStakeAuctionBidResponse
}

export const selectCancelStakeOrderResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.cancelStakeOrderResponse
}

export const selectOadaFrontendInfo = (state: RootState): OadaFrontendInfo | undefined => {
  const response = state.oadaActions.getOadaFrontendInfoResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail') {
    console.error(`Failed to get oada frontend info: ${response.contents}`)
    return undefined
  } else {
    return response.contents
  }
}

export const selectOadaLpToken = (state: RootState): Token | undefined => {
  const response = state.oadaActions.getOadaFrontendInfoResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail' || response.contents === undefined) {
    console.error(`Failed to get oada frontend info: ${response.contents}`)
    return undefined
  } else {
    const [policyId, tokenName] = response.contents.lpAssetClass.split('.')
    return {
      policyId,
      tokenName
    }
  }
}

export const selectStakeLockHistoricVolume = (state: RootState): number | undefined => {
  const response = state.oadaActions.getStakeLockHistoricVolumeResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail') {
    console.error(`Failed to get stake lock historic volume: ${response.contents}`)
    return undefined
  } else {
    return response.contents
  }
}

export const selectSoadaHistoricalReturn = (state: RootState): SoadaHistoricalReturn | undefined => {
  const response = state.oadaActions.getSoadaHistoricalReturnResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail') {
    console.error(`Failed to get sOADA historical return: ${response.contents}`)
    return undefined
  } else {
    return response.contents
  }
}

export const selectStakeAuctionVolume = (state: RootState): StakeAuctionVolume | undefined => {
  const response = state.oadaActions.getStakeAuctionVolumeResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail') {
    console.error(`Failed to get stake auction volume: ${response.contents}`)
    return undefined
  } else {
    return response.contents
  }
}

export type StakeAuctionVolumeData = {
  cumulativeVolume: number,
  intervals: StakeAuctionVolume
}

export const selectStakeAuctionVolumeData = (state: RootState): StakeAuctionVolumeData => {
  return {
    cumulativeVolume: selectStakeLockHistoricVolume(state) || 0,
    intervals: selectStakeAuctionVolume(state) || {}
  }
}

export const selectSoadaApyMovingAverage = (beforeEpoch?: number, epochCount: number = 6) => (state: RootState): number => {
  const oadaFrontendInfo = selectOadaFrontendInfo(state)
  const soadaHistoricalReturn = selectSoadaHistoricalReturn(state)
  let lastEpoch = beforeEpoch || (oadaFrontendInfo && relativeEpochToAbsoluteEpoch(oadaFrontendInfo?.currEpoch))
  if (soadaHistoricalReturn === undefined || lastEpoch === undefined)
    return 0.0

  lastEpoch -= 1

  let apySum = 0.0
  for (let i = 0; i < epochCount; i++) {
    const r = soadaHistoricalReturn[lastEpoch - i]
    const apy = (Math.round(1000 * Math.pow((r.numerator / r.denominator), 73)) / 1000) - 1.0 || 0.0
    apySum += apy
  }

  return Math.round(1000 * (apySum / epochCount)) / 1000
}

export const selectUnlockOptimizResponse = (state: RootState): BasicResponse<string> | undefined => {
  return state.oadaActions.unlockOptimizResponse
}

export const selectOptimizToOptimInfo = (state: RootState): OptimizToOptimInfo | undefined => {
  const response = state.oadaActions.getOptimizToOptimInfoResponse
  if (response === undefined) {
    return undefined
  } else if (response.tag === 'Fail') {
    console.error(`Failed to get optimiz to optim info: ${response.contents}`)
    return undefined
  } else {
    return response.contents
  }
}

/**
 * Wallet UTxO Management
 * Retrieves and processes UTxOs from the connected wallet
 * Handles collateral and virtual wallet state management
 */
const getWalletUtxos = async (wallet: UITypes.Wallets.Wallet): Promise<[UTxO[], string]> => {
  const { utxos, collateralUtxos } = await getUtxos(wallet)
  const collateralUtxoTxOutRefs = collateralUtxos.map(lucidToGYTxOutRef)
  const nonCollateralUtxos = utxos.filter(utxo => !collateralUtxoTxOutRefs.includes(lucidToGYTxOutRef(utxo)))
  const mostRecentUtxos = getLatestUtxosFromPersistedVirtualWalletUtxoMap(nonCollateralUtxos)
  const userChangeAddress = await lucid.wallet.address()
  return [mostRecentUtxos, userChangeAddress]
}

/**
 * Transaction Recipe Processing
 * Handles the building, signing, and submission of transactions
 * Manages virtual wallet state updates after successful transactions
 */
const getRecipeBuildSendTx = async (
  utxos: UTxO[],
  changeAddress: string,
  rawResponse: Response,
  extraRecipe?: (recipe: TxRecipe) => TxRecipe
) => {
  const response: BasicResponse<TxRecipe> = await rawResponse.json();

  if (response.tag === 'Fail') {
    return response
  }

  const txRecipe = extraRecipe ? extraRecipe(response.contents) : response.contents
  const incompleteTx = txRecipeToTx(lucid)(txRecipe)
  console.log('AFTER')

  const unsignedTx = await incompleteTx.complete({
    change: {
      address: changeAddress
    },
    utxos: utxos
  }).catch(error => { return JSON.stringify(error) })

  if (typeof unsignedTx === 'string') {
    return { tag: 'Fail' as const, contents: `${unsignedTx}` }
  }

  console.log(`Hash: ${unsignedTx.toHash()}`)
  console.log(`Cbor: ${unsignedTx.toString()}`)

  const signedTx = await unsignedTx.sign().complete()

  const signedTxCbor = signedTx.toString()
  const signedTxRequest = {
    txCborHex: signedTxCbor
  }
  const signedTxRequestOptions = {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: Json.stringify(signedTxRequest),
  }
  lucid.wallet.submitTx(signedTxCbor)
  const rawSignedTxResponse = await fetch(
    `${oadaEndpointsUrl}/submit-tx`,
    signedTxRequestOptions
  )

  const signedTxResponse: BasicResponse<string> = await rawSignedTxResponse.json()
  console.log('Submit tx response:')
  console.log(signedTxResponse)

  if (signedTxResponse.tag === 'OK') {
    const coreTxBody = signedTx.txSigned.body()
    const userInputRefs = utxos.map(utxo => {
      return `${utxo.txHash}#${utxo.outputIndex}`
    })
    const userAddressSet = new Set([changeAddress, ...utxos.map(utxo => utxo.address)])
    const virtualWalletUtxoMap = makeVirtualWalletUtxoMap(userInputRefs, userAddressSet, coreTxBody)
    const knownTxIds = utxos.map(utxo => `${utxo.txHash}#${utxo.outputIndex}`)
    updatePersistedVirtualWalletUtxoMap(knownTxIds, virtualWalletUtxoMap)
  }

  return signedTxResponse
}

/**
 * Clearing Rate Calculation
 * Implements the sigmoid function for calculating clearing rates
 * T parameter represents time and should be in range [0, 100]
 */
const calcClearingRate = (baseRate: Big, projectedRate: Big, sigmoidScalar: Big, sr: Big, r: Big, t: Big) => {
  const t_centered = t.sub(50)
  const t_normed = t.div(100)
  const t_centered_normed = t_centered.div(100)
  const sr_r_ratio = sr.div(r)

  const factorExponent = Big('5.6').add(Big('2.6').mul(t_normed)).toNumber()
  const factor = t_normed.lt(sr_r_ratio)
    ? Big(Big(1).add((sr_r_ratio.sub(t_normed)).div(Big(1).sub(t_normed))).toNumber() ** factorExponent)
    : Big(1)

  const exponential = Math.exp(Big(-1).mul(t_centered_normed.mul(sigmoidScalar)).toNumber())

  const clearingRate = baseRate.add(projectedRate.mul(Big(1).sub(Big(1).div(Big(1).add(exponential)))).mul(factor))

  return clearingRate
}

/**
 * Bid Amount to Requested Size Conversion
 * Converts a bid amount to the requested stake size based on the APR
 * @param bidAmount The amount being bid
 * @param bidApr The annual percentage rate in tenths of a percent
 * @returns The calculated requested stake size
 */
export const bidAmountToRequestedSize = (bidAmount: Big, bidApr: Big) => {
  return bidAmount.mul(1000).mul(73).div(bidApr)
}

/**
 * Bid Amount to Clearing Rate Calculation
 * Performs binary search to find the clearing rate that matches the bid APR
 * @param bidAmount Amount being bid
 * @param sr Staked reserves
 * @param r Total reserves
 * @param t Time parameter [0-100]
 * @param limit Maximum iterations for binary search
 * @param initMinBidApr Initial minimum bid APR
 * @param initMaxBidApr Initial maximum bid APR
 * @param initBidApr Initial bid APR
 * @returns Calculated clearing rate
 */
export const bidAmountToClearingRate = (
  bidAmount: Big, sr: Big, r: Big, t: Big, limit: number, initMinBidApr: Big, initMaxBidApr: Big, initBidApr: Big
) => {
  let prevMinBidApr = initMinBidApr
  let prevMaxBidApr = initMaxBidApr
  let prevBidApr = initBidApr
  const prevRequestedBidStakeSize = bidAmountToRequestedSize(bidAmount, initBidApr)
  let prevPotentialStakedReserves = sr.add(prevRequestedBidStakeSize)
  const potentialReserves = r
  let prevCr = Big(1000).mul(calcClearingRate(
    oadaNetwork.baseRate,
    oadaNetwork.projectedRate,
    oadaNetwork.sigmoidScalar,
    prevPotentialStakedReserves,
    potentialReserves,
    t
  ))

  let count = 0

  while (count < limit && !(prevCr.gte(prevBidApr) && prevCr.sub(prevBidApr).lte('1e-6'))) {
    if (prevCr.gt(prevBidApr)) {
      const nextMinBidApr = prevBidApr
      const nextMaxBidApr = prevMaxBidApr
      const nextBidApr = prevBidApr.add(prevMaxBidApr.sub(prevBidApr).div(2))
      const nextRequestedBidStakeSize = bidAmountToRequestedSize(bidAmount, nextBidApr)
      prevMinBidApr = nextMinBidApr
      prevMaxBidApr = nextMaxBidApr
      prevBidApr = nextBidApr
      prevPotentialStakedReserves = sr.add(nextRequestedBidStakeSize)
    } else {
      const nextMinBidApr = prevMinBidApr
      const nextMaxBidApr = prevBidApr
      const nextBidApr = prevBidApr.sub(prevBidApr.sub(prevMinBidApr).div(2))
      const nextRequestedBidStakeSize = bidAmountToRequestedSize(bidAmount, nextBidApr)
      prevMinBidApr = nextMinBidApr
      prevMaxBidApr = nextMaxBidApr
      prevBidApr = nextBidApr
      prevPotentialStakedReserves = sr.add(nextRequestedBidStakeSize)
    }
    prevCr = Big(1000).mul(calcClearingRate(
      oadaNetwork.baseRate,
      oadaNetwork.projectedRate,
      oadaNetwork.sigmoidScalar,
      prevPotentialStakedReserves,
      potentialReserves,
      t
    ))
    ++count
  }
  if (count >= limit) {
    console.log('Clearing rate search limit reached')
  }

  return prevCr.round(0, Big.roundUp)
}

export const stakeAmountToClearingRate = (
  stakeAmountAsLovelace: Big, sr: Big, r: Big, t: Big
) => {
  const requestedBidStakeSize = stakeAmountAsLovelace
  const stakedReserves = sr.add(requestedBidStakeSize)
  const reserves = r

  const cr = Big(1000).mul(calcClearingRate(
    oadaNetwork.baseRate,
    oadaNetwork.projectedRate,
    oadaNetwork.sigmoidScalar,
    stakedReserves,
    reserves,
    t
  ))

  return cr.round(0, Big.roundUp)
}

type BuyOadaRequest = {
  amount: bigint
}

export const buyOada = createAsyncThunk<
  BasicResponse<string>,
  BuyOadaRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'buyOada',
  async (request: BuyOadaRequest, thunkApi) => {
    console.log('BUY OADA', request)

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(request),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/buy-oada`,
      requestOptions,
    );

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const addFee = (recipe: TxRecipe) => {
      oadaFeeAddress && oadaMintFee && recipe.txOuts.push({
        address: oadaFeeAddress,
        value: { 'lovelace': oadaMintFee },
        datum: null,
        refScript: null
      })
      return recipe
    }
    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse, addFee)

    return signedTxResponse
  }
)

type StakeOadaRequest = {
  amount: bigint
}

export const stakeOada = createAsyncThunk<
  BasicResponse<string>,
  StakeOadaRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'stakeOada',
  async (request: StakeOadaRequest, thunkApi) => {
    console.log('STAKE OADA', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const serverRequest = {
      ownerPkh,
      returnAddressBech32: changeAddress,
      amount: request.amount,
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/stake-oada`,
      requestOptions,
    );

    const addFee = (recipe: TxRecipe) => {
      oadaFeeAddress && oadaStakeFee && recipe.txOuts.push({
        address: oadaFeeAddress,
        value: { 'lovelace': oadaStakeFee },
        datum: null,
        refScript: null
      })
      return recipe
    }
    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse, addFee)

    return signedTxResponse
  }
)

type UnstakeOadaRequest = {
  amount: bigint
}

export const unstakeOada = createAsyncThunk<
  BasicResponse<string>,
  UnstakeOadaRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'unstakeOada',
  async (request: UnstakeOadaRequest, thunkApi) => {
    console.log('UNSTAKE OADA', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const serverRequest = {
      ownerPkh,
      returnAddressBech32: changeAddress,
      amount: request.amount,
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/unstake-oada`,
      requestOptions,
    );

    const addFee = (recipe: TxRecipe) => {
      oadaFeeAddress && oadaStakeFee && recipe.txOuts.push({
        address: oadaFeeAddress,
        value: { 'lovelace': oadaStakeFee },
        datum: null,
        refScript: null
      })
      return recipe
    }
    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse, addFee)

    return signedTxResponse
  }
)

export type GYValue = {
  lovelace: string,
  [assetClass: string]: string
}

export type GYValueOut = {
  lovelace: bigint,
  [assetClass: string]: bigint
}

export const lucidToGYTxOutRef = (utxo: UTxO): string => {
  return utxo.txHash + "#" + utxo.outputIndex.toString()
}

export type BidType = "BidTypePartial" | "BidTypeFull"
type StakeAuctionBidRequest = {
  bidType: BidType,
  bidApy: Big,
  bidValue: GYValueOut,
  stakeAddressBech32: string
}

/**
 * Stake Auction Bid Action
 * Async thunk for placing bids in the stake auction
 * Handles bid validation, transaction creation, and submission
 */
export const stakeAuctionBid = createAsyncThunk<
  BasicResponse<string>,
  StakeAuctionBidRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'stakeAuctionBid',
  async (request: StakeAuctionBidRequest, thunkApi) => {
    console.log('STAKE AUCTION BID', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)
    const stakeAddress = addressToStakeAddress(changeAddress)
    console.error(`stakeAddress: ${stakeAddress}`)

    if (stakeAddress === null) {
      return { tag: 'Fail', contents: `Could not get stake address from ${changeAddress}` }
    }

    const serverRequest = {
      ownerPkh,
      stakeAddressBech32: request.stakeAddressBech32,
      bidType: request.bidType,
      bidApy: BigInt(request.bidApy.toString()),
      bidValue: request.bidValue,
    }

    console.error(Json.stringify(serverRequest))

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/stake-auction-bid`,
      requestOptions,
    );

    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse)

    return signedTxResponse
  }
)

/**
 * Cancel Stake Auction Bid Request Interface
 * Defines the structure for canceling auction bid requests
 */
type CancelStakeAuctionBidRequest = {
  bidId: string,
}

/**
 * Cancel Stake Auction Bid Action
 * Async thunk for canceling existing stake auction bids
 * Handles bid cancellation and transaction submission
 */
export const cancelStakeAuctionBid = createAsyncThunk<
  BasicResponse<string>,
  CancelStakeAuctionBidRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'cancelStakeAuctionBid',
  async (request: CancelStakeAuctionBidRequest, thunkApi) => {
    console.log('CANCEL STAKE AUCTION BID', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const serverRequest = {
      ownerPkh,
      txOutRef: bidIdToTxOutRef(request.bidId)
    }

    console.error(Json.stringify(serverRequest))

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/cancel-stake-auction-bid`,
      requestOptions,
    );

    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse)

    return signedTxResponse
  }
)

/**
 * Cancel Stake Order Request Interface
 * Defines the structure for canceling stake order requests
 */
type CancelStakeOrderRequest = {
  orderId: string,
}

/**
 * Cancel Stake Order Action
 * Async thunk for canceling existing stake orders
 * Handles order cancellation and transaction submission
 */
export const cancelStakeOrder = createAsyncThunk<
  BasicResponse<string>,
  CancelStakeOrderRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'cancelStakeOrder',
  async (request: CancelStakeOrderRequest, thunkApi) => {
    console.log('CANCEL STAKE ORDER', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const serverRequest = {
      ownerPkh,
      txOutRef: request.orderId
    }

    console.error(Json.stringify(serverRequest))

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/cancel-stake-unstake-order`,
      requestOptions,
    );

    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse)

    return signedTxResponse
  }
)

/**
 * Stake Auction Bid View Interface
 * Defines the structure for viewing stake auction bid information
 */
export type StakeAuctionBidView = {
  txOutRef: string,
  assetClass: string,
  apy: number,
  amount: number,
  ownerPkh: string,
  bidType: BidType,
  stakeAddressBech32: string,
}

/**
 * Staking AMO View Interface
 * Defines the structure for viewing Automated Market Operations (AMO) staking information
 */
export type StakingAmoView = {
  odaoFeeBps: number,
  odaoSoada: number,
  soadaAmount: number,
  soadaBackingLovelace: number,
  soadaLimit: number
}

/**
 * Batch Stake View Interface
 * Defines the structure for viewing batch staking information
 */
export type BatchStakeView = {
  adaAmount: number,
  oadaAmount: number,
  soadaAmount: number
}

/**
 * Stable Pool View Interface
 * Defines the structure for viewing stable pool information
 */
export type StablePoolView = {
  stablePoolBaseAmount: number
  stablePoolOadaAmount: number
  stablePoolCircLpAmount: number
}

/**
 * OADA Stake Order View Interface
 * Defines the structure for viewing OADA stake order information
 */
export type OadaStakeOrderView = {
  txOutRef: string
  oadaAmount: number
  adaAmount: number
  returnAddressBech32: string
}

/**
 * OADA Unstake Order View Interface
 * Defines the structure for viewing OADA unstake order information
 */
export type OadaUnstakeOrderView = {
  txOutRef: string
  soadaAmount: number
  adaAmount: number
  returnAddressBech32: string
}

/**
 * OADA Frontend Info Interface
 * Comprehensive interface for frontend display of OADA protocol information
 */
export type OadaFrontendInfo = {
  baseAssetClass: string,
  oadaAssetClass: string,
  soadaAssetClass: string,
  lpAssetClass: string,
  stakedReserves: number,
  totalReserves: number,
  timeIntervalIndex: number,
  currEpoch: number,
  currEpochEndPosixTime: number,
  clearingRate: number,
  stakingAmoView: StakingAmoView
  batchStakesView: BatchStakeView,
  stablePoolView: StablePoolView,
  ownerOadaStakeOrderViews: OadaStakeOrderView[],
  ownerOadaUnstakeOrderViews: OadaUnstakeOrderView[],
  bidViews: StakeAuctionBidView[],
  ownerBidViews: StakeAuctionBidView[],
}

/**
 * Get OADA Frontend Info Action
 * Async thunk for retrieving comprehensive OADA protocol information
 * Includes staking data, pool information, and user-specific views
 */
export const getOadaFrontendInfo = createAsyncThunk<
  BasicResponse<OadaFrontendInfo>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getOadaFrontendInfo',
  async (_request: void, thunkApi) => {
    console.log('GET OADA INFO')

    const wallet = thunkApi.getState().wallet.wallet
    let ownerPkh: string | null = null
    if (wallet !== null) {
      const [, changeAddress] = await getWalletUtxos(wallet)
      ownerPkh = bech32AddressToPaymentPkh(changeAddress)
    }

    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const queryParam =
      ownerPkh !== null
        ? `?owner_pkh=${ownerPkh}`
        : ''
    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/get-oada-frontend-info/${queryParam}`,
      requestOptions,
    );

    const response: BasicResponse<OadaFrontendInfo> = await rawResponse.json();
    return response
  }
)

/**
 * Get Stake Lock Historic Volume Action
 * Async thunk for retrieving historical staking volume data
 */
export const getStakeLockHistoricVolume = createAsyncThunk<
  BasicResponse<number>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getStakeLockHistoricVolume',
  async (_request: void) => {
    console.log('GET STAKE LOCK HISTORIC VOLUME')
    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/stake-lock-historic-vol`,
      requestOptions,
    );

    const response: BasicResponse<number> = await rawResponse.json();
    return response
  }
)

/**
 * sOADA Historical Return Interface
 * Defines the structure for historical sOADA return data by epoch
 */
export type SoadaHistoricalReturn = {
  [epoch: string]: { "numerator": number, "denominator": number }
}

/**
 * Get sOADA Historical Return Action
 * Async thunk for retrieving historical sOADA return data
 */
export const getSoadaHistoricalReturn = createAsyncThunk<
  BasicResponse<SoadaHistoricalReturn>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getSoadaHistoricalReturn',
  async (_request: void, _thunkApi) => {
    console.log('GET SOADA HISTORICAL RETURN')
    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/soada-historical-return`,
      requestOptions,
    );

    const response: BasicResponse<SoadaHistoricalReturn> = await rawResponse.json();
    return response
  }
)

/**
 * Stake Auction Volume Interface
 * Defines the structure for stake auction volume data by timeframe
 */
export type StakeAuctionVolume = {
  [timeframe: string]: number
}

/**
 * Get Stake Auction Volume Action
 * Async thunk for retrieving stake auction volume data across different timeframes
 */
export const getStakeAuctionVolume = createAsyncThunk<
  BasicResponse<StakeAuctionVolume>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getStakeAuctionVolume',
  async (_request: void, _thunkApi) => {
    console.log('GET STAKE AUCTION VOLUME')
    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const timeFrames = ['1D', '7D', '30D']
    const timeFrameQueries = timeFrames.map(t => `timeframe[]=${t}`).join('&')
    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/stake-auction-volume?${timeFrameQueries}`,
      requestOptions,
    );

    const response: BasicResponse<StakeAuctionVolume> = await rawResponse.json();
    return response
  }
)

/**
 * Token Interface
 * Defines the structure for Cardano native tokens
 */
type Token = {
  policyId: string,
  tokenName: string,
}

/**
 * OADA General Info Interface
 * Comprehensive interface for OADA protocol configuration and state
 * Includes network parameters, token configurations, and protocol settings
 */
type OadaGeneralInfo = {
  networkId: string
  , adminToken: Token
  , feeClaimerToken: Token
  , baseAssetClass: string
  , oadaToken: Token
  , soadaToken: Token
  , feeClaimRuleWhitelistNft: Token
  , depositRuleNft: Token
  , oadaStakeRuleNft: Token
  , soadaStakeRuleNft: Token
  , controllerWhitelistNft: Token
  , stakingAmoNft: Token
  , dexStrategyWhitelistNft: Token
  , dexStrategyConfigWhitelistNft: Token
  , dexStrategyConfigWhitelistTxOutRef: string
  , dexStrategyRuleNft: Token
  , maxLpTokenAmount: bigint
  , depositGuardNum: bigint
  , depositGuardDen: bigint
  , collateralAmoNft: Token
  , collateralAmoTxOutRef: string
  , collateralAmoAmount: bigint
  , depositTxOutRefs: string
  , depositsAmount: bigint
  , unlockableStakeLocksTxOutRefs: string
  , unlockableStakeLocksAmount: bigint
  , lockedStakeLocksTxOutRefs: string
  , lockedStakeLocksAmount: bigint
  , dexStrategyNft: Token
  , dexStrategyTxOutRef: string
  , dexStrategyAmount: bigint
  , stablePoolNft: Token
  , stablePoolTxOutRef: string
  , stablePoolAmount: bigint
  , stablePoolLpToken: Token
  , amplCoeff: bigint
  , lpFeeNum: bigint
  , protocolFeeNum: bigint
}

/**
 * Get OADA General Info Action
 * Async thunk for retrieving comprehensive protocol configuration and state
 */
export const getOadaGeneralInfo = createAsyncThunk<
  BasicResponse<OadaGeneralInfo>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getOadaGeneralInfo',
  async (_request: void, thunkApi) => {
    console.log('GET OADA INFO')

    const wallet = thunkApi.getState().wallet.wallet!
    const [, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/get-oada-frontend-info/${ownerPkh}`,
      requestOptions,
    );

    const response: BasicResponse<OadaGeneralInfo> = await rawResponse.json();

    return response
  }
)

// Optimiz Locks
/**
 * Unlock Optimiz Request Interface
 * Defines the structure for Optimiz token unlock requests
 */
type UnlockOptimizRequest = {
  optimizLockId: string,
}

/**
 * Unlock Optimiz Action
 * Async thunk for unlocking Optimiz tokens
 * Handles transaction creation and submission for token unlocking
 */
export const unlockOptimiz = createAsyncThunk<
  BasicResponse<string>,
  UnlockOptimizRequest,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'unlockOptimiz',
  async (request: UnlockOptimizRequest, thunkApi) => {
    console.log('UNLOCK OPTIMIZ', request)

    const wallet = thunkApi.getState().wallet.wallet!
    const [utxos, changeAddress] = await getWalletUtxos(wallet)

    const ownerPkh = bech32AddressToPaymentPkh(changeAddress)

    const serverRequest = {
      txOutRef: request.optimizLockId,
      ownerPkh,
      returnAddressBech32: changeAddress
    }

    console.error(Json.stringify(serverRequest))

    const requestOptions = {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: Json.stringify(serverRequest),
    };

    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/unlock-optimiz`,
      requestOptions,
    );

    const signedTxResponse = await getRecipeBuildSendTx(utxos, changeAddress, rawResponse)

    return signedTxResponse
  }
)

/**
 * Optimiz Lock View Interface
 * Defines the structure for viewing Optimiz lock information
 */
export type OptimizLockView = {
  txOutRef: string,
  oadaAmount: number,
  optimizAmount: number,
  optimAmount: number,
  lovelaceAmount: number,
  startPosixTime: number,
  maxLockupDays: number,
  lockupRatio: [number, number],
  earlyForfeitRatio: [number, number],
  ownerPkh: string
}

/**
 * Optimiz to Optim Info Interface
 * Defines the structure for Optimiz to Optim conversion information
 */
export type OptimizToOptimInfo = {
  ownerOptimizLockViews: OptimizLockView[]
}

/**
 * Get Optimiz to Optim Info Action
 * Async thunk for retrieving Optimiz to Optim conversion information
 * Includes lock views and conversion parameters
 */
export const getOptimizToOptimInfo = createAsyncThunk<
  BasicResponse<OptimizToOptimInfo>,
  void,
  {
    dispatch: AppDispatch,
    state: RootState,
    extra: Services,
    rejectValue: FailResponse
  }
>(
  'getOptimizToOptimInfo',
  async (_request: void, thunkApi) => {
    console.log('GET OPTIMIZ TO OPTIM INFO')

    const wallet = thunkApi.getState().wallet.wallet
    let ownerPkh: string | null = null
    if (wallet !== null) {
      const [, changeAddress] = await getWalletUtxos(wallet)
      ownerPkh = bech32AddressToPaymentPkh(changeAddress)
    }

    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const queryParam =
      ownerPkh !== null
        ? `?owner_pkh=${ownerPkh}`
        : ''
    const rawResponse = await fetch(
      `${oadaEndpointsUrl}/optimiz-to-optim-info/${queryParam}`,
      requestOptions,
    );

    const response: BasicResponse<OptimizToOptimInfo> = await rawResponse.json();
    return response
  }
)
