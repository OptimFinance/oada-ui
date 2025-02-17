import {
  C,
  Credential,
  Address,
  RewardAddress,
  KeyHash,
  PoolId,
  fromHex,
  UTxO,
  Utils,
  SLOT_CONFIG_NETWORK,
  slotToBeginUnixTime,
} from 'lucid-cardano';
import * as L from 'lucid-cardano';
import { Utxo, Assets } from '../types/store';
import { Result } from './result';
import { lucid } from '../store/hooks';
import { cardanoNetwork } from '../config.local';
import * as St from '../types/store'
import {GYStakeCredential} from 'src/types/server';
const LucidAddress = C.Address;

export type PosixTime = bigint;
// some things that should be in Lucid, implementing them here for now,
// or preferred alternatives

type PlutusDataDatum = any
export const calcDatumHash = (datum: PlutusDataDatum): string => {
  const plutusData = C.PlutusData.from_bytes(fromHex(datum));
  const hash = Buffer.from(C.hash_plutus_data(plutusData).to_bytes()).toString('hex')
  return hash
}

export const slotToPosixTime = (slot: bigint): PosixTime => {
  const network = cardanoNetwork
  const slotConfig = SLOT_CONFIG_NETWORK[network]
  return BigInt(slotToBeginUnixTime(Number(slot), slotConfig))

}

export const getBaseAddressFromBech32 = (bech32: string): C.BaseAddress | undefined => {
  return LucidAddress.from_bech32(bech32).as_base()
}

export const getEnterpriseAddressFromBech32 = (bech32: string): C.EnterpriseAddress | undefined => {
  return LucidAddress.from_bech32(bech32).as_enterprise()
}

export type CoreAddress = C.BaseAddress | C.EnterpriseAddress | C.PointerAddress

class Bech32IsNotAddressError extends Error {
  constructor(public name: 'Bech32IsNotAddressError' = 'Bech32IsNotAddressError') {
    super()
  }
}

// should this try byron and reward addresses as well?
export const bech32ToCoreAddress = (bech32: string): Result<CoreAddress, Bech32IsNotAddressError> => {
  const lucidAddress = LucidAddress.from_bech32(bech32)
  const coreAddress = lucidAddress.as_base() ?? lucidAddress.as_pointer() ?? lucidAddress.as_enterprise()
  if (coreAddress === undefined) {
    return Result.failure(new Bech32IsNotAddressError())
  } else {
    return Result.from(coreAddress)
  }
}

// convert Lucid UTxO format to serializable version for Redux store
export const utxoLucidToRedux = (utxo: UTxO): Utxo => {
  const value: Assets = {};
  Object.entries(utxo.assets)
    .map(([assetId, quantity]) => value[assetId] = quantity.toString());
  return {
    txId: utxo.txHash,
    txIx: utxo.outputIndex,
    assets: value,
    address: utxo.address,
    datumHash: utxo.datumHash ?? undefined,
    datum: undefined
  };
}

export const getEnterpriseAddress = (credential: Credential): Address => {
  return C.EnterpriseAddress.new(
    lucid.network === 'Mainnet' ? 1 : 0,
    credential.type === 'Key'
      ? C.StakeCredential.from_keyhash(
        C.Ed25519KeyHash.from_hex(credential.hash)
      )
      : C.StakeCredential.from_scripthash(
        C.ScriptHash.from_hex(credential.hash)
      )
  )
    .to_address()
    .to_bech32(undefined);
}

export const getRewardAddress = (stakeCredential: Credential): RewardAddress => {
  // taken from Lucid.selectWalletFromUtxos
  if (stakeCredential.type === 'Key') {
    return C.RewardAddress.new(
      lucid.network === 'Mainnet' ? 1 : 0,
      C.StakeCredential.from_keyhash(
        C.Ed25519KeyHash.from_hex(
          stakeCredential.hash
        )
      )
    )
      .to_address()
      .to_bech32(undefined);
  }
  return C.RewardAddress.new(
    lucid.network === 'Mainnet' ? 1 : 0,
    C.StakeCredential.from_scripthash(
      C.ScriptHash.from_hex(stakeCredential.hash)
    )
  )
    .to_address()
    .to_bech32(undefined);
}

export const atlasStakeCredentialToRewardAddress = (atlasStakeCredential: GYStakeCredential): RewardAddress | null => {
  const stakeCredential =
    atlasStakeCredential.tag === 'GYStakeCredentialByKey'
      ? C.StakeCredential.from_keyhash(C.Ed25519KeyHash.from_hex(atlasStakeCredential.contents))
      : C.StakeCredential.from_scripthash(C.ScriptHash.from_hex(atlasStakeCredential.contents))

  return C.RewardAddress
    .new(
      lucid.network === 'Mainnet' ? 1 : 0,
      stakeCredential
    )
    .to_address()
    .to_bech32(undefined)
}

// same thing but converting a store type Credential
export const getRewardAddress2 = (credential: St.Credential): RewardAddress | null => {
  const stakeCredential =
    credential.tag === 'PubKeyCredential'
      ? C.StakeCredential.from_keyhash(C.Ed25519KeyHash.from_hex(credential.pubKeyHash))
      : C.StakeCredential.from_scripthash(C.ScriptHash.from_hex(credential.validatorHash))

  return C.RewardAddress
    .new(
      lucid.network === 'Mainnet' ? 1 : 0,
      stakeCredential
    )
    .to_address()
    .to_bech32(undefined)
}

export const bech32ToStakeCredential = (bech32: string): Credential | null => {
  const utils = new Utils(lucid);
  const details = utils.getAddressDetails(bech32)
  return details.stakeCredential === undefined ? null : details.stakeCredential
}

export const getPoolId = (keyHash: KeyHash): PoolId => {
  return C.Ed25519KeyHash.from_hex(keyHash).to_bech32('pool');
}

export const cborToUtxo = (cbor: string): UTxO | null => {
  const coreUtxo = C.TransactionUnspentOutput.from_bytes(fromHex(cbor))
  return L.coreToUtxo(coreUtxo)
}

export const bech32AddressToStakeKeyHash = (bech32: string): string | null => {
  const addr = C.Address.from_bech32(bech32)
  const mbStakeKeyHash = addr.as_base()?.stake_cred().to_keyhash()?.to_hex()
  if (mbStakeKeyHash === undefined) {
    return null
  } else {
    return mbStakeKeyHash
  }
}
export const bech32StakeAddressToStakeKeyHash = (bech32: string): string | null => {
  const utils = new Utils(lucid)
  const addressDetails = utils.getAddressDetails(bech32)
  return addressDetails.stakeCredential?.hash ?? null
}
export const bech32AddressToPaymentPkh = (bech32: string): string | null => {
  const addr = C.Address.from_bech32(bech32)
  const mbPaymentPkh = addr.as_base()?.payment_cred().to_keyhash()?.to_hex()
  if (mbPaymentPkh === undefined) {
    return null
  } else {
    return mbPaymentPkh
  }
}
