export type OverwritePropertyOf<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

export type Assets = { [unit: string]: string };

export type Utxo = {
  txId: string,
  txIx: number,
  assets: Assets,
  address: string,
  datumHash?: string,
  datum?: object
  datumCbor?: string,
}

export type StorableAddress = {
  bech32: string,
  paymentCredential: Credential,
  stakingCredential: StakingCredential | null,
}

export type StakePool = {
  id: string,
  name: string,
  url: string, // homepage
  description: string,
  ticker: string,
  // blocksCreatedTotal: string, // bigint
  // blocksCreatedCurrentEpoch: string, // bigint
  // currentStake: string, // bigint
  // currentStakePercent: number,
  // currentSaturation: number,
  // currentDelegators: number,
  // currentPledge: string, // bigint
  // declaredPledge: string, // bigint
  // marginCost: number,
  // fixedCost: string, // bigint
  // rewardAccount: string,
  // owners: string[],
  // registration: string[],
  // retirement: string[],
  // // active means epoch 2 epochs ago
  // activeStake: string, // bigint
  // activeStakePercent: number,
}

export type Wallet = {
  provider: string,
  address: string,
}

export type UtxoFlexible<A> = {
  utxoRef: UtxoRef,
  address: string,
  value: Value,
  dat: A
}

export type WithDatumMetadata<A> = {
  hash: string,
  cbor: string,
  datum: A
}

export type Value = {
  lovelace: string,
  assets: {
    [assetClass: AssetClassSerialized]: string
  }
}

// cs.tn
export type AssetClassSerialized = string

export type UtxoRef = {
  txHash: string,
  outputIndex: string,
}

export type AssetClass = {
  currencySymbol: string,
  tokenName: string
}

export type PartialWallet = {
  utxos: Utxo[],
}

export type StakingCredential = StakingHash | StakingPtr
export type StakingHash = {
  tag: 'StakingHash',
  credential: Credential
}
export type StakingPtr = {
  tag: 'StakingPtr',
  slot: string,
  blockIndex: string,
  certIndex: string,
} 
export type Credential = PubKeyHash | ValidatorHash
export type PubKeyHash = {
  tag: 'PubKeyCredential'
  pubKeyHash: string
}
export type ValidatorHash = {
  tag: 'ValidatorCredential'
  validatorHash: string
}
