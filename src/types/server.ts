export type UtxoRef = {
  txHash: string,
  outputIndex: number
}

// policyId.tokenName
export type AssetClassSerialized = string

export type Value = {
  lovelace: bigint,
  assets: { [k: AssetClassSerialized]: bigint }
}

export type Utxo = {
  utxoRef: UtxoRef,
  address: string,
  value: Value
}

export type WalletStuff = {
  outputUtxosRefByWalletUtxoId: {
    [walletUtxoId: string]: string
  },
  outputUtxosByOutputUtxosRef: {
    [outputUtxosRef: string]: Utxo[]
  },
  walletUtxoIdsByOutputUtxosRef: {
    [outputUtxosRef: string]: string[]
  }
}

export type GYStakeCredential =
  | GYStakeCredentialByKey
  | GYStakeCredentialByScript;

export type GYStakeCredentialByKey = {
  tag: "GYStakeCredentialByKey";
  contents: string;
};

export type GYStakeCredentialByScript = {
  tag: "GYStakeCredentialByScript";
  contents: string;
};

