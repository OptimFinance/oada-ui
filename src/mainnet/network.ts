/**
 * Cardano Mainnet Network Configuration
 * 
 * Defines network-specific constants and utility functions for interacting
 * with the Cardano mainnet, including epoch calculations, explorer URLs,
 * and token-related functionality.
 */

/**
 * Network Era Constants
 * These values define the start of the Shelley era on mainnet
 */
export const eraStartPosixTime = 1596491091  // Unix timestamp for era start
export const eraStartSlot = 4924800          // Absolute slot number for era start

/**
 * Epoch Configuration
 * Constants for epoch boundary calculations and timing
 */
export const epochBoundary = 1647899091000n      // Specific epoch boundary timestamp (BigInt)
export const epochLength = 432_000_000n          // Length of each epoch in milliseconds (5 days)
export const epochBoundaryAsEpoch = 327          // Reference epoch number for boundary

/**
 * Explorer Configuration
 * Base URLs and paths for Cardanoscan explorer
 */
export const explorerTokenPath = 'https://cardanoscan.io/token'
export const explorerStakeKeyPath = 'https://cardanoscan.io/stakeKey'
export const explorerName = 'Cardanoscan'

/**
 * Generates a URL for viewing token details on Cardanoscan
 * 
 * @param {string} cs - Token policy ID (currency symbol)
 * @param {string} tokenName - Name/identifier of the token
 * @returns {string} Complete URL to token's explorer page
 */
export const getExplorerTokenUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${explorerTokenPath}/${cs}.${tokenName}`
}

/**
 * Generates a URL for viewing token holder distribution on Cardanoscan
 * 
 * @param {string} cs - Token policy ID (currency symbol)
 * @param {string} tokenName - Name/identifier of the token
 * @returns {string} Complete URL to token's holder distribution page
 */
export const getTokenHoldersExplorerUrl = (
  cs: string,
  tokenName: string
): string => {
  return `${getExplorerTokenUrl(cs, tokenName)}?tab=topholders`
}

/**
 * Generates a URL for viewing stake address details on Cardanoscan
 * 
 * @param {string} stakeAddress - Cardano stake address
 * @returns {string} Complete URL to stake address explorer page
 */
export const getExplorerStakeKeyUrl = (
  stakeAddress: string
): string => {
  return `${explorerStakeKeyPath}/${stakeAddress}`
}
