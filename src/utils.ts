/**
 * Utility Module
 * 
 * This module provides various utility functions and type definitions:
 * - Cardano-specific type conversions and validations
 * - Asset and UTxO handling
 * - Address and credential management
 * - Formatting functions for numbers and currencies
 * - Array manipulation utilities
 * - Response handling and error management
 */

import {C} from "lucid-cardano";
import {bech32ToCoreAddress} from "./utils/lucid";
import {Result} from "./utils/result";
import { Err, } from "./types/ui";
import Big from "big.js";
import * as S from "./types/server";
import * as St from "./types/store";
import * as Lucid from "lucid-cardano"
import { network } from "./network";
import { getRewardAddress2, } from "./utils/lucid";
import React from "react"
import {useLocation} from "react-router-dom"
import {AlertState} from "./store/slices/alertSlice"
import {VerifiedName, VerifiedNameMap} from "./types/ui"

/**
 * Asset Collection Type
 * 
 * Represents a collection of assets with their quantities
 * Format: { "assetClass": bigint }
 */
export type Assets = {
  [assetClass: string]: bigint
}

/**
 * UTxO Type
 * 
 * Represents an unspent transaction output with:
 * - Transaction ID and index
 * - Destination address
 * - Associated assets
 * - Optional datum hash
 */
export type Utxo = {
  txId: string,
  txIx: number,
  address: Address,
  assets: Assets,
  datumHash?: string,
}

/**
 * Address Type
 * 
 * Represents a Cardano address with:
 * - Bech32 encoded string
 * - Payment credential
 * - Optional stake credential
 */
export type Address = { bech32: string, paymentCredential: PaymentCredential, stakeCredential?: StakeCredential }

/**
 * Payment Credential Types
 * 
 * Represents different types of payment credentials:
 * - KeyHash: Public key hash
 * - ScriptHash: Script hash
 */
export type PaymentCredential = KeyHash | ScriptHash
export type KeyHash = { kind: 'KeyHash',  hash: string }
export type ScriptHash = { kind: 'ScriptHash', hash: string}

/**
 * Stake Credential Types
 * 
 * Represents different types of stake credentials:
 * - PaymentCredential: Key or script hash
 * - StakePointer: Pointer to stake registration
 */
export type StakeCredential = PaymentCredential | StakePointer
export type StakePointer = { 
  kind: 'StakePointer',
  slot: bigint,
  txIndex: bigint,
  dcertIndex: bigint
}

const {BaseAddress, EnterpriseAddress, PointerAddress } = C;

/**
 * Converts Lucid Assets to Store Assets
 * 
 * @param lucidAssets - Lucid Assets object to convert
 * @returns Store Assets object
 */
const lucidAssetsToAssets = (lucidAssets: Lucid.Assets): St.Assets => {
  const assets: St.Assets = {}
  for (const [unit, quantity] of Object.entries(lucidAssets)) {
    assets[unit] = quantity.toString()
  }
  return assets
}

/**
 * Converts Lucid UTxO to Store UTxO
 * 
 * @param lucidUtxo - Lucid UTxO to convert
 * @returns Store UTxO object
 */
export const lucidUtxoToUtxo = (lucidUtxo: Lucid.UTxO): St.Utxo => {
  return {
    txId: lucidUtxo.txHash,
    txIx: Number(lucidUtxo.outputIndex),
    address: lucidUtxo.address,
    assets: lucidAssetsToAssets(lucidUtxo.assets),
    datumHash: lucidUtxo.datumHash ?? undefined
  }
}

/**
 * Converts Storable Credential to Payment Credential
 * 
 * @param credential - Storable credential to convert
 * @returns Payment credential
 */
export const storableCredentialToPaymentCredential = (
  credential: St.Credential
): PaymentCredential => {
  return credential.tag === "PubKeyCredential"
    ? {
        kind: "KeyHash",
        hash: credential.pubKeyHash,
      }
    : {
        kind: "ScriptHash",
        hash: credential.validatorHash,
      };
};

/**
 * Converts Payment Credential to Storable Credential
 * 
 * @param paymentCredential - Payment credential to convert
 * @returns Storable credential
 */
export const paymentCredentialToStorableCredential = (
  paymentCredential: PaymentCredential
): St.Credential => {
  return paymentCredential.kind === "KeyHash"
    ? {
        tag: "PubKeyCredential" as const,
        pubKeyHash: paymentCredential.hash,
      }
    : {
        tag: "ValidatorCredential" as const,
        validatorHash: paymentCredential.hash,
      };
};

/**
 * Basic Response Types
 * 
 * Represents a generic response with success or failure
 */
export type BasicResponse<A> = OkResponse<A> | FailResponse

export type OkResponse<A> = {
  tag: 'OK',
  contents: A
}

export type FailResponse = {
  tag: 'Fail'
  contents: string
}

/**
 * Type guard for BasicResponse
 * 
 * @param contentsTypeGuard - Type guard for response contents
 * @returns Type guard for BasicResponse
 */
export const isBasicResponse = <T>(contentsTypeGuard: (o: any) => o is T) => (o: any): o is BasicResponse<T> => {
  console.log('isBasicResponse')
  console.log(o)
  return typeof o === 'object'
    && (o.tag === 'OK' || o.tag === 'Fail')
    && contentsTypeGuard(o.contents)
}

/**
 * Type guard for number
 * 
 * @param n - Value to check
 * @returns True if value is a number
 */
export const isNumber = (n: any): n is number => {
  return typeof n === 'number'
}

/**
 * Flattens an array of arrays
 * 
 * @param arrayOfArrays - Array of arrays to flatten
 * @returns Flattened array
 */
export const flatten = <T>(arrayOfArrays: T[][]): T[] => ([] as T[]).concat(...arrayOfArrays)

/**
 * Converts BasicResponse to AlertState
 * 
 * @param response - BasicResponse to convert
 * @returns AlertState object
 */
export const basicResponseToAlert = (response: BasicResponse<string> | undefined): AlertState => {
  const alert: AlertState = {
    message: 'Response is undefined'
  }
  if (response !== undefined) {
    if (response.tag === 'OK') {
      const alert = {
        type: 'success' as const,
        txHash: response.contents,
        message: 'Success',
      }
      return alert
    } else {
      const alert = {
        type: 'error' as const,
        message: response.contents,
      }
      return alert
    }
  } else {
    return alert
  }
}

/**
 * Converts token name to verified name
 * 
 * @param verifiedNameMap - Map of verified names
 * @param tokenName - Token name to convert
 * @param poolSize - Pool size for verification
 * @returns Verified name or original token name
 */
export const tokenNameToVerifiedName = (verifiedNameMap: VerifiedNameMap) => (tokenName: string, poolSize: Big): string => {
  const verifiedName = getVerifiedName(verifiedNameMap, tokenName, poolSize)
  return verifiedName === null ? tokenName : verifiedName.name
}

/**
 * Gets verified name from map
 * 
 * @param verifiedNameMap - Map of verified names
 * @param tokenName - Token name to look up
 * @param size - Size for verification
 * @returns Verified name or null
 */
export const getVerifiedName = (verifiedNameMap: VerifiedNameMap, tokenName: string, size: Big): VerifiedName | null => {
  const verifiedName = verifiedNameMap[tokenName]
  return verifiedName === undefined
  ? null
  : verifiedName[size.toString()]
}

/**
 * Copies text to clipboard
 * 
 * @param value - Text to copy
 */
export const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value);
}

/**
 * Intersperses a separator between array elements
 * 
 * @param s - Separator string
 * @param strings - Array of strings
 * @returns Joined string with separator
 */
export const intersperse = (s: string) => (strings: string[]): string => {
  if (strings.length === 0) return ''
  else if (strings.length === 1) return strings[0]
  else {
    const first = strings[0]
    let result = first
    for (let i = 1; i < strings.length; i++) {
      result = `${result}${s}${strings[i]}`
    }
    return result
  }
}

/**
 * Splits array into chunks
 * 
 * @param arr - Array to split
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export const chunk = <A>(arr: A[], size: number): A[][] => {
   const chunkedArray = [];
   for (let i = 0; i < arr.length; i++) {
      const last = chunkedArray[chunkedArray.length - 1];
      if(!last || last.length === size){
         chunkedArray.push([arr[i]]);
      }else{
         last.push(arr[i]);
      }
   };
   return chunkedArray;
};

/**
 * React hook for URL query parameters
 * 
 * @returns URLSearchParams object
 */
export function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Zips two arrays together
 * 
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of tuples
 */
export const zip = <A, B>(array1: A[], array2: B[]): (readonly [A, B])[] => {
  const l = array1.length > array2.length ? array2.length : array1.length
  const result = []
  for (let i = 0; i < l; i++) {
    result.push([array1[i], array2[i]] as const)
  }
  return result
}

/**
 * Resizes SVG element
 * 
 * @param width - New width
 * @param height - New height
 * @param svg - SVG element to resize
 */
export const resize = (width: number, height: number) => (svg: SVGSVGElement) => {
  svg.setAttribute('style', `height: ${height}px; width: ${width}px`)
  const rect = svg.querySelector('rect')
  if (rect !== null) {
    rect.setAttribute('style', `height: ${height}px; width: ${width}px;`)
  }
}

/**
 * Math utility functions
 */
export const min = (a: Big, b: Big) => a.lt(b) ? a : b
export const max = (a: Big, b: Big) => a.gt(b) ? a : b

/**
 * Creates array of numbers in range
 * 
 * @param start - Start value
 * @param stop - Stop value
 * @param step - Step value
 * @returns Array of numbers
 */
export const range = (start: number, stop: number, step: number): number[] =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

/**
 * Converts store UTxO reference to server UTxO reference
 * 
 * @param utxoRef - Store UTxO reference
 * @returns Server UTxO reference
 */
export function storeToUtxoRef(utxoRef: St.UtxoRef): S.UtxoRef {
  return {
    ...utxoRef,
    outputIndex: Number(utxoRef.outputIndex),
  };
}

/**
 * Core Address Types
 * 
 * Represents different types of Cardano addresses:
 * - BaseAddress: Address with both payment and stake credentials
 * - EnterpriseAddress: Address with only payment credential
 * - PointerAddress: Address with payment credential and stake pointer
 */
export type CoreAddress = C.BaseAddress | C.EnterpriseAddress | C.PointerAddress

/**
 * Error Types for Address Conversion
 */
class NoPaymentCredentialError extends Error {
  constructor(public name: 'NoPaymentCredentialError' = 'NoPaymentCredentialError') {
    super()
  }
}

class AddressIsNotBaseOrPointerError extends Error {
  constructor(public name: 'AddressIsNotBaseOrPointerError' = 'AddressIsNotBaseOrPointerError') {
    super()
  }
}

class Bech32IsNotAddressError extends Error {
  constructor(public error?: Error, public name: 'Bech32IsNotAddressError' = 'Bech32IsNotAddressError') {
    super(error !== undefined ? error.message : '')
  }
}

/**
 * Converts core stake credential to payment credential
 * 
 * @param coreStakeCredential - Core stake credential
 * @returns Result with payment credential or error
 */
const coreStakeCredentialToPaymentCredential = (coreStakeCredential: C.StakeCredential): Result<PaymentCredential, NoPaymentCredentialError> => {
  const keyHash = coreStakeCredential.to_keyhash()
  if (keyHash === undefined) {
    const scriptHash = coreStakeCredential.to_scripthash()
    if (scriptHash === undefined) {
      return Result.failure(new NoPaymentCredentialError())
    } else {
      return Result.from({ kind: 'ScriptHash', hash: scriptHash.to_hex() })
    }
  } else {
    return Result.from({ kind: 'KeyHash', hash: keyHash.to_hex() })
  }
}

/**
 * Converts core address to payment credential
 * 
 * @param coreAddress - Core address
 * @returns Result with payment credential or error
 */
const coreAddressToPaymentCredential = (coreAddress: CoreAddress): Result<PaymentCredential, NoPaymentCredentialError> => {
  if (coreAddress instanceof BaseAddress || coreAddress instanceof PointerAddress || coreAddress instanceof EnterpriseAddress) {
    const coreStakeCredential = coreAddress.payment_cred()
    return coreStakeCredentialToPaymentCredential(coreStakeCredential)
  } else {
    return Result.failure(new NoPaymentCredentialError())
  }
}

type AddressHasNoStakeCredentialError =
  | NoPaymentCredentialError
  | AddressIsNotBaseOrPointerError

/**
 * Converts core address to stake credential
 * 
 * @param coreAddress - Core address
 * @returns Result with stake credential or error
 */
const coreAddressToStakeCredential = (coreAddress: CoreAddress): Result<StakeCredential, AddressHasNoStakeCredentialError> => {
  if (coreAddress instanceof BaseAddress) {
    const coreStakeCredential = coreAddress.stake_cred()
    return coreStakeCredentialToPaymentCredential(coreStakeCredential)
  } else if (coreAddress instanceof PointerAddress) {
    const pointer = coreAddress.stake_pointer()
    return Result.from({
      kind: 'StakePointer',
      slot: BigInt(pointer.slot().to_str()),
      txIndex: BigInt(pointer.tx_index().to_str()),
      dcertIndex: BigInt(pointer.cert_index().to_str())
    })
  } else {
    return Result.failure(new AddressIsNotBaseOrPointerError())
  }
}

type Bech32ToAddressError =
  | Bech32IsNotAddressError
  | NoPaymentCredentialError
  | AddressHasNoStakeCredentialError

/**
 * Converts bech32 string to Address
 * 
 * @param bech32 - Bech32 encoded string
 * @returns Result with Address or error
 */
export const bech32ToAddress = (bech32: string): Result<Address, Bech32ToAddressError> => {
  return bech32ToCoreAddress(bech32)
    .chain('coreAddress', a => a)
    .chainR('paymentCredential', coreAddress => coreAddressToPaymentCredential(coreAddress))
    .chainR((_, {coreAddress}) => coreAddressToStakeCredential(coreAddress)
      .match<Result<StakeCredential | undefined, never>>({
        Success: stakeCredential => Result.from(stakeCredential),
        Failure: _e => Result.from(undefined)
      })
    )
    .chain((stakeCredential, {paymentCredential}) => {
      return {
        bech32,
        paymentCredential,
        stakeCredential,
      }
    })
}

/**
 * Converts server value to store value
 * 
 * @param sv - Server value
 * @returns Store value
 */
export function serverToValue(sv: S.Value): St.Value {
  const assets: St.Assets = {}
  for (const [k, v] of Object.entries(sv.assets)) {
    assets[k] = v.toString()
  }
  return {
    lovelace: sv.lovelace.toString(),
    assets: assets
  }
}

/**
 * Converts server UTxO reference to store UTxO reference
 * 
 * @param sur - Server UTxO reference
 * @returns Store UTxO reference
 */
export function serverToUtxoRef(sur: S.UtxoRef): St.UtxoRef {
  return {
    ...sur,
    outputIndex: sur.outputIndex.toString()
  }
}

/**
 * Formatting Functions for ADA and Values
 */
const adaSymbol = "₳";

/**
 * Converts lovelace to ADA
 * 
 * @param lovelace - Amount in lovelace
 * @returns Amount in ADA
 */
export function lovelaceToAda(lovelace: Big): Big {
  return lovelace.div(Big(1_000_000));
}

/**
 * Formats lovelace amount as human-readable words
 * 
 * @param lovelace - Amount in lovelace
 * @returns Formatted string
 */
export const formatLovelaceAsWords = (lovelace: Big): string => {
  const lovelaceAsWords = lovelace.eq("1000000000000")
    ? "1 Million ADA"
    : lovelace.eq("500000000000")
    ? "0.5 Million ADA"
    : lovelace.eq("1500000000000")
    ? "1.5 Million ADA"
    : `${lovelace.div("1000000").toString()} ADA`;
  return lovelaceAsWords;
};

/**
 * Formats decimal as percentage
 * 
 * @param interestRate - Decimal rate
 * @returns Formatted percentage string
 */
export const formatDecimalAsPercent = (interestRate: Big): string => {
  return interestRate.mul(100).round(2, Big.roundHalfEven).toString() + "%";
};

/**
 * Formats rate as percentage with ADA symbol
 * 
 * @param rate - Rate to format
 * @returns Formatted string
 */
export const formatRateAsPercentAda = (rate: Big): string => {
  return `${rate
    .mul(100)
    .round(2, Big.roundHalfEven)
    .toString()}% ${adaSymbol}`;
};

/**
 * Type guard for null or error
 * 
 * @param o - Value to check
 * @returns True if value is null or error
 */
export const isNullOrErr = <E>(o: any): o is null | Err<E> => {
  return o === null || o.tag === "Err";
};

/**
 * Formatting Functions
 */
export const formatAmount = (amount: Big): string => {
  return amount.toLocaleString();
};

export const formatAmountAsK = (amount: Big): string => {
  const oneThousand = 1000;
  return amount.mod(oneThousand).eq(0)
    ? `${amount.div(oneThousand)}k`
    : amount.toString();
};

export const formatEpochsAsMonths = (epochs: Big | null): string => {
  return epochs === null
    ? "N/A"
    : formatMonths(epochs.div(6).round(0, Big.roundDown));
};

const formatMonths = (months: Big): string => {
  return months.toString() + " month" + (months.gt(Big(1)) ? "s" : "");
};

export const formatValue = (currentValueAsLovelace: Big): string => {
  const oneMillionAda = Big(1_000_000_000_000);
  const tenThousandAda = Big(10_000_000_000);
  const oneThousandAda = Big(1_000_000_000);
  return currentValueAsLovelace.gte(oneMillionAda)
    ? currentValueAsLovelace
        .div(oneMillionAda)
        .round(2, Big.roundDown)
        .toString() +
        "M " +
        adaSymbol
    : currentValueAsLovelace.gte(tenThousandAda)
    ? currentValueAsLovelace
        .div(oneThousandAda)
        .round(2, Big.roundDown)
        .toString() +
      "k " +
      adaSymbol
    : lovelaceToAda(currentValueAsLovelace).round(2, Big.roundDown).toString() +
      " " +
      adaSymbol;
};

export const formatLovelaceAsAda = (lovelace: Big, adaSymbol: string): string => {
    const oneAda = Big(1_000_000);
    const tenThousandAda = Big(10_000).mul(oneAda)
    const oneMillionAda = oneAda.mul(oneAda)

    return lovelace.gte(oneMillionAda)
      ? `${lovelace.div(oneMillionAda).round(2, Big.roundDown).toString()} M ${adaSymbol}`
      : lovelace.gte(tenThousandAda)
      ? `${lovelace.div(tenThousandAda).round(2, Big.roundDown).toString()} k ${adaSymbol}`
      : `${lovelace.div(oneAda).round(2, Big.roundDown).toString()} ${adaSymbol}`
}

export const formatAmountRatio = (
  numerator: Big,
  denominator: Big
): [string, string] => {
  return [formatAmount(numerator), formatAmount(denominator)];
};

export const formatValueRatio = (
  numeratorAsLovelace: Big,
  denominatorAsLovelace: Big
): [string, string, string] => {
  const oneMillionAda = Big(1_000_000_000_000);
  const tenThousandAda = Big(10_000_000_000);
  return denominatorAsLovelace.gte(oneMillionAda)
    ? [
        numeratorAsLovelace
          .div(oneMillionAda)
          .round(2, Big.roundDown)
          .toLocaleString(),
        denominatorAsLovelace
          .div(oneMillionAda)
          .round(2, Big.roundDown)
          .toLocaleString(),
        "M " + adaSymbol,
      ]
    : denominatorAsLovelace.gte(tenThousandAda)
    ? [
        numeratorAsLovelace
          .div(tenThousandAda)
          .mul(10)
          .round(4, Big.roundDown)
          .toLocaleString(),
        denominatorAsLovelace
          .div(tenThousandAda)
          .mul(10)
          .round(4, Big.roundDown)
          .toLocaleString(),
        "k " + adaSymbol,
      ]
    : [
        lovelaceToAda(numeratorAsLovelace).toLocaleString(),
        lovelaceToAda(denominatorAsLovelace).toLocaleString(),
        adaSymbol,
      ];
};

const epochsPerMonth = Big(6);

/**
 * Formats amount as months
 * 
 * @param amount - Amount to format
 * @param capitalize - Whether to capitalize month
 * @param shorten - Whether to shorten month
 * @returns Formatted string
 */
export const formatAsMonths = (
  amount: number | Big | null,
  capitalize?: boolean,
  shorten?: boolean
): string => {
  if (amount === null) return "N/A";
  const epochsAsBig =
    typeof amount === "number"
      ? Big(amount).round(0, Big.roundDown)
      : amount.round(0, Big.roundDown);
  const epochsAsMonths = epochsAsBig.div(epochsPerMonth);
  const remainder = epochsAsBig.mod(epochsPerMonth);
  const epochsAsMonthsRounded = epochsAsMonths.round(0, Big.roundDown);
  const m = capitalize ? "M" : "m";
  const body = shorten ? "o" : "onth";
  return remainder.eq(0)
    ? `${epochsAsMonthsRounded.toString()} ${m}${body}${
        epochsAsMonthsRounded.eq(1) ? "" : "s"
      }`
    : epochsAsMonthsRounded.gt(0)
    ? `${epochsAsMonthsRounded.toString()} + ${remainder.toString()}/6 ${m}${body}s`
    : `${epochsAsBig.toString()}/6 ${m}${body}s`;
};

/**
 * Type guard for filtering arrays
 * 
 * @param predicate - Type guard predicate
 * @returns Filtered array
 */
export const filter =
  <B>(predicate: (a: any) => a is B) =>
  (as: any[]): B[] => {
    const bs = [];
    for (const a of as) {
      if (predicate(a)) bs.push(a);
    }
    return bs;
  };

/**
 * Converts address to stake address
 * 
 * @param bech32 - Bech32 encoded address
 * @returns Stake address or null
 */
export const addressToStakeAddress = (bech32: string): string | null => {
  const stakeAddress = bech32ToAddress(bech32).match({
    Success: (enrichedAddress: any) => {
      const stakeCredential = enrichedAddress.stakeCredential;
      if (stakeCredential !== undefined && stakeCredential.kind === "KeyHash") {
        return getRewardAddress2(
          paymentCredentialToStorableCredential(stakeCredential)
        );
      }
      return null;
    },
    Failure: (_: any) => null,
  });
  return stakeAddress;
};

/**
 * Converts relative epoch to absolute epoch
 * 
 * @param relativeEpoch - Relative epoch number
 * @returns Absolute epoch number
 */
export const relativeEpochToAbsoluteEpoch = (relativeEpoch: number): number => {
  return network.epochBoundaryAsEpoch + relativeEpoch + 1;
};
