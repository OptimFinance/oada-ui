/**
 * Store Type Definitions
 * 
 * This module defines TypeScript types for application state management and
 * Cardano blockchain data structures. It includes types for:
 * - State management utilities
 * - UTxO and asset handling
 * - Wallet and address management
 * - Staking and credential systems
 * 
 * These types form the core data model for the application's state.
 */

/**
 * Utility type for overwriting specific properties of a type
 * Useful for partial updates and state modifications
 * 
 * @template T - The original type
 * @template U - The type containing properties to overwrite
 */
export type OverwritePropertyOf<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

/**
 * Represents a mapping of asset units to their quantities
 * Asset units are typically in the format: policyId || assetName
 */
export type Assets = { [unit: string]: string };

/**
 * Represents an Unspent Transaction Output (UTxO)
 * Contains all necessary information about a UTXO in the application state
 */
export type Utxo = {
  txId: string,          // Transaction ID where the UTxO was created
  txIx: number,          // Index of the output in the transaction
  assets: Assets,        // Assets contained in the UTxO
  address: string,       // Address holding the UTxO
  datumHash?: string,    // Optional hash of the datum
  datum?: object,        // Optional datum object
  datumCbor?: string,   // Optional CBOR representation of the datum
}

/**
 * Represents a Cardano address with its components
 * Used for address management and validation
 */
export type StorableAddress = {
  bech32: string,                                    // Bech32-encoded address string
  paymentCredential: Credential,                     // Payment credential
  stakingCredential: StakingCredential | null,      // Optional staking credential
}

/**
 * Represents a stake pool's basic information
 * Contains essential metadata about a Cardano stake pool
 */
export type StakePool = {
  id: string,           // Pool ID
  name: string,         // Pool name
  url: string,          // Pool's homepage
  description: string,  // Pool description
  ticker: string,       // Pool ticker symbol
  // Additional metrics commented out but available for future use:
  // blocksCreatedTotal: string,
  // blocksCreatedCurrentEpoch: string,
  // currentStake: string,
  // currentStakePercent: number,
  // currentSaturation: number,
  // currentDelegators: number,
  // currentPledge: string,
  // declaredPledge: string,
  // marginCost: number,
  // fixedCost: string,
  // rewardAccount: string,
  // owners: string[],
  // registration: string[],
  // retirement: string[],
  // activeStake: string,
  // activeStakePercent: number,
}

/**
 * Basic wallet information
 * Contains essential data for wallet identification
 */
export type Wallet = {
  provider: string,     // Wallet provider name (e.g., 'nami', 'eternl')
  address: string,      // Wallet's base address
}

/**
 * Flexible UTxO type with generic datum support
 * @template A - The type of the datum
 */
export type UtxoFlexible<A> = {
  utxoRef: UtxoRef,     // Reference to the UTxO
  address: string,      // Address holding the UTxO
  value: Value,         // Value contained in the UTxO
  dat: A                // Generic datum type
}

/**
 * Metadata wrapper for datum information
 * @template A - The type of the datum
 */
export type WithDatumMetadata<A> = {
  hash: string,         // Datum hash
  cbor: string,         // CBOR representation
  datum: A              // The actual datum
}

/**
 * Represents a value in a transaction or UTxO
 * Includes both ADA (lovelace) and native assets
 */
export type Value = {
  lovelace: string,                                 // Amount in lovelace
  assets: {                                         // Native assets
    [assetClass: AssetClassSerialized]: string     // Amount per asset class
  }
}

/**
 * String representation of an asset class
 * Format: "currencySymbol.tokenName"
 */
export type AssetClassSerialized = string

/**
 * Reference to a specific UTxO
 */
export type UtxoRef = {
  txHash: string,       // Transaction hash
  outputIndex: string,  // Output index as string
}

/**
 * Represents a native asset class
 */
export type AssetClass = {
  currencySymbol: string,  // Policy ID
  tokenName: string        // Asset name
}

/**
 * Partial wallet state
 * Used for incremental updates and temporary storage
 */
export type PartialWallet = {
  utxos: Utxo[],          // List of UTxOs owned by the wallet
}

/**
 * Staking Credential Types
 * Represents different types of staking credentials on Cardano
 */
export type StakingCredential = StakingHash | StakingPtr

/**
 * Hash-based staking credential
 */
export type StakingHash = {
  tag: 'StakingHash',
  credential: Credential
}

/**
 * Pointer-based staking credential
 */
export type StakingPtr = {
  tag: 'StakingPtr',
  slot: string,           // Slot number
  blockIndex: string,     // Block index
  certIndex: string,      // Certificate index
} 

/**
 * Base credential type
 * Can be either a public key hash or validator hash
 */
export type Credential = PubKeyHash | ValidatorHash

/**
 * Public key hash credential
 */
export type PubKeyHash = {
  tag: 'PubKeyCredential',
  pubKeyHash: string      // Hash of the public key
}

/**
 * Validator (script) hash credential
 */
export type ValidatorHash = {
  tag: 'ValidatorCredential',
  validatorHash: string   // Hash of the validator script
}
