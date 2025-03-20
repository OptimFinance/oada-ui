/**
 * OADA Protocol View Layer
 * 
 * This file provides view-related functionality for the OADA protocol,
 * including bid formatting, duration calculations, and transaction reference
 * conversions. It handles the presentation layer of auction bids and related
 * protocol information.
 */

import Big from "big.js"
import { oadaNetwork } from "src/network";
import {StakeAuctionBidView, bidAmountToRequestedSize} from "./actions";
import {formatNumberWithSuffix} from "src/utils/formatNumbers";

/**
 * Bid View Interface
 * Defines the structure for displaying bid information in the UI
 */
export type BidView = {
  /** Unique identifier for the bid */
  id: string,
  /** Asset type (ADA or OADA) */
  asset: string,
  /** Annual Percentage Yield formatted as string with % */
  apy: string,
  /** Raw bid amount as number */
  amount: number,
  /** Formatted bid amount with appropriate suffix */
  amountFormatted: string,
  /** Formatted requested stake size with appropriate suffix */
  requestedSizeFormatted: string,
  /** Formatted duration of bid lock period */
  bidLock: string,
}

/**
 * Format Duration
 * Converts a duration in seconds to a formatted time string (HH:MM:SS)
 * 
 * @param seconds - Duration in seconds to format
 * @returns Formatted time string in HH:MM:SS format
 */
export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map((v) => v.toString().padStart(2, "0")) // pad single digit numbers with a leading zero
    .join(":");
}

/**
 * Format Bid View
 * Transforms a StakeAuctionBidView into a formatted BidView for UI display
 * 
 * @param currEpochEndPosixTimeAsMillis - Current epoch end time in milliseconds
 * @returns Function that formats a StakeAuctionBidView into a BidView
 */
export const formatBidView = (currEpochEndPosixTimeAsMillis: number) => (bidView: StakeAuctionBidView): BidView => {
  // Determine asset type (ADA or OADA)
  let assetFormatted = "ADA"
  if (bidView.assetClass === `${oadaNetwork.oadaPolicyId}.${oadaNetwork.oadaTokenName}`) {
    assetFormatted = "OADA"
  }

  // Calculate and format APY (divide by 10 for correct percentage)
  const apy = Big(bidView.apy.toString()).div(10).round(1, Big.roundDown)
  const apyFormatted = `${apy.toString()}%`

  // Format bid amount
  const amount = Big(bidView.amount.toString())
  const amountFormatted = formatNumberWithSuffix(+amount, 6).trim()

  // Calculate and format requested stake size
  const requestedSize = bidAmountToRequestedSize(amount, Big(bidView.apy))
  const requestedSizeFormatted = formatNumberWithSuffix(+requestedSize, 6)

  // Calculate remaining lock time
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

/**
 * Convert Transaction Output Reference to Bid ID
 * Transforms a transaction output reference into a bid identifier
 * 
 * @param txOutRef - Transaction output reference in format "hash#index"
 * @returns Bid identifier in format "index@hash"
 */
export const txOutRefToBidId = (txOutRef: string): string => {
  const [txHash, outputIndex] = txOutRef.split('#')
  return `${outputIndex}@${txHash}`
}

/**
 * Convert Bid ID to Transaction Output Reference
 * Transforms a bid identifier back into a transaction output reference
 * 
 * @param bidId - Bid identifier in format "index@hash"
 * @returns Transaction output reference in format "hash#index"
 */
export const bidIdToTxOutRef = (bidId: string): string => {
  const [outputIndex, txHash] = bidId.split('@')
  return `${txHash}#${outputIndex}`
}
