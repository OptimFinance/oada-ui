/**
 * Network Configuration Module
 * 
 * This module handles network-specific configurations for:
 * - Cardano network parameters (Mainnet/Preview)
 * - OADA network settings
 * - Network-specific explorer URLs and utilities
 */

import { cardanoNetwork } from './config.local';
import * as Mainnet from './mainnet/network'
import * as Preview from './preview/network'
import { config as previewOadaConfig } from './preview/oada-config'
import { config as mainnetOadaConfig } from './mainnet/oada-config'

/**
 * Cardano Network Configuration
 * 
 * Selects and exports network-specific parameters based on the configured network:
 * - Era start time and slot
 * - Epoch boundaries and length
 * - Explorer URLs and utilities
 * 
 * @throws Error if network is undefined
 */
export const network = (() => {
  if (cardanoNetwork === 'Mainnet') {
    return {
      eraStartPosixTime: Mainnet.eraStartPosixTime,
      eraStartSlot: Mainnet.eraStartSlot,
      epochBoundary: Mainnet.epochBoundary,
      epochBoundaryAsEpoch: Mainnet.epochBoundaryAsEpoch,
      epochLength: Mainnet.epochLength,
      explorerName: Mainnet.explorerName,
      getExplorerTokenUrl: Mainnet.getExplorerTokenUrl,
      getTokenHoldersExplorerUrl: Mainnet.getTokenHoldersExplorerUrl,
      getExplorerStakeKeyUrl: Mainnet.getExplorerStakeKeyUrl,
    }
  } else if (cardanoNetwork === 'Preview') {
    return {
      eraStartPosixTime: Preview.eraStartPosixTime,
      eraStartSlot: Preview.eraStartSlot,
      epochBoundary: Preview.epochBoundary,
      epochBoundaryAsEpoch: Preview.epochBoundaryAsEpoch,
      epochLength: Preview.epochLength,
      explorerName: Preview.explorerName,
      getExplorerTokenUrl: Preview.getExplorerTokenUrl,
      getTokenHoldersExplorerUrl: Preview.getTokenHoldersExplorerUrl,
      getExplorerStakeKeyUrl: Preview.getExplorerStakeKeyUrl,
    }
  } else {
    throw new Error("Network is undefined")
  }
})()

/**
 * OADA Network Configuration
 * 
 * Selects and exports OADA-specific configuration based on the Cardano network:
 * - Network endpoints
 * - API configurations
 * - Service URLs
 * 
 * @throws Error if network is undefined
 */
export const oadaNetwork = (() => {
  if (cardanoNetwork === 'Mainnet') {
    return {
      ...mainnetOadaConfig
    }
  } else if (cardanoNetwork === 'Preview') {
    return {
      ...previewOadaConfig
    }
  } else {
    throw new Error("Network is undefined")
  }
})()
