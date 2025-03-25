/**
 * Cardano Preview Network Configuration
 * 
 * This file defines network-specific constants and utility functions for the Cardano
 * preview testnet. It includes epoch timing parameters, explorer URLs, and helper
 * functions for generating explorer links.
 */

/**
 * Network Era Constants
 * Define the start of the current era on preview testnet
 */
export const eraStartPosixTime = 1666915215  // Unix timestamp for era start
export const eraStartSlot = 259215           // Absolute slot number for era start

/**
 * Epoch Configuration
 * Constants for epoch boundary calculations and timing
 * Preview testnet uses shorter epochs than mainnet for faster testing
 */
export const epochBoundary = 1647899091000n      // Specific epoch boundary timestamp (BigInt)
export const epochLength = 1_800_000n            // Length of each epoch in milliseconds (30 minutes)
export const epochBoundaryAsEpoch = 327          // Reference epoch number for boundary

/**
 * Explorer Configuration
 * Base URLs and paths for Cardanoscan preview explorer
 * These URLs are specific to the preview testnet environment
 */
export const explorerTokenPath = 'https://preview.cardanoscan.io/token'
export const explorerStakeKeyPath = 'https://preview.cardanoscan.io/stakeKey'
export const explorerName = 'Cardanoscan'

/**
 * Get Explorer Token URL
 * Generates a URL for viewing token details on Cardanoscan preview
 * 
 * @param cs - Token policy ID (currency symbol)
 * @param tokenName - Name/identifier of the token
 * @returns Complete URL to token's explorer page
 */
export const getExplorerTokenUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${explorerTokenPath}/${cs}.${tokenName}`
}

/**
 * Get Token Holders Explorer URL
 * Generates a URL for viewing token holder distribution on Cardanoscan preview
 * 
 * @param cs - Token policy ID (currency symbol)
 * @param tokenName - Name/identifier of the token
 * @returns Complete URL to token's holder distribution page
 */
export const getTokenHoldersExplorerUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${getExplorerTokenUrl(cs, tokenName)}?tab=topholders`
}

/**
 * Get Explorer Stake Key URL
 * Generates a URL for viewing stake address details on Cardanoscan preview
 * 
 * @param stakeAddress - Cardano stake address
 * @returns Complete URL to stake address explorer page
 */
export const getExplorerStakeKeyUrl = (
  stakeAddress: string
): string => {
  return `${explorerStakeKeyPath}/${stakeAddress}`
}
