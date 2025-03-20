/**
 * Cardano Lucid Utilities
 * 
 * This module provides utility functions for working with the Cardano blockchain using Lucid:
 * - Address conversions and validations
 * - UTxO handling and transformations
 * - Stake credential management
 * - Time slot calculations
 * - Plutus data handling
 */

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

/**
 * Represents a POSIX timestamp as a bigint
 */
export type PosixTime = bigint;
// some things that should be in Lucid, implementing them here for now,
// or preferred alternatives

/**
 * Plutus data type for datum handling
 * TODO: Replace with proper type definition
 */
type PlutusDataDatum = any

/**
 * Calculates the hash of a Plutus datum
 * @param datum - The Plutus datum to hash
 * @returns Hex string representation of the datum hash
 */
export const calcDatumHash = (datum: PlutusDataDatum): string => {
  const plutusData = C.PlutusData.from_bytes(fromHex(datum));
  const hash = Buffer.from(C.hash_plutus_data(plutusData).to_bytes()).toString('hex')
  return hash
}

/**
 * Converts a Cardano slot number to POSIX timestamp
 * @param slot - The slot number to convert
 * @returns POSIX timestamp as bigint
 */
export const slotToPosixTime = (slot: bigint): PosixTime => {
  const network = cardanoNetwork
  const slotConfig = SLOT_CONFIG_NETWORK[network]
  return BigInt(slotToBeginUnixTime(Number(slot), slotConfig))
}

/**
 * Extracts a base address from a Bech32 string
 * @param bech32 - The Bech32-encoded address string
 * @returns Base address or undefined if invalid
 */
export const getBaseAddressFromBech32 = (bech32: string): C.BaseAddress | undefined => {
  return LucidAddress.from_bech32(bech32).as_base()
}

/**
 * Extracts an enterprise address from a Bech32 string
 * @param bech32 - The Bech32-encoded address string
 * @returns Enterprise address or undefined if invalid
 */
export const getEnterpriseAddressFromBech32 = (bech32: string): C.EnterpriseAddress | undefined => {
  return LucidAddress.from_bech32(bech32).as_enterprise()
}

/**
 * Union type of core Cardano address types
 */
export type CoreAddress = C.BaseAddress | C.EnterpriseAddress | C.PointerAddress

/**
 * Custom error for invalid Bech32 addresses
 */
class Bech32IsNotAddressError extends Error {
  constructor(public name: 'Bech32IsNotAddressError' = 'Bech32IsNotAddressError') {
    super()
  }
}

/**
 * Converts a Bech32 string to a core Cardano address
 * @param bech32 - The Bech32-encoded address string
 * @returns Result containing either the core address or an error
 */
export const bech32ToCoreAddress = (bech32: string): Result<CoreAddress, Bech32IsNotAddressError> => {
  const lucidAddress = LucidAddress.from_bech32(bech32)
  const coreAddress = lucidAddress.as_base() ?? lucidAddress.as_pointer() ?? lucidAddress.as_enterprise()
  if (coreAddress === undefined) {
    return Result.failure(new Bech32IsNotAddressError())
  } else {
    return Result.from(coreAddress)
  }
}

/**
 * Converts a Lucid UTxO to a Redux store-compatible format
 * @param utxo - The Lucid UTxO to convert
 * @returns UTxO in Redux store format
 */
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

/**
 * Creates an enterprise address from a credential
 * @param credential - The credential to use
 * @returns Bech32-encoded enterprise address
 */
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

/**
 * Creates a reward address from a stake credential
 * @param stakeCredential - The stake credential to use
 * @returns Bech32-encoded reward address
 */
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

/**
 * Converts an Atlas stake credential to a reward address
 * @param atlasStakeCredential - The Atlas stake credential to convert
 * @returns Bech32-encoded reward address or null if invalid
 */
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

/**
 * Converts a store credential to a reward address
 * @param credential - The store credential to convert
 * @returns Bech32-encoded reward address or null if invalid
 */
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

/**
 * Extracts a stake credential from a Bech32 address
 * @param bech32 - The Bech32-encoded address
 * @returns Stake credential or null if not found
 */
export const bech32ToStakeCredential = (bech32: string): Credential | null => {
  const utils = new Utils(lucid);
  const details = utils.getAddressDetails(bech32)
  return details.stakeCredential === undefined ? null : details.stakeCredential
}

/**
 * Converts a key hash to a pool ID
 * @param keyHash - The key hash to convert
 * @returns Bech32-encoded pool ID
 */
export const getPoolId = (keyHash: KeyHash): PoolId => {
  return C.Ed25519KeyHash.from_hex(keyHash).to_bech32('pool');
}

/**
 * Converts a CBOR string to a UTxO
 * @param cbor - The CBOR-encoded UTxO string
 * @returns UTxO object or null if invalid
 */
export const cborToUtxo = (cbor: string): UTxO | null => {
  const coreUtxo = C.TransactionUnspentOutput.from_bytes(fromHex(cbor))
  return L.coreToUtxo(coreUtxo)
}

/**
 * Extracts a stake key hash from a Bech32 address
 * @param bech32 - The Bech32-encoded address
 * @returns Stake key hash or null if not found
 */
export const bech32AddressToStakeKeyHash = (bech32: string): string | null => {
  const addr = C.Address.from_bech32(bech32)
  const mbStakeKeyHash = addr.as_base()?.stake_cred().to_keyhash()?.to_hex()
  if (mbStakeKeyHash === undefined) {
    return null
  } else {
    return mbStakeKeyHash
  }
}

/**
 * Extracts a stake key hash from a Bech32 stake address
 * @param bech32 - The Bech32-encoded stake address
 * @returns Stake key hash or null if not found
 */
export const bech32StakeAddressToStakeKeyHash = (bech32: string): string | null => {
  const utils = new Utils(lucid)
  const addressDetails = utils.getAddressDetails(bech32)
  return addressDetails.stakeCredential?.hash ?? null
}

/**
 * Extracts a payment public key hash from a Bech32 address
 * @param bech32 - The Bech32-encoded address
 * @returns Payment public key hash or null if not found
 */
export const bech32AddressToPaymentPkh = (bech32: string): string | null => {
  const addr = C.Address.from_bech32(bech32)
  const mbPaymentPkh = addr.as_base()?.payment_cred().to_keyhash()?.to_hex()
  if (mbPaymentPkh === undefined) {
    return null
  } else {
    return mbPaymentPkh
  }
}
