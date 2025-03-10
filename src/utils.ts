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

export type Assets = {
  [assetClass: string]: bigint
}

export type Utxo = {
  txId: string,
  txIx: number,
  address: Address,
  assets: Assets,
  datumHash?: string,
}

// yet another address type
export type Address = { bech32: string, paymentCredential: PaymentCredential, stakeCredential?: StakeCredential }

export type PaymentCredential = KeyHash | ScriptHash
export type KeyHash = { kind: 'KeyHash',  hash: string }
export type ScriptHash = { kind: 'ScriptHash', hash: string}
export type StakeCredential = PaymentCredential | StakePointer
export type StakePointer = { 
  kind: 'StakePointer',
  slot: bigint,
  txIndex: bigint,
  dcertIndex: bigint
}


const {BaseAddress, EnterpriseAddress, PointerAddress } = C;

const lucidAssetsToAssets = (lucidAssets: Lucid.Assets): St.Assets => {
  const assets: St.Assets = {}
  for (const [unit, quantity] of Object.entries(lucidAssets)) {
    assets[unit] = quantity.toString()
  }
  return assets
}

export const lucidUtxoToUtxo = (lucidUtxo: Lucid.UTxO): St.Utxo => {
  return {
    txId: lucidUtxo.txHash,
    txIx: Number(lucidUtxo.outputIndex),
    address: lucidUtxo.address,
    assets: lucidAssetsToAssets(lucidUtxo.assets),
    datumHash: lucidUtxo.datumHash ?? undefined
  }
}

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

export type BasicResponse<A> = OkResponse<A> | FailResponse

export type OkResponse<A> = {
  tag: 'OK',
  contents: A
}

export type FailResponse = {
  tag: 'Fail'
  contents: string
}

export const isBasicResponse = <T>(contentsTypeGuard: (o: any) => o is T) => (o: any): o is BasicResponse<T> => {
  console.log('isBasicResponse')
  console.log(o)
  return typeof o === 'object'
    && (o.tag === 'OK' || o.tag === 'Fail')
    && contentsTypeGuard(o.contents)
}

export const isNumber = (n: any): n is number => {
  return typeof n === 'number'
}

export const flatten = <T>(arrayOfArrays: T[][]): T[] => ([] as T[]).concat(...arrayOfArrays)

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


export const tokenNameToVerifiedName = (verifiedNameMap: VerifiedNameMap) => (tokenName: string, poolSize: Big): string => {
  const verifiedName = getVerifiedName(verifiedNameMap, tokenName, poolSize)
  return verifiedName === null ? tokenName : verifiedName.name
}

export const getVerifiedName = (verifiedNameMap: VerifiedNameMap, tokenName: string, size: Big): VerifiedName | null => {
  const verifiedName = verifiedNameMap[tokenName]
  return verifiedName === undefined
  ? null
  : verifiedName[size.toString()]
}


export const copyToClipboard = (value: string) => {
  navigator.clipboard.writeText(value);
}

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

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const zip = <A, B>(array1: A[], array2: B[]): (readonly [A, B])[] => {
  const l = array1.length > array2.length ? array2.length : array1.length
  const result = []
  for (let i = 0; i < l; i++) {
    result.push([array1[i], array2[i]] as const)
  }
  return result
}

export const resize = (width: number, height: number) => (svg: SVGSVGElement) => {
  svg.setAttribute('style', `height: ${height}px; width: ${width}px`)
  const rect = svg.querySelector('rect')
  if (rect !== null) {
    rect.setAttribute('style', `height: ${height}px; width: ${width}px;`)
  }
}

export const min = (a: Big, b: Big) => a.lt(b) ? a : b
export const max = (a: Big, b: Big) => a.gt(b) ? a : b

export const range = (start: number, stop: number, step: number): number[] =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

export function storeToUtxoRef(utxoRef: St.UtxoRef): S.UtxoRef {
  return {
    ...utxoRef,
    outputIndex: Number(utxoRef.outputIndex),
  };
}

/**
 * The idea behind this module is a translation layer between types from
 * the outside (e.g Blockfrost, Lucid) to our domain types (e.g. Address, 
 * BondUtxo)
 *
 * Not as necessary any more as most blockfrost was replaced (except for)
 * Verify Bond which can also be replaced easily now.
 */
export type CoreAddress = C.BaseAddress | C.EnterpriseAddress | C.PointerAddress

class NoPaymentCredentialError extends Error {
  constructor(public name: 'NoPaymentCredentialError' = 'NoPaymentCredentialError') {
    super()
  }
}

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

const coreAddressToPaymentCredential = (coreAddress: CoreAddress): Result<PaymentCredential, NoPaymentCredentialError> => {
  if (coreAddress instanceof BaseAddress || coreAddress instanceof PointerAddress || coreAddress instanceof EnterpriseAddress) {
    const coreStakeCredential = coreAddress.payment_cred()
    return coreStakeCredentialToPaymentCredential(coreStakeCredential)
  } else {
    return Result.failure(new NoPaymentCredentialError())
  }
}

class AddressIsNotBaseOrPointerError extends Error {
  constructor(public name: 'AddressIsNotBaseOrPointerError' = 'AddressIsNotBaseOrPointerError') {
    super()
  }
}
type AddressHasNoStakeCredentialError =
  | NoPaymentCredentialError
  | AddressIsNotBaseOrPointerError


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

class Bech32IsNotAddressError extends Error {
  constructor(public error?: Error, public name: 'Bech32IsNotAddressError' = 'Bech32IsNotAddressError') {
    super(error !== undefined ? error.message : '')
  }
}
type Bech32ToAddressError =
  | Bech32IsNotAddressError
  | NoPaymentCredentialError
  | AddressHasNoStakeCredentialError

// doesn't handle byron or reward addresses
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
export function serverToUtxoRef(sur: S.UtxoRef): St.UtxoRef {
  return {
    ...sur,
    outputIndex: sur.outputIndex.toString()
  }
}
const adaSymbol = "₳";

export function lovelaceToAda(lovelace: Big): Big {
  return lovelace.div(Big(1_000_000));
}

export const isNullOrErr = <E>(o: any): o is null | Err<E> => {
  return o === null || o.tag === "Err";
};

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

export const formatDecimalAsPercent = (interestRate: Big): string => {
  return interestRate.mul(100).round(2, Big.roundHalfEven).toString() + "%";
};

export const formatRateAsPercentAda = (rate: Big): string => {
  return `${rate
    .mul(100)
    .round(2, Big.roundHalfEven)
    .toString()}% ${adaSymbol}`;
};

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

// rounds down to the nearest whole amount
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



export const filter =
  <B>(predicate: (a: any) => a is B) =>
  (as: any[]): B[] => {
    const bs = [];
    for (const a of as) {
      if (predicate(a)) bs.push(a);
    }
    return bs;
  };

// aka bech32 address to reward address
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

// the relative epoch starts at 0 so the actual epoch adds 1 to the
// epoch boundary to get the absolute epoch
// used for the bondchart which current takes numbers which is why
// we use numbers instead of Big
export const relativeEpochToAbsoluteEpoch = (relativeEpoch: number): number => {
  return network.epochBoundaryAsEpoch + relativeEpoch + 1;
};
