/**
 * Server-Side Cardano Type Definitions
 * 
 * This module defines TypeScript types for Cardano blockchain data structures,
 * focusing on UTxO management, asset handling, and stake credentials.
 * These types are used for server-client communication and blockchain interaction.
 * 
 * Key concepts:
 * - UTxO (Unspent Transaction Output) representation
 * - Native asset handling
 * - Stake credential management
 * - Wallet state tracking
 */

/**
 * Represents a reference to a specific UTxO
 * Combines transaction hash and output index to uniquely identify a UTxO
 */
export type UtxoRef = {
  txHash: string,      // Transaction hash where the UTxO was created
  outputIndex: number  // Index of the output in the transaction
}

/**
 * String representation of an asset class
 * Format: "policyId.tokenName"
 * Used for native asset identification
 */
export type AssetClassSerialized = string

/**
 * Represents the value held in a UTxO or transaction output
 * Includes both ADA (in lovelace) and native assets
 */
export type Value = {
  lovelace: bigint,  // Amount of ADA in lovelace (1 ADA = 1,000,000 lovelace)
  assets: {          // Native assets mapped by their serialized asset class
    [k: AssetClassSerialized]: bigint
  }
}

/**
 * Complete UTxO representation
 * Combines reference, address, and value information
 */
export type Utxo = {
  utxoRef: UtxoRef,    // Reference to locate the UTxO
  address: string,      // Cardano address holding the UTxO
  value: Value         // Value contained in the UTxO
}

/**
 * Complex type for managing wallet UTxO relationships and mappings
 * Used to track various aspects of wallet state and UTxO ownership
 */
export type WalletStuff = {
  // Maps wallet-specific UTxO IDs to output references
  outputUtxosRefByWalletUtxoId: {
    [walletUtxoId: string]: string
  },
  // Maps output references to arrays of UTxOs
  outputUtxosByOutputUtxosRef: {
    [outputUtxosRef: string]: Utxo[]
  },
  // Maps output references to arrays of wallet UTxO IDs
  walletUtxoIdsByOutputUtxosRef: {
    [outputUtxosRef: string]: string[]
  }
}

/**
 * Union type for stake credentials
 * Represents either key-based or script-based stake credentials
 */
export type GYStakeCredential =
  | GYStakeCredentialByKey
  | GYStakeCredentialByScript;

/**
 * Represents a key-based stake credential
 * Used for standard staking addresses
 */
export type GYStakeCredentialByKey = {
  tag: "GYStakeCredentialByKey";  // Discriminator for key-based credentials
  contents: string;               // The actual credential data
};

/**
 * Represents a script-based stake credential
 * Used for script-controlled staking addresses
 */
export type GYStakeCredentialByScript = {
  tag: "GYStakeCredentialByScript";  // Discriminator for script-based credentials
  contents: string;                  // The script hash or reference
};

