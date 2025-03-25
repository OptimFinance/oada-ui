/**
 * Transaction Module
 * 
 * This module provides a wrapper around Lucid's transaction functionality:
 * - Defines transaction interfaces for different stages (Partial, Complete, Signed)
 * - Implements wrappers for Lucid transaction types
 * - Provides a builder pattern for constructing transactions
 * - Handles transaction signing and submission
 */

import {Address, Assets, CertificateValidator, Datum, Lovelace, MintingPolicy, PoolId, Redeemer, RewardAddress, Script, SpendingValidator, Tx as LucidTx, TxComplete as LucidTxComplete, TxSigned as LucidTxSigned, TxHash, UnixTime, UTxO, WithdrawalValidator, Lucid} from "lucid-cardano";
// import {WalletProvider} from "../features/wallet/wallet";

/**
 * Transaction Complete Interface
 * 
 * Represents a transaction that is ready for signing and submission:
 * - Provides signing methods
 * - Handles transaction completion
 * - Manages witness assembly
 */
interface TxComplete {
  sign(): this;
  /** Add an extra signature from a private key */
  // signWithPrivateKey(privateKey: PrivateKey): this;
  /**
   * Signs the transaction and returns the witnesses that were just made
   */
  // partialSign(): Promise<TransactionWitnesses>;
  /**
   * Signs the transaction and returns the witnesses that were just made
   *
   * Add an extra signature from a private key */
  // partialSignWithPrivateKey(privateKey: PrivateKey): TransactionWitnesses;
  /**
   * Signs the transaction with the given witnesses
   */
  // assemble(witnesses: TransactionWitnesses[]): this;
  complete(): Promise<TxSigned>;
}

/**
 * Transaction Signed Interface
 * 
 * Represents a fully signed transaction ready for submission:
 * - Handles transaction submission to the network
 */
interface TxSigned {
  submit(): Promise<TxHash>;
}

/**
 * Transaction Partial Interface
 * 
 * Represents a transaction under construction:
 * - Handles UTxO collection
 * - Manages asset minting
 * - Controls payment outputs
 * - Handles stake operations
 * - Manages validity intervals
 * - Attaches validators and policies
 */
interface TxPartial {
  collectFrom(utxos: UTxO[], redeemer?: Redeemer): this;
  /** All assets should be of the same Policy Id.
   *
   * You can chain mintAssets events together if you need to mint assets with different Policy Ids.
   *
   * If the plutus script doesn't need a redeemer, you still neeed to specifiy the empty redeemer.
   *  */
  mintAssets(assets: Assets, redeemer?: Redeemer): this;
  /**
   * Pay to a public key or native script address
   *  */
  payToAddress(address: Address, assets: Assets): this;
  /**
   * Pay to a public key or native script address with datum
   *  */
  payToAddressWithDatum(address: Address, datum: Datum, assets: Assets): this;
  /**
   * Pay to a plutus script address with datum
   *  */
  payToContract(address: Address, datum: Datum, assets: Assets): this;
  /**
   * Delegate to a stake pool
   */
  delegateTo(rewardAddress: RewardAddress, poolId: PoolId, redeemer?: Redeemer): this;
  registerStake(rewardAddress: RewardAddress): this;
  deregisterStake(rewardAddress: RewardAddress, redeemer?: Redeemer): this;
  withdraw(rewardAddress: RewardAddress, amount: Lovelace, redeemer?: Redeemer): this;
  /**
   * Needs to be a public key address
   *
   * The PaymentKeyHash is taken when providing a Base, Enterprise or Pointer address
   *
   * The StakeKeyHash is taken when providing a Reward address
   */
  addSigner(address: Address | RewardAddress): this;
  validFrom(unixTime: UnixTime): this;
  validTo(unixTime: UnixTime): this;
  // attachMetadata(label: Label, metadata: Json): this;
  /**
   * Converts strings to bytes if prefixed with **'0x'**
   */
  // attachMetadataWithConversion(label: Label, metadata: Json): this;
  attachSpendingValidator(spendingValidator: SpendingValidator): this;
  attachMintingPolicy(mintingPolicy: MintingPolicy): this;
  attachCertificateValidator(certValidator: CertificateValidator): this;
  attachWithdrawalValidator(withdrawalValidator: WithdrawalValidator): this;
  /**
   * callback cannot be async
   *
   */
  applyIf(condition: boolean, callback: (tx: TxPartial) => void): this;
  complete(): Promise<TxComplete>;
}

/**
 * Transaction Builder Interface
 * 
 * Provides a factory method to start building a new transaction
 */
export interface TxBuilder {
  start(lucid: Lucid): TxPartial
}

/**
 * Lucid Transaction Signed Wrapper
 * 
 * Wraps Lucid's signed transaction type to implement the TxSigned interface
 */
class LucidTxSignedWrapper implements TxSigned {
  constructor(private lucidTxSigned: LucidTxSigned) {}
  async submit(): Promise<string> {
    return this.lucidTxSigned.submit()
    // return await this.walletProvider.submitTx(this.lucidTxSigned.txSigned);
  }
}

/**
 * Lucid Transaction Complete Wrapper
 * 
 * Wraps Lucid's complete transaction type to implement the TxComplete interface
 */
class LucidTxCompleteWrapper implements TxComplete {
  constructor(private lucidTxComplete: LucidTxComplete) {}
  sign(): this {
    this.lucidTxComplete.sign()
    return this
  }
  async complete(): Promise<TxSigned> {
    const lucidTxSigned = await this.lucidTxComplete.complete()
    return new LucidTxSignedWrapper(lucidTxSigned)
  }
}

/**
 * Lucid Transaction Partial Wrapper
 * 
 * Wraps Lucid's transaction type to implement the TxPartial interface:
 * - Handles all transaction building operations
 * - Manages UTxO collection and spending
 * - Controls asset minting and payments
 * - Handles stake operations
 * - Manages validity intervals
 * - Attaches validators and policies
 */
class LucidTxPartialWrapper implements TxPartial {
  private lucidTx: LucidTx
  constructor(lucid: Lucid) {
    this.lucidTx = new LucidTx(lucid)
  }
  collectFrom(utxos: UTxO[], redeemer?: string): this {
    this.lucidTx = this.lucidTx.collectFrom(utxos, redeemer)
    return this
  }
  mintAssets(assets: Assets, redeemer?: string): this {
    this.lucidTx = this.lucidTx.mintAssets(assets, redeemer)
    return this
  }
  payToAddress(address: string, assets: Assets): this {
    this.lucidTx = this.lucidTx.payToAddress(address, assets)
    return this
  }
  payToAddressWithDatum(address: string, datum: string, assets: Assets): this {
    this.lucidTx = this.lucidTx.payToAddressWithData(address, datum, assets)
    return this
  }
  payToContract(address: string, datum: string, assets: Assets): this {
    this.lucidTx = this.lucidTx.payToContract(address, datum, assets)
    return this
  }
  delegateTo(rewardAddress: string, poolId: string, redeemer?: string): this {
    this.lucidTx = this.lucidTx.delegateTo(rewardAddress, poolId, redeemer)
    return this
  }
  registerStake(rewardAddress: string): this {
    this.lucidTx = this.lucidTx.registerStake(rewardAddress)
    return this
  }
  deregisterStake(rewardAddress: string, redeemer?: string): this {
    this.lucidTx = this.lucidTx.deregisterStake(rewardAddress, redeemer)
    return this
  }
  withdraw(rewardAddress: string, amount: bigint, redeemer?: string): this {
    this.lucidTx = this.lucidTx.withdraw(rewardAddress, amount, redeemer)
    return this
  }
  addSigner(_address: string): this {
    throw new Error("Method not implemented.");
  }
  validFrom(unixTime: number): this {
    this.lucidTx = this.lucidTx.validFrom(unixTime)
    return this
  }
  validTo(unixTime: number): this {
    this.lucidTx = this.lucidTx.validTo(unixTime)
    return this
  }
  attachSpendingValidator(spendingValidator: Script): this {
    this.lucidTx = this.lucidTx.attachSpendingValidator(spendingValidator)
    return this
  }
  attachMintingPolicy(mintingPolicy: Script): this {
    this.lucidTx = this.lucidTx.attachMintingPolicy(mintingPolicy)
    return this
  }
  attachCertificateValidator(certValidator: Script): this {
    this.lucidTx = this.lucidTx.attachCertificateValidator(certValidator)
    return this
  }
  attachWithdrawalValidator(withdrawalValidator: Script): this {
    this.lucidTx = this.lucidTx.attachWithdrawalValidator(withdrawalValidator)
    return this
  }
  applyIf(condition: boolean, callback: (txPartial: TxPartial) => void): this {
    if (condition) { callback(this) }
    return this
  }
  async complete(): Promise<TxComplete> {
    const lucidTxComplete = await this.lucidTx.complete()
    return new LucidTxCompleteWrapper(lucidTxComplete)
  }
}

/**
 * Lucid Transaction Builder
 * 
 * Factory object that creates new transaction instances
 */
export const lucidTxBuilder: TxBuilder = {
  start(lucid: Lucid) {
    return new LucidTxPartialWrapper(lucid)
  }
}

