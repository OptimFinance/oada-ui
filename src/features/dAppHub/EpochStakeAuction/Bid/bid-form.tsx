import Big from "big.js";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { GYValueOut } from "src/oada/actions";
import { BasicResponse, basicResponseToAlert, max, min } from "src/utils";
import { Attention } from "src/components/Attention";
import { Slider } from "src/components/Slider";
import { Button } from "src/components/ui/button";
import { CustomIcon } from "src/components/ui/custom-icon";
import { Input } from "src/components/ui/input";
import { Separator } from "src/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { Text } from "src/components/ui/typography";
import { oadaNetwork } from "src/network";
import { bidAmountToClearingRate, bidAmountToRequestedSize, BidType, cancelStakeAuctionBid, getOadaFrontendInfo, selectCancelStakeAuctionBidResponse, selectOadaFrontendInfo, selectStakeAuctionBidResponse, stakeAmountToClearingRate, stakeAuctionBid } from "src/oada/actions";
import { lucid, useAppDispatch, useAppSelector } from "src/store/hooks";
import { setAlert } from "src/store/slices/alertSlice";
import { selectPartialWalletUtxos, selectWalletLovelaceAmount, sumAssets, updateWalletUtxosThunk } from "src/store/slices/walletSlice";
import {
  formatNumberWithSuffix,
} from "src/utils/formatNumbers";
import {BidView, formatBidView, txOutRefToBidId} from "src/oada/view";
import {Collapse} from "@mui/material";
import {Card} from "src/components/ui/card";
import {cn} from "src/utils/tailwind";
import {relativeEpochToAbsoluteEpoch} from "src/utils";

type OrderType = "market" | "limit";
type LimitOrderType = "fillOrKill" | "partialFill";
type CurrencyChoice = "ada" | "oada";


type ParseInputResult = {
  tag: "ParseOk"
  amount: Big
} | {
  tag: "ParseGtMax"
  amount: Big
} | {
  tag: "ParseLtMin"
  amount: Big
} | undefined

// if min > max then use max as min
const parseInputAmount = (
  minAmount: Big | undefined,
  maxAmount: Big | undefined,
  f: (amount: Big) => Big
) => (input: string): ParseInputResult => {
  const pattern = /^\d*\.?\d{0,6}$/;
  let lb = undefined
  if (minAmount !== undefined && maxAmount !== undefined) {
    lb = min(minAmount, maxAmount)
  } else if (minAmount !== undefined) {
    lb = minAmount
  }
  const ub = maxAmount
  if (input === '') {
    if (minAmount !== undefined) {
      return { tag: "ParseOk", amount: minAmount }
    } else {
      return undefined
    }
  } else if (input.match(pattern)) {
    const candidateAmount = f(Big(input))
    if (lb !== undefined && candidateAmount.lt(lb)) {
      return { tag: "ParseLtMin", amount: lb }
    } else if (ub !== undefined && candidateAmount.gt(ub)) {
      return { tag: "ParseGtMax", amount: ub }
    } else {
      return { tag: "ParseOk", amount: candidateAmount }
    }
  } else {
    return undefined
  }
}

const parseInputAda = (minLovelace: Big | undefined, maxLovelace: Big | undefined) => (input: string): ParseInputResult => {
  return parseInputAmount(minLovelace, maxLovelace, (amount) => amount.mul(oneAdaAsLovelace))(input)
}

// requestedStakeAmount = floor (1000 * 73 * bidAmount / bidApy)
export const calcRequestedStakeAmount = bidAmountToRequestedSize

// totalBidAmount = requestedStakeAmount * bidApy / 1000 / 73
const calcTotalBidAmount = (requestedStakeAmount: Big, bidApy: Big): Big => {
  return requestedStakeAmount.mul(bidApy).div(1000).div(73);
}

const oneAdaAsLovelace = Big(1_000_000)

const maxLovelace = Big("45000000000000000")

const initialMinBidApy = Big(25)
const initialMaxBidApy = Big(999999)
const initialBidApy = initialMinBidApy

const initialMinBidRequestedStakeLovelace = Big(250_000_000_000)
const initialMaxBidRequestedStakeLovelace = maxLovelace
const initialBidRequestedStakeLovelace = initialMinBidRequestedStakeLovelace

const initialMinBidLovelace = calcTotalBidAmount(initialMinBidRequestedStakeLovelace, initialBidApy).round(0, Big.roundUp)
const initialMaxBidLovelace = calcTotalBidAmount(initialMaxBidRequestedStakeLovelace, initialBidApy).round(0, Big.roundUp)
const initialBidLovelace = initialMinBidLovelace


type LastInputModified = "bidInput" | "apyInput" | "requestedStakeInput"

type MarketOrderState = {
  totalReservesLovelace: Big,
  stakedReservesLovelace: Big,
  timeIntervalIndex: Big,
  minBidLovelace: Big,
  maxBidLovelace: Big,
  minBidApy: Big,
  maxBidApy: Big,
  minBidRequestedStakeLovelace: Big,
  maxBidRequestedStakeLovelace: Big,
  bidLovelace: Big,
  bidApy: Big,
  bidRequestedStakeLovelace: Big,
}

type MarketOrderStateChange = {
  totalReservesLovelace?: Big,
  stakedReservesLovelace?: Big,
  timeIntervalIndex?: Big,
  bidLovelace?: Big,
  bidRequestedStakeLovelace?: Big,
}

// NOTE: When the user enters in the requested stake amount it is possible to
// get a bid amount that is different than if they entered the bid amount that
// calculates the same requested stake amount.
// This is because when calculating the requested stake amount from the bid
// amount we calculate the clearing rate and round it up. Then we use the
// rounded up clearing rate to calculate the requested stake amount. If we
// enter a requested stake amount directly, we calculate the clearing rate
// from it. Since the requested amount is based on a rounded up clearing rate,
// calculating the clearing rate directly from the requested stake amount can
// result in a different clearing rate hence a different calculated bid
// amount.
// There are some ways to get around it, specifically it makes sense to add an
// additional input for the entered requested stake amount and exact requested
// stake amount, and whenever they enter input we calculate the bid amount
// then recalculate the requested stake using that bid amount but it is not
// clear if that is better UX.
// So we just allow the fact that the requested stake amount can result in a
// bid amount that is different than intuition suggests. It only gets a bit
// ugly when you see that we can go below the minimum amount of ADA by about
// 500_000 lovelace in some conditions.
const updateMarketOrderState = (
  state: MarketOrderState, lastInputModified: LastInputModified, change: MarketOrderStateChange
): MarketOrderState => {
  const iterationLimit = 100
  const minSearchBidApy = Big(1)
  const maxSearchBidApy = Big(999999)
  const initBidApr = Big(1)
  const totalReservesLovelace =
    change.totalReservesLovelace === undefined
      ? state.totalReservesLovelace
      : change.totalReservesLovelace
  const stakedReservesLovelace =
    change.stakedReservesLovelace === undefined
      ? state.stakedReservesLovelace
      : change.stakedReservesLovelace
  const availableReserves = totalReservesLovelace.sub(stakedReservesLovelace)
  const timeIntervalIndex =
    change.timeIntervalIndex === undefined
      ? state.timeIntervalIndex
      : change.timeIntervalIndex
  let minBidLovelace = state.minBidLovelace
  let maxBidLovelace = state.maxBidLovelace
  let bidLovelace =
    change.bidLovelace === undefined
      ? state.bidLovelace
      : change.bidLovelace
  let minBidApy = state.minBidApy
  let maxBidApy = state.maxBidApy
  let bidApy = state.bidApy
  let minBidRequestedStakeLovelace = state.minBidRequestedStakeLovelace
  let maxBidRequestedStakeLovelace = state.maxBidRequestedStakeLovelace
  let bidRequestedStakeLovelace =
    change.bidRequestedStakeLovelace === undefined
      ? state.bidRequestedStakeLovelace
      : change.bidRequestedStakeLovelace


  if (availableReserves.eq(0)) {
    minBidLovelace = Big(0)
    minBidApy = Big(0)
    minBidRequestedStakeLovelace = Big(0)
    maxBidApy = Big(0)
    maxBidLovelace = Big(0)
    maxBidRequestedStakeLovelace = Big(0)
  } else {
    minBidApy = bidAmountToClearingRate(
      minBidLovelace,
      stakedReservesLovelace,
      totalReservesLovelace,
      timeIntervalIndex,
      iterationLimit,
      minSearchBidApy,
      maxSearchBidApy,
      initBidApr
    )
    const minBidStakeAmount = calcRequestedStakeAmount(minBidLovelace, minBidApy)
    if (minBidStakeAmount.lt(initialMinBidRequestedStakeLovelace)) {
      minBidRequestedStakeLovelace = initialMinBidRequestedStakeLovelace
    } else {
      minBidRequestedStakeLovelace = minBidStakeAmount
    }
    minBidLovelace = calcTotalBidAmount(minBidRequestedStakeLovelace, minBidApy).round(0, Big.roundUp)
    maxBidApy = stakeAmountToClearingRate(
      availableReserves,
      stakedReservesLovelace,
      totalReservesLovelace,
      timeIntervalIndex,
    )
    maxBidLovelace = calcTotalBidAmount(availableReserves, maxBidApy)
    maxBidRequestedStakeLovelace = availableReserves
    if (lastInputModified === 'bidInput') {
      bidApy = bidAmountToClearingRate(
        bidLovelace,
        stakedReservesLovelace,
        totalReservesLovelace,
        timeIntervalIndex,
        iterationLimit,
        minSearchBidApy,
        maxSearchBidApy,
        initBidApr
      )
      bidRequestedStakeLovelace = calcRequestedStakeAmount(bidLovelace, bidApy)
    } else if (lastInputModified === 'requestedStakeInput') {
      bidApy = stakeAmountToClearingRate(
        bidRequestedStakeLovelace,
        stakedReservesLovelace,
        totalReservesLovelace,
        timeIntervalIndex,
      )
      bidLovelace = calcTotalBidAmount(bidRequestedStakeLovelace, bidApy).round(0, Big.roundUp)
      bidApy = bidAmountToClearingRate(
        bidLovelace,
        stakedReservesLovelace,
        totalReservesLovelace,
        timeIntervalIndex,
        iterationLimit,
        minSearchBidApy,
        maxSearchBidApy,
        initBidApr
      )
      bidRequestedStakeLovelace = calcRequestedStakeAmount(bidLovelace, bidApy)
    }
  }
  return {
    ...state,
    totalReservesLovelace,
    stakedReservesLovelace,
    timeIntervalIndex,
    minBidLovelace,
    maxBidLovelace,
    minBidApy,
    maxBidApy,
    minBidRequestedStakeLovelace,
    maxBidRequestedStakeLovelace,
    bidLovelace,
    bidApy,
    bidRequestedStakeLovelace,
  }
}

type LimitOrderState = {
  totalReservesLovelace: Big,
  stakedReservesLovelace: Big,
  timeIntervalIndex: Big,
  minBidLovelace: Big,
  maxBidLovelace: Big,
  minBidApy: Big,
  maxBidApy: Big,
  minBidRequestedStakeLovelace: Big,
  maxBidRequestedStakeLovelace: Big,
  bidLovelace: Big,
  bidApy: Big,
  bidRequestedStakeLovelace: Big,
}

type LimitOrderStateChange = {
  totalReservesLovelace?: Big,
  stakedReservesLovelace?: Big,
  timeIntervalIndex?: Big,
  bidLovelace?: Big,
  bidApy?: Big,
  bidRequestedStakeLovelace?: Big,
}

const updateLimitOrderState = (
  state: LimitOrderState, lastInputModified: LastInputModified, change: LimitOrderStateChange
): LimitOrderState => {
  const totalReservesLovelace =
    change.totalReservesLovelace === undefined
      ? state.totalReservesLovelace
      : change.totalReservesLovelace
  const stakedReservesLovelace =
    change.stakedReservesLovelace === undefined
      ? state.stakedReservesLovelace
      : change.stakedReservesLovelace
  const timeIntervalIndex =
    change.timeIntervalIndex === undefined
      ? state.timeIntervalIndex
      : change.timeIntervalIndex
  const minBidLovelace = state.minBidLovelace
  const maxBidLovelace = state.maxBidLovelace
  const minBidApy = state.minBidApy
  const maxBidApy = state.maxBidApy
  let minBidRequestedStakeLovelace = state.minBidRequestedStakeLovelace
  const maxBidRequestedStakeLovelace = state.maxBidRequestedStakeLovelace
  minBidRequestedStakeLovelace = calcRequestedStakeAmount(minBidLovelace, minBidApy)
  const bidApy =
    change.bidApy === undefined
      ? state.bidApy
      : change.bidApy
  let bidLovelace =
    change.bidLovelace === undefined
      ? state.bidLovelace
      : change.bidLovelace
  let bidRequestedStakeLovelace =
    change.bidRequestedStakeLovelace === undefined
      ? state.bidRequestedStakeLovelace
      : change.bidRequestedStakeLovelace
  if (lastInputModified === 'bidInput') {
    bidRequestedStakeLovelace = calcRequestedStakeAmount(bidLovelace, bidApy)
  } else if (lastInputModified === 'apyInput') {
    bidLovelace = calcTotalBidAmount(bidRequestedStakeLovelace, bidApy).round(0, Big.roundUp)

    // FIXME: Leaving this here under the assumption that we will never
    // encounter it (and we don't want to). It would probably be more sane to
    // handle this as a user-facing error and refuse the bid, but potentially
    // get an intuitive error report.
    if (!calcRequestedStakeAmount(bidLovelace, bidApy).gte(bidRequestedStakeLovelace))
      throw new Error('Stake calculation does not satisfy requested amount')
  } else if (lastInputModified === 'requestedStakeInput') {
    bidLovelace = calcTotalBidAmount(bidRequestedStakeLovelace, bidApy).round(0, Big.roundUp)
  }
  return {
    ...state,
    totalReservesLovelace,
    stakedReservesLovelace,
    timeIntervalIndex,
    minBidLovelace,
    maxBidLovelace,
    minBidApy,
    maxBidApy,
    minBidRequestedStakeLovelace,
    maxBidRequestedStakeLovelace,
    bidLovelace,
    bidApy,
    bidRequestedStakeLovelace,
  }
}

export const BidForm = ({
  bidId,
  currentScreen = "bid",
}: {
  bidId: string | undefined;
  currentScreen?: "bid" | "adjustBid";
}) => {
  const dispatch = useAppDispatch();

  const stakeAuctionBidResponse = useAppSelector(selectStakeAuctionBidResponse);
  const cancelStakeAuctionBidResponse = useAppSelector(selectCancelStakeAuctionBidResponse)

  const responses: { [key: string]: BasicResponse<string> | undefined } = useMemo(() => ({
    stakeAuctionBidResponse,
    cancelStakeAuctionBidResponse
  }), [cancelStakeAuctionBidResponse?.contents, stakeAuctionBidResponse?.contents]);

  // remember to update the list of values it watches
  const prev = useRef(responses);
  useEffect(() => {
    for (const [key, prevResponse] of Object.entries(prev.current)) {
      const currResponse = responses[key];
      if (prevResponse !== currResponse) {
        console.log("Response changed", key, prevResponse, currResponse);
        dispatch(setAlert(basicResponseToAlert(currResponse)));
        if (currResponse !== undefined && currResponse.tag === "OK") {
          (async () => await dispatch(updateWalletUtxosThunk(null)))();
          dispatch(getOadaFrontendInfo());
        }
      }
      prev.current[key] = currResponse; // { [key]: currResponse }
    }
  }, [dispatch, stakeAuctionBidResponse?.contents, cancelStakeAuctionBidResponse?.contents]);

  const partialWalletUtxos = useAppSelector(selectPartialWalletUtxos)
  const walletLovelace = useAppSelector(selectWalletLovelaceAmount)
  const walletAda = walletLovelace.div(oneAdaAsLovelace).round(0, Big.roundDown).toNumber()

  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)

  const [orderType, setOrderType] = useState<OrderType>("market");
  const [limitOrderType, setLimitOrderType] = useState<LimitOrderType>("partialFill");
  const [currencyChoice, setCurrencyChoice] = useState<CurrencyChoice>("ada");
  const [orderTooSmall, setOrderTooSmall] = useState(false)
  const [passedFirstEpoch, setPassedFirstEpoch] = useState(false)
  const [marketOrderState, setMarketOrderState] = useState<MarketOrderState>({
    totalReservesLovelace: Big(0),
    stakedReservesLovelace: Big(0),
    timeIntervalIndex: Big(0),
    minBidLovelace: initialMinBidLovelace,
    maxBidLovelace: initialMaxBidLovelace,
    minBidApy: initialMinBidApy,
    maxBidApy: initialMaxBidApy,
    minBidRequestedStakeLovelace: initialMinBidRequestedStakeLovelace,
    maxBidRequestedStakeLovelace: initialMaxBidRequestedStakeLovelace,

    bidLovelace: initialBidLovelace,
    bidApy: initialBidApy,
    bidRequestedStakeLovelace: initialBidRequestedStakeLovelace,
  });
  const [limitOrderState, setLimitOrderState] = useState<LimitOrderState>({
    totalReservesLovelace: Big(0),
    stakedReservesLovelace: Big(0),
    timeIntervalIndex: Big(0),
    minBidLovelace: initialMinBidLovelace,
    maxBidLovelace: initialMaxBidLovelace,
    minBidApy: initialMinBidApy,
    maxBidApy: Big(1000),
    minBidRequestedStakeLovelace: initialMinBidRequestedStakeLovelace,
    maxBidRequestedStakeLovelace: initialMaxBidRequestedStakeLovelace,
    bidLovelace: initialBidLovelace,
    bidApy: initialBidApy,
    bidRequestedStakeLovelace: initialBidRequestedStakeLovelace,
  });
  const [marketOrderBidAdaInput, setMarketOrderBidAdaInput] = useState(
    initialBidLovelace.round(0, Big.roundDown).div(oneAdaAsLovelace).toString()
  );
  const [limitOrderBidAdaInput, setLimitOrderBidAdaInput] = useState(
    initialBidLovelace.round(0, Big.roundDown).div(oneAdaAsLovelace).toString()
  );
  const [limitOrderBidApyInput, setLimitOrderBidApyInput] = useState(
    initialBidApy.round(0, Big.roundDown).div(10).toString()
  );
  const [marketOrderBidRequestedStakeAdaInput, setMarketOrderRequestedStakeAdaInput] = useState(
    initialBidRequestedStakeLovelace.round(0, Big.roundDown).div(oneAdaAsLovelace).toString()
  );
  const [limitOrderBidRequestedStakeAdaInput, setLimitOrderRequestedStakeAdaInput] = useState(
    initialBidRequestedStakeLovelace.round(0, Big.roundDown).div(oneAdaAsLovelace).toString()
  );
  const [lastInputModified, setLastInputModified] = useState<LastInputModified>("requestedStakeInput");
  const marketOrderBidApyInput = initialBidApy.round(0, Big.roundDown).div(10).toString()

  useEffect(() => {
    dispatch(getOadaFrontendInfo());
    if (partialWalletUtxos.length > 0) {
      const walletLovelace = sumAssets(partialWalletUtxos, 'lovelace')
      const walletOadalet = sumAssets(partialWalletUtxos, `${oadaNetwork.oadaPolicyId}${oadaNetwork.oadaTokenName}`)
      setMarketOrderState({
        ...marketOrderState,
        maxBidLovelace: min(max(walletLovelace, walletOadalet), marketOrderState.maxBidLovelace),
      })
      setLimitOrderState({
        ...limitOrderState,
        maxBidLovelace: min(max(walletLovelace, walletOadalet), limitOrderState.maxBidLovelace),
      })
    }
  }, [dispatch, partialWalletUtxos, limitOrderState.maxBidLovelace.toString(), marketOrderState.maxBidLovelace.toString()]);

  useEffect(() => {
    // update reserve info for both order types
    if (oadaFrontendInfo !== undefined) {
      const totalReservesLovelace = Big(oadaFrontendInfo.totalReserves.toString())
      const stakedReservesLovelace = Big(oadaFrontendInfo.stakedReserves.toString())
      const timeIntervalIndex = Big(oadaFrontendInfo.timeIntervalIndex.toString())
      const nextMarketOrderState = updateMarketOrderState(
        marketOrderState, lastInputModified, { totalReservesLovelace, stakedReservesLovelace, timeIntervalIndex }
      )
      setMarketOrderState(nextMarketOrderState)
      const nextLimitOrderState = updateLimitOrderState(
        limitOrderState, lastInputModified, { totalReservesLovelace, stakedReservesLovelace, timeIntervalIndex }
      )
      setLimitOrderState(nextLimitOrderState)
    }
  }, [oadaFrontendInfo, lastInputModified, limitOrderState.maxBidLovelace.toString(), marketOrderState.maxBidLovelace.toString()])

  let totalReservesLovelace = marketOrderState.totalReservesLovelace
  let stakedReservesLovelace = marketOrderState.stakedReservesLovelace
  const availableReservesLovelace = totalReservesLovelace.sub(stakedReservesLovelace)
  let timeIntervalIndex = marketOrderState.timeIntervalIndex
  let minBidLovelace = marketOrderState.minBidLovelace
  let maxBidLovelace = marketOrderState.maxBidLovelace
  let minBidApy = marketOrderState.minBidApy
  let maxBidApy = marketOrderState.maxBidApy
  let minBidRequestedStakeLovelace = marketOrderState.minBidRequestedStakeLovelace
  let maxBidRequestedStakeLovelace = marketOrderState.maxBidRequestedStakeLovelace
  let bidLovelace = marketOrderState.bidLovelace
  let bidApy = marketOrderState.bidApy
  let bidRequestedStakeLovelace = marketOrderState.bidRequestedStakeLovelace

  if (orderType === "limit") {
    totalReservesLovelace = limitOrderState.totalReservesLovelace
    stakedReservesLovelace = limitOrderState.stakedReservesLovelace
    timeIntervalIndex = limitOrderState.timeIntervalIndex
    minBidLovelace = limitOrderState.minBidLovelace
    maxBidLovelace = limitOrderState.maxBidLovelace
    minBidApy = limitOrderState.minBidApy
    maxBidApy = limitOrderState.maxBidApy
    minBidRequestedStakeLovelace = limitOrderState.minBidRequestedStakeLovelace
    maxBidRequestedStakeLovelace = limitOrderState.maxBidRequestedStakeLovelace
    bidLovelace = limitOrderState.bidLovelace
    bidApy = limitOrderState.bidApy
    bidRequestedStakeLovelace = limitOrderState.bidRequestedStakeLovelace
  }

  let bidAdaFormatted = bidLovelace.div(oneAdaAsLovelace).round(6, Big.roundDown).toString()
  let bidAdaInputFormatted =
    lastInputModified === 'bidInput'
      ? orderType === 'market'
        ? marketOrderBidAdaInput
        : limitOrderBidAdaInput
      : bidAdaFormatted

  const minBidApyFormatted = minBidApy.div(10).round(1, Big.roundDown).toString()
  const maxBidApyFormatted = maxBidApy.div(10).round(1, Big.roundDown).toString()
  let bidApyFormatted = bidApy.div(10).round(1, Big.roundUp).toString()
  let bidApyInputFormatted =
    orderType === 'market'
      ? marketOrderBidApyInput
      : limitOrderBidApyInput

  let bidRequestedStakeAdaFormatted = bidRequestedStakeLovelace.div(oneAdaAsLovelace).round(6, Big.roundDown).toString()
  let bidRequestedStakeAdaInputFormatted =
    lastInputModified === 'requestedStakeInput'
      ? orderType === 'market'
        ? marketOrderBidRequestedStakeAdaInput
        : limitOrderBidRequestedStakeAdaInput
      : bidRequestedStakeAdaFormatted

  console.log('totalReserves', totalReservesLovelace.toString())
  console.log('stakedReserves', stakedReservesLovelace.toString())
  console.log('availableReserves', availableReservesLovelace.toString())
  console.log('timeIntervalIndex', timeIntervalIndex.toString())
  console.log('minBidApy', minBidApy.toString())
  console.log('maxBidApy', maxBidApy.toString())
  console.log('bidApy', bidApy.toString())
  console.log('minBidAmountAsLovelace', minBidLovelace.toString())
  console.log('maxBidAmountAsLovelace', maxBidLovelace.toString())
  console.log('bidLovelace', bidLovelace.toString())
  console.log('bidAdaInput', marketOrderBidAdaInput)
  console.log('bidAdaFormatted', bidAdaFormatted)
  console.log('bidAdaInputFormatted', bidAdaInputFormatted)
  console.log('minBidRequestedStakeLovelace', minBidRequestedStakeLovelace.toString())
  console.log('maxBidRequestedStakeLovelace', maxBidRequestedStakeLovelace.toString())
  console.log('bidRequestedStakeLovelace', bidRequestedStakeLovelace.toString())

  const handleBidAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    handleBidAmountInput(input)
  };

  const handleBidAmountInput = (input: string) => {
    const parseResult = parseInputAda(minBidLovelace, maxBidLovelace)(input)
    if (parseResult === undefined) {
      return;
    } else if (parseResult.tag === "ParseOk" || parseResult.tag === "ParseLtMin") {
      const bidLovelace = parseResult.amount
      if (orderType === "market") {
        setMarketOrderBidAdaInput(input)
        const nextMarketOrderState = updateMarketOrderState(marketOrderState, "bidInput", { bidLovelace })
        setMarketOrderState(nextMarketOrderState)
      } else {
        setLimitOrderBidAdaInput(input)
        const nextLimitOrderState = updateLimitOrderState(limitOrderState, "bidInput", { bidLovelace })
        setLimitOrderState(nextLimitOrderState)
      }
    } else if (parseResult.tag === "ParseGtMax") {
      const bidLovelace = parseResult.amount
      const bidLovelaceFormatted = bidLovelace.div(oneAdaAsLovelace).round(6, Big.roundDown).toString()
      if (orderType === "market") {
        setMarketOrderBidAdaInput(bidLovelaceFormatted)
        const nextMarketOrderState = updateMarketOrderState(marketOrderState, "bidInput", { bidLovelace })
        setMarketOrderState(nextMarketOrderState)
      } else {
        setLimitOrderBidAdaInput(bidLovelaceFormatted)
        const nextLimitOrderState = updateLimitOrderState(limitOrderState, "bidInput", { bidLovelace })
        setLimitOrderState(nextLimitOrderState)
      }
    }
    setLastInputModified("bidInput")
  };

  const handleBidAmountInputFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (orderType === "market") {
      setMarketOrderBidAdaInput(bidAdaFormatted)
    } else {
      setLimitOrderBidAdaInput(bidAdaFormatted)
    }
  }

  const handleRequestedStakeAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    handleRequestedStakeAmountInput(input)
  }

  const handleRequestedStakeInputFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (orderType === "market") {
      setMarketOrderRequestedStakeAdaInput(bidRequestedStakeAdaFormatted)
    } else {
      setLimitOrderRequestedStakeAdaInput(bidRequestedStakeAdaFormatted)
    }
  }

  const handleRequestedStakeAmountInput = (input: string) => {
    const inputParse = parseInputAda(minBidRequestedStakeLovelace, maxBidRequestedStakeLovelace)(input)
    if (inputParse === undefined) {
      return;
    } else if (inputParse.tag === "ParseOk" || inputParse.tag === "ParseLtMin") {
      const bidRequestedStakeLovelace = inputParse.amount
      if (orderType === "market") {
        setMarketOrderRequestedStakeAdaInput(input)
        const nextMarketOrderState = updateMarketOrderState(marketOrderState, "requestedStakeInput", { bidRequestedStakeLovelace })
        setMarketOrderState(nextMarketOrderState)
      } else {
        setLimitOrderRequestedStakeAdaInput(input)
        const nextLimitOrderState = updateLimitOrderState(limitOrderState, "requestedStakeInput", { bidRequestedStakeLovelace })
        setLimitOrderState(nextLimitOrderState)
      }
    } else if (inputParse.tag === "ParseGtMax") {
      const bidRequestedStakeLovelace = inputParse.amount
      const bidRequestedStakeLovelaceFormatted = bidRequestedStakeLovelace.div(oneAdaAsLovelace).round(6, Big.roundDown).toString()
      if (orderType === "market") {
        setMarketOrderRequestedStakeAdaInput(bidRequestedStakeLovelaceFormatted)
        const nextMarketOrderState = updateMarketOrderState(marketOrderState, "requestedStakeInput", { bidRequestedStakeLovelace })
        setMarketOrderState(nextMarketOrderState)
      } else {
        setLimitOrderRequestedStakeAdaInput(bidRequestedStakeLovelaceFormatted)
        const nextLimitOrderState = updateLimitOrderState(limitOrderState, "requestedStakeInput", { bidRequestedStakeLovelace })
        setLimitOrderState(nextLimitOrderState)
      }
    }
    setLastInputModified("requestedStakeInput")
  }

  const handleBidApyChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    handleBidApyInput(input)
  }

  const handleBidApyInput = (input: string) => {
    const inputParse = parseInputAmount(minBidApy, maxBidApy, amount => amount.mul(10))(input)
    if (inputParse === undefined) {
      return;
    } else if (inputParse.tag === "ParseOk" || inputParse.tag === "ParseLtMin") {
      setLimitOrderBidApyInput(input)
      const nextLimitOrderState = updateLimitOrderState(limitOrderState, "apyInput", { bidApy: inputParse.amount })
      setLimitOrderState(nextLimitOrderState)
    } else if (inputParse.tag === "ParseGtMax") {
      setLimitOrderBidApyInput(inputParse.amount.round(0, Big.roundDown).div(10).toString())
      const nextLimitOrderState = updateLimitOrderState(limitOrderState, "apyInput", { bidApy: inputParse.amount })
      setLimitOrderState(nextLimitOrderState)
    }
  }

  const handleBidNow = () => {
    if (bidApy === undefined || bidLovelace.lte(0)) {
      return;
    }

    let bidType: BidType | undefined = undefined
    if (orderType === "market") {
      bidType = "BidTypePartial"
    } else {
      if (limitOrderType === "fillOrKill") {
        bidType = "BidTypeFull"
      } else {
        bidType = "BidTypePartial"
      }
    }
    if (bidType === undefined) {
      return;
    }

    let bidValue: GYValueOut | undefined = undefined
    const bidAmountRounded = bidLovelace.round(0, Big.roundDown)
    if (currencyChoice === "ada") {
      bidValue = {
        lovelace: BigInt(bidAmountRounded.toString())
      }
    } else {
      bidValue = {
        lovelace: 1500000n,
        [`${oadaNetwork.oadaPolicyId}.${oadaNetwork.oadaTokenName}`]: BigInt(bidAmountRounded.sub(1500000).toString())
      }
    }

    if (bidValue === undefined) {
      return;
    }

    dispatch(stakeAuctionBid({
      bidType,
      bidApy,
      bidValue,
      stakeAddressBech32: stakeAddress
    })).then(() => dispatch(getOadaFrontendInfo))
  }

  const handleCancel = () => bidId && dispatch(cancelStakeAuctionBid({bidId}))

  const [advancedExpanded, setAdvancedExpanded] = useState(false)
  const [stakeAddress, setStakeAddress] = useState('')

  useEffect(() => {
    lucid.wallet?.rewardAddress().then(address => address && setStakeAddress(address))
  }, [lucid.wallet === undefined])

  const bidsClosed = !!oadaFrontendInfo && oadaFrontendInfo.currEpochEndPosixTime - Date.now() / 1000 < 7200
  const disabled: boolean = !!bidId || bidsClosed
  const currEpochEndPosixTimeAsMillis = Number(oadaFrontendInfo?.currEpochEndPosixTime) * 1000
  const bidView = oadaFrontendInfo?.bidViews.find(bidView => txOutRefToBidId(bidView.txOutRef) === bidId)
  
  if (bidView) {
    const bidViewFormatted: BidView = formatBidView(currEpochEndPosixTimeAsMillis)(bidView)
    bidRequestedStakeAdaInputFormatted = bidAmountToRequestedSize(Big(bidView.amount), Big(bidView.apy)).toString()
    bidRequestedStakeAdaFormatted = bidViewFormatted.requestedSizeFormatted
    bidAdaFormatted = bidViewFormatted.amountFormatted
    bidAdaInputFormatted = bidViewFormatted.amountFormatted
    bidApyFormatted = bidViewFormatted.apy
    bidApyInputFormatted = bidViewFormatted.apy
  }

  useEffect(() => {
    if (!bidView)
      return
    setOrderType('limit')
    setStakeAddress(bidView.stakeAddressBech32)
    lucid.wallet?.rewardAddress().then(rewardAddress =>
      setAdvancedExpanded(rewardAddress !== bidView.stakeAddressBech32)
    )
    setLimitOrderType(
      bidView.bidType === 'BidTypeFull' ? 'fillOrKill' : 'partialFill'
    )
    setCurrencyChoice(
      bidView.assetClass === oadaFrontendInfo?.oadaAssetClass
        ? 'oada'
        : 'ada'
    )
  }, [oadaFrontendInfo?.oadaAssetClass])

  useEffect(() => {
    let newValue = orderTooSmall
    newValue ||= orderType === 'market' && marketOrderState.bidRequestedStakeLovelace.lt(initialMinBidRequestedStakeLovelace)
    newValue ||= orderType === 'limit' && limitOrderState.bidRequestedStakeLovelace.lt(initialMinBidRequestedStakeLovelace)
    setOrderTooSmall(newValue)
  }, [marketOrderState, limitOrderState, orderType, orderTooSmall])

  const firstEpoch = 495
  useEffect(() => {
    setPassedFirstEpoch(relativeEpochToAbsoluteEpoch(oadaFrontendInfo?.currEpoch || 0) >= firstEpoch)
  }, [oadaFrontendInfo?.currEpoch])

  useEffect(() => {
    if (orderType === 'limit')
      setLastInputModified('requestedStakeInput')
  }, [orderType])

  const invalidInput = disabled || orderTooSmall || !passedFirstEpoch

  return (
    <>
      <Text size="xlarge" className={cn("select-none text-center p-4 pt-[45%] font-bold w-full h-full absolute bg-ui-surface-darksub z-10 top-0 left-0 rounded-xl", bidsClosed ? "block" : "hidden")}>
        Bids closed for epoch boundary
      </Text>
      <div className="grid gap-6">
        <section>
          <div className="flex flex-col gap-2">
            {!disabled && 
              <>
                <div className="flex justify-between items-center">
                  <Text size="medium" className="flex items-center">
                    Order Type
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose the type of order to be submitted to the auction.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Text>
                  <Text tone="muted">
                    Available ADA{" "}
                    <span className="text-ui-surface-default">
                      {formatNumberWithSuffix(walletAda)} ₳
                    </span>
                  </Text>
                </div>
                <Tabs
                  defaultValue="market"
                  value={orderType}
                  onValueChange={(value) => {
                    if (value === "market") {
                      setOrderType("market");
                      const nextMarketOrderState = updateMarketOrderState(marketOrderState, "bidInput", {})
                      setMarketOrderState(nextMarketOrderState)
                    } else if (value === "limit") {
                      setOrderType("limit");
                      const nextLimitOrderState = updateLimitOrderState(limitOrderState, "bidInput", {})
                      setLimitOrderState(nextLimitOrderState)
                    }
                  }}
                >
                  <TabsList className="w-full p-1">
                    <TabsTrigger className="flex-1" value="market" disabled={disabled}>
                      Market Order{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <FiInfo className="h-4 w-4 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>An order that is submitted with an APR/payment made high enough to do so. Instantly matched by the Controller.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TabsTrigger>
                    <TabsTrigger className="flex-1" value="limit" disabled={disabled}>
                      Limit Order{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <FiInfo className="h-4 w-4 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>An order placed with an exact APR/payment chosen, matched only if the Market Clearing Interest Rate crosses it.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </>
            }
            {orderType === "limit" && (
              <Tabs
                defaultValue="partialFill"
                value={limitOrderType}
                onValueChange={(value) => {
                  if (value === "fillOrKill") {
                    setLimitOrderType("fillOrKill");
                  } else if (value === "partialFill") {
                    setLimitOrderType("partialFill");
                  }
                }}
                className="flex"
              >
                <TabsList className="border-none p-0 text-xs h-fit bg-ui-base-transparent ml-auto">
                  <TabsTrigger
                    className="group bg-ui-base-transparent data-[state=active]:bg-gradient-to-tr data-[state=active]:from-ui-brand-gradient-start data-[state=active]:to-ui-brand-gradient-end rounded-full p-[1px]"
                    value="fillOrKill"
                    disabled={disabled}
                  >
                    <div className="flex items-center px-3 py-1 bg-[#0A0C1D] rounded-full">
                      <Text className="group-data-[state=active]:bg-gradient-to-tr group-data-[state=active]:from-ui-brand-gradient-start group-data-[state=active]:to-ui-brand-gradient-end group-data-[state=active]:text-ui-base-transparent group-data-[state=active]:bg-clip-text">
                        Fill or Kill
                      </Text>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <FiInfo className="h-4 w-4 ml-1 group-data-[state=active]:text-ui-base-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Bid matched in full, or not at all. Not recommended
                              for regular users.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger
                    className="group data-[state=active]:bg-gradient-to-tr data-[state=active]:from-ui-brand-gradient-start data-[state=active]:to-ui-brand-gradient-end rounded-full p-[1px]"
                    value="partialFill"
                    disabled={disabled}
                  >
                    <div className="flex items-center px-3 py-1 bg-[#0A0C1D] rounded-full ">
                      <Text className="group-data-[state=active]:bg-gradient-to-tr group-data-[state=active]:from-ui-brand-gradient-start group-data-[state=active]:to-ui-brand-gradient-end group-data-[state=active]:text-ui-base-transparent group-data-[state=active]:bg-clip-text">
                        Partial Fill
                      </Text>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <FiInfo className="h-4 w-4 ml-1 group-data-[state=active]:text-ui-base-primary" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Bid matched with whatever liquidty is available at
                              the time. Recommended for most users.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        </section>
        <section>
          <div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
                <Text size="medium" className="flex items-center">
                  Requested Stake Amount{" "}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The total amount of Staking Rights acquired by the order.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Text>
                <Text size="medium" tone="muted">
                  {bidRequestedStakeAdaFormatted} ADA
                </Text>
              </div>

              <div className="flex justify-end relative">
                <Input
                  autoFocus={true}
                  value={bidRequestedStakeAdaInputFormatted}
                  onChange={handleRequestedStakeAmountChange}
                  onFocus={handleRequestedStakeInputFocus}
                  onBlur={handleRequestedStakeInputFocus}
                  disabled={disabled}
                  className="rounded-lg border-none text-2xl w-full py-5 px-4"
                />
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="flex flex-col xs:flex-row items-center justify-between">
            <Text size="medium" className="xs:max-w-[50%] flex items-center">
              {orderType === "market" && (<>Market&nbsp;Clearing</>)}{" "}
              Interest&nbsp;Rate (%&nbsp;APR)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                  </TooltipTrigger>
                  <TooltipContent>
                      {orderType === 'market'
                        ? <>
                            <p>Current APR paid to clear the Market Order
                            instantly. The formula prices the stake according to
                            the time in the epoch, wanting to slowly sell off all
                            of it.</p>

                            <p>Over time the clearing rate falls down to the
                            baseline staking rate, moved higher up by the demand
                            from the bidders.</p>
                          </>
                        : <p>Chosen APR Bid. The auction takes the highest bids first.</p>
                      }
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Text>
            <div className="flex flex-col items-end gap-1">
              {orderType === "limit" ? (
                <>
                  <Input
                    value={bidApyInputFormatted}
                    onChange={handleBidApyChange}
                    disabled={disabled}
                    className="rounded-lg text-3xl py-3 w-[160px] text-center"
                  />
                  <Text tone="muted">
                    Range = {minBidApyFormatted}% - {maxBidApyFormatted}%
                  </Text>
                </>
              ) : (
                <div className="w-40 bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end rounded-lg p-[1px]">
                  <div className="bg-[hsl(233,31%,11%)] rounded-lg">
                    <Text className="py-3 text-3xl font-medium text-center bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end text-ui-base-transparent bg-clip-text">
                      {bidApyFormatted}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
          {orderType === "limit" && !disabled && (
            <Slider
              className="[&_.track]:!h-2 [&_.thumb]:!h-5 [&_.thumb]:!w-5 [&_.thumb]:!top-[14px]"
              onChange={(value) => {handleBidApyInput(value.toString())}}
              value={bidApy.div(10).toNumber()}
              min={minBidApy.round(0, Big.roundDown).div(10).toNumber()}
              max={maxBidApy.round(0, Big.roundDown).div(10).toNumber()}
              step={0.1}
            />
          )}
        </section>
        <section>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <Text size="medium" className="flex items-center">
                Total Bid Amount{" "}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The total payment made to acqure the staking rights.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Text>
              <Text size="medium" tone="muted" className={cn(orderType === 'limit' ? 'hidden' : '')}>
                {bidAdaFormatted}
              </Text>
            </div>
            <div className="flex flex-col xs:flex-row justify-end relative">
              {orderType === 'market'
                ? <Input
                    autoFocus={true}
                    value={bidAdaInputFormatted}
                    onChange={handleBidAmountChange}
                    onFocus={handleBidAmountInputFocus}
                    onBlur={handleBidAmountInputFocus}
                    disabled={disabled}
                    className="rounded-lg border-none text-2xl w-full py-5 px-4"
                  />
                : <div className="w-full bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end rounded-lg p-[1px]">
                    <div className="bg-[hsl(233,31%,11%)] rounded-lg">
                      <Text className="p-5 text-3xl font-medium bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end text-ui-base-transparent bg-clip-text">
                        {bidAdaInputFormatted}
                      </Text>
                    </div>
                  </div>
              }
              <div className="xs:absolute xs:top-1/2 xs:-translate-y-1/2 py-2 xs:py-0 xs:pr-4 flex flex-row xs:flex-col justify-between items-center xs:items-end">
                <Text tone="muted">Pay with</Text>
                <Tabs
                  defaultValue="ada"
                  value={currencyChoice}
                  onValueChange={(value) => {
                    if (disabled)
                      return

                    if (value === "ada") {
                      setCurrencyChoice("ada");
                    } else if (value === "oada") {
                      setCurrencyChoice("oada");
                    }
                  }}
                >
                  <TabsList className="p-1 h-10 gap-1">
                    <TabsTrigger className="pl-1 py-1 pr-2 text-sm" value="ada" disabled={disabled}>
                      <CustomIcon icon="ada" className="h-6 w-6 mr-1" />
                      ADA
                    </TabsTrigger>
                    <TabsTrigger className="pl-1 py-1 pr-2 text-sm" value="oada" disabled={disabled}>
                      <CustomIcon icon="oada" className="h-6 w-6 mr-1" />
                      OADA
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <Attention
              icon={<CustomIcon icon="stars" className="h-5 w-5" />}
              className="relative mt-1 px-4 py-2 rounded-lg bg-gradient-to-tr from-ui-brand-gradient-start/10 to-ui-brand-gradient-end/10 bg-ui-base-transparent text-ui-info-default"
            >
              Pay in OADA and have your order be treated with added 0.2% priority APY
            </Attention>
          </div>
        </section>
        <section>
          <Card className="p-0" >
            <Button
              variant="secondary"
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className={
                advancedExpanded
                  ? "rounded-t-lg rounded-b-none w-full h-4"
                  : "rounded-lg w-full h-4"
              }
            >
              <Text size="medium" className="flex items-center">
                Custom Stake Key
              </Text>
            </Button>
            <Collapse in={advancedExpanded} className="text-ui-surface-dark">
              <div className="flex flex-col gap-2 p-2">
                <div className="flex justify-between items-center">
                  <Text size="medium" className="flex items-center text-ui-base-white">
                    Stake address
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                          The staking address used for this bid. The default
                          value comes from your connected wallet.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Text>
                </div>

                <div className="flex justify-end relative">
                  <Input
                    autoFocus={true}
                    value={stakeAddress}
                    onChange={e => setStakeAddress(e.target.value)}
                    disabled={disabled}
                    className="rounded-lg border-none text-xl w-full py-5 px-4 h-2"
                  />
                </div>
              </div>
            </Collapse>
          </Card>
        </section>

        <Separator />
        {orderType === "market" && bidApy.gte(Big(100)) && !disabled && (
          <Attention>
            Interest Rate is above 10%. This bid order will be filled immediately
            a and can not be cancelled.
          </Attention>
        )}
        {orderTooSmall && (
          <Attention>
            The minimum requestable stake amount is {formatNumberWithSuffix(+initialMinBidRequestedStakeLovelace, 6)} ADA
          </Attention>
        )}
        {!passedFirstEpoch && (
          <Attention>The OADA stake auction will begin in epoch {firstEpoch}</Attention>
        )}
        <section>
          {currentScreen === "adjustBid" && (
            <Button size="lg" className="w-full">
              Adjust Bid
            </Button>
          )}
          {currentScreen === "bid" ? (
            bidId ? (
              <div className="flex items-center justify-between gap-4">
                <Button variant="secondary" size="lg" className="flex-1" onClick={handleCancel}>
                  Cancel Bid
                </Button>
              </div>
            ) : (
              <Button
                disabled={invalidInput}
                size="lg"
                className="w-full"
                onClick={handleBidNow}>
                Bid Now
              </Button>
            )
          ) : null}
        </section>
      </div>
    </>
  );
};
