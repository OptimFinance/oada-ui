import { Address, Assets, CertificateValidator, Datum, Lovelace, Lucid, MintingPolicy, OutputData, PoolId, Redeemer, RewardAddress, SpendingValidator, Tx, TxComplete, UnixTime, UTxO, WithdrawalValidator } from "lucid-cardano";

export interface LucidExt extends Lucid {
  newTx(): TxExt;
}

export interface TxExt extends Tx {
  collectFrom(utxos: UTxO[], redeemer?: Redeemer): this;
  /** All assets should be of the same Policy Id.
   *
   * You can chain mintAssets events together if you need to mint assets with different Policy Ids.
   *
   * If the plutus script doesn't need a redeemer, you still neeed to specifiy the empty redeemer.
   */
  mintAssets(assets: Assets, redeemer?: Redeemer): this;
  /**
   * Pay to a public key or native script address
   */
  payToAddress(address: Address, assets: Assets): this;
  /**
   * Pay to a public key or native script address with datum or scriptRef.
   */
  payToAddressWithData(
    address: Address,
    outputData: Datum | OutputData,
    assets: Assets,
  ): this;
  /**
   * Pay to a plutus script address with datum
   */

  payToContract(address: Address, datum: Datum, assets: Assets): this;
  /**
   * Delegate to a stake pool
   */
  delegateTo(
    rewardAddress: RewardAddress,
    poolId: PoolId,
    redeemer?: Redeemer,
  ): this;
  registerStake(rewardAddress: RewardAddress): this;
  deregisterStake(rewardAddress: RewardAddress, redeemer?: Redeemer): this;
  withdraw(
    rewardAddress: RewardAddress,
    amount: Lovelace,
    redeemer?: Redeemer,
  ): this;
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
   */
  // applyIf(condition: boolean, callback: (tx: TxPartial) => void): this;
  complete(options?: {
    change?: { address?: Address; outputData?: OutputData };
    coinSelection?: boolean;
    nativeUplc?: boolean;
    utxos?: UTxO[];
  }): Promise<TxComplete>;
}

