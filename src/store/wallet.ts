/**
 * Cardano Wallet Provider Integration
 * 
 * This module handles integration with various Cardano wallet providers through the CIP-30 standard.
 * It provides a unified interface for accessing different wallet implementations and manages
 * wallet API connections.
 * 
 * Features:
 * - CIP-30 compliant wallet integration
 * - Support for multiple wallet providers
 * - Type-safe wallet API access
 * - Browser extension detection and handling
 */

import {WalletApi} from 'lucid-cardano';

/**
 * Interface defining the wallet API provider contract
 * Implementations must be able to retrieve a WalletApi instance for a given provider name
 */
export interface WalletApiProvider {
  /**
   * Retrieves a wallet API instance for the specified provider
   * 
   * @param name - Name of the wallet provider (e.g., 'nami', 'eternl', etc.)
   * @returns Promise resolving to a CIP-30 compliant WalletApi instance
   * @throws Error if provider is not supported or wallet is not available
   */
  getWalletApi(name: string): Promise<WalletApi>
}

/**
 * Registry of supported wallet providers
 * Each entry indicates whether a specific wallet implementation is supported
 * 
 * Currently supported wallets:
 * - Nami
 * - Flint
 * - Yoroi
 * - GeroWallet
 * - Eternl
 * - Typhon
 * - Lode
 * - Exodus
 * - Vespr
 * - Lace
 * - NuFi
 */
const supportedProviders: { [key: string]: boolean } = {
  nami: true,
  flint: true,
  yoroi: true,
  gerowallet: true,
  eternl: true,
  typhoncip30: true,
  LodeWallet: true,
  exodus: true,
  vespr: true,
  lace: true,
  nufi: true,
};

/**
 * Implementation of the WalletApiProvider interface using Lucid
 * Handles wallet connection and API access through browser extensions
 */
export const lucidWalletApiProvider: WalletApiProvider = {
  /**
   * Retrieves a wallet API instance for the specified provider
   * 
   * @param provider - Name of the wallet provider to connect to
   * @returns Promise resolving to a WalletApi instance
   * @throws Error if:
   *  - Provider is not supported
   *  - Wallet extension is not installed
   *  - Wallet is not accessible in the current context
   */
  async getWalletApi(provider: string): Promise<WalletApi> {
    // Validate provider support
    if (!supportedProviders[provider]) {
      throw new Error(`Invalid Wallet Provider: ${provider}`);
    }

    const context = window as any;

    console.log('Cardano wallet providers')
    console.log(provider)
    console.log(context.cardano)
    console.log(context.exodus)

    let walletApi = null

    // Special handling for Exodus wallet
    // Exodus extension doesn't inject into window.cardano
    if (provider === 'exodus') {
      // note exodus wallet must be "unlocked" before it can connect
      walletApi = (await context.exodus.cardano.enable()) as WalletApi
    } else if (!context.cardano || !context.cardano[provider]) {
      throw new Error("cardano provider instance not found in context");
    } else {
      walletApi = (await context.cardano[provider].enable()) as WalletApi;
    }

    return walletApi;
  }
} 

