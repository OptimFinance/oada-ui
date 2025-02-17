import Big from "big.js"
import { oadaNetwork } from "src/network";
import {StakeAuctionBidView, bidAmountToRequestedSize} from "./actions";
import {formatNumberWithSuffix} from "src/utils/formatNumbers";

export type BidView = {
  id: string,
  asset: string,
  apy: string,
  amount: number,
  amountFormatted: string,
  requestedSizeFormatted: string,
  bidLock: string,
}

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((v) => v.toString().padStart(2, "0")) // pad single digit numbers with a leading zero
    .join(":");
}

export const formatBidView = (currEpochEndPosixTimeAsMillis: number) => (bidView: StakeAuctionBidView): BidView => {
  let assetFormatted = "ADA"
  if (bidView.assetClass === `${oadaNetwork.oadaPolicyId}.${oadaNetwork.oadaTokenName}`) {
    assetFormatted = "OADA"
  }
  const apy = Big(bidView.apy.toString()).div(10).round(1, Big.roundDown)
  const apyFormatted = `${apy.toString()}%`
  const amount = Big(bidView.amount.toString())
  const amountFormatted = formatNumberWithSuffix(+amount, 6).trim()
  const requestedSize = bidAmountToRequestedSize(amount, Big(bidView.apy))
  const requestedSizeFormatted = formatNumberWithSuffix(+requestedSize, 6)
  const currPosixTimeAsMillis = Date.now()
  const bidLockFormatted = formatDuration(
    Big(currEpochEndPosixTimeAsMillis - currPosixTimeAsMillis).div(1000).round(0, Big.roundDown).toNumber()
  )

  return ({
    id: txOutRefToBidId(bidView.txOutRef),
    asset: assetFormatted,
    apy: apyFormatted,
    amount: amount.toNumber(),
    amountFormatted,
    requestedSizeFormatted,
    bidLock: bidLockFormatted,
  })
}

export const txOutRefToBidId = (txOutRef: string): string => {
  const [txHash, outputIndex] = txOutRef.split('#')
  return `${outputIndex}@${txHash}`
}

export const bidIdToTxOutRef = (bidId: string): string => {
  const [outputIndex, txHash] = bidId.split('@')
  return `${txHash}#${outputIndex}`
}
