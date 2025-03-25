/**
 * Lucid Cardano Extensions
 * 
 * This module extends the Lucid Cardano library with additional functionality:
 * - Enhanced transaction building interface
 * - Extended UTxO handling
 * - Additional asset management capabilities
 * - Stake pool delegation utilities
 */

import { Address, Assets, CertificateValidator, Datum, Lovelace, Lucid, MintingPolicy, OutputData, PoolId, Redeemer, RewardAddress, SpendingValidator, Tx, TxComplete, UnixTime, UTxO, WithdrawalValidator } from "lucid-cardano";

/**
 * Extended Lucid Interface
 * 
 * Extends the base Lucid interface with additional transaction creation capabilities.
 * Provides a new transaction builder with enhanced functionality.
 */
export interface LucidExt extends Lucid {
  newTx(): TxExt;
}

/**
 * Extended Transaction Interface
 * 
 * Provides an enhanced transaction building interface with additional methods for:
 * - UTxO collection and management
 * - Asset minting and distribution
 * - Stake pool operations
 * - Transaction validation and signing
 */
export interface TxExt extends Tx {
  /**
   * Collects UTxOs for the transaction
   * @param utxos - Array of UTxOs to collect from
   * @param redeemer - Optional redeemer for script validation
   */
  collectFrom(utxos: UTxO[], redeemer?: Redeemer): this;

  /**
   * Mints assets using a specific policy
   * 
   * @param assets - Assets to mint (must be from same Policy ID)
   * @param redeemer - Optional redeemer for the minting policy
   * 
   * Note: Chain multiple mintAssets calls for different Policy IDs.
   * Empty redeemer must be specified even if not needed.
   */
  mintAssets(assets: Assets, redeemer?: Redeemer): this;

  /**
   * Pays assets to a public key or native script address
   * @param address - Target address
   * @param assets - Assets to send
   */
  payToAddress(address: Address, assets: Assets): this;

  /**
   * Pays assets to an address with additional data
   * @param address - Target address
   * @param outputData - Datum or script reference
   * @param assets - Assets to send
   */
  payToAddressWithData(
    address: Address,
    outputData: Datum | OutputData,
    assets: Assets,
  ): this;

  /**
   * Pays assets to a Plutus script address
   * @param address - Target script address
   * @param datum - Datum for the script
   * @param assets - Assets to send
   */
  payToContract(address: Address, datum: Datum, assets: Assets): this;

  /**
   * Delegates stake to a specific pool
   * @param rewardAddress - Address to delegate from
   * @param poolId - Target pool ID
   * @param redeemer - Optional redeemer for script validation
   */
  delegateTo(
    rewardAddress: RewardAddress,
    poolId: PoolId,
    redeemer?: Redeemer,
  ): this;

  /**
   * Registers a stake address
   * @param rewardAddress - Address to register
   */
  registerStake(rewardAddress: RewardAddress): this;

  /**
   * Deregisters a stake address
   * @param rewardAddress - Address to deregister
   * @param redeemer - Optional redeemer for script validation
   */
  deregisterStake(rewardAddress: RewardAddress, redeemer?: Redeemer): this;

  /**
   * Withdraws rewards from a stake address
   * @param rewardAddress - Address to withdraw from
   * @param amount - Amount to withdraw
   * @param redeemer - Optional redeemer for script validation
   */
  withdraw(
    rewardAddress: RewardAddress,
    amount: Lovelace,
    redeemer?: Redeemer,
  ): this;

  /**
   * Adds a signer to the transaction
   * 
   * @param address - Address to sign with
   * 
   * Note: 
   * - For Base/Enterprise/Pointer addresses: uses PaymentKeyHash
   * - For Reward addresses: uses StakeKeyHash
   */
  addSigner(address: Address | RewardAddress): this;

  /**
   * Sets transaction validity start time
   * @param unixTime - Start time in Unix timestamp
   */
  validFrom(unixTime: UnixTime): this;

  /**
   * Sets transaction validity end time
   * @param unixTime - End time in Unix timestamp
   */
  validTo(unixTime: UnixTime): this;

  /**
   * Attaches a spending validator to the transaction
   * @param spendingValidator - Validator to attach
   */
  attachSpendingValidator(spendingValidator: SpendingValidator): this;

  /**
   * Attaches a minting policy to the transaction
   * @param mintingPolicy - Policy to attach
   */
  attachMintingPolicy(mintingPolicy: MintingPolicy): this;

  /**
   * Attaches a certificate validator to the transaction
   * @param certValidator - Validator to attach
   */
  attachCertificateValidator(certValidator: CertificateValidator): this;

  /**
   * Attaches a withdrawal validator to the transaction
   * @param withdrawalValidator - Validator to attach
   */
  attachWithdrawalValidator(withdrawalValidator: WithdrawalValidator): this;

  /**
   * Completes the transaction building process
   * 
   * @param options - Transaction completion options:
   * - change: Address and data for change output
   * - coinSelection: Whether to use coin selection
   * - nativeUplc: Whether to use native UPLC
   * - utxos: Specific UTxOs to use
   * @returns Promise resolving to the completed transaction
   */
  complete(options?: {
    change?: { address?: Address; outputData?: OutputData };
    coinSelection?: boolean;
    nativeUplc?: boolean;
    utxos?: UTxO[];
  }): Promise<TxComplete>;
}

