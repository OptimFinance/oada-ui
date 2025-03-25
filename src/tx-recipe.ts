/**
 * Transaction Recipe Module
 * 
 * This module provides a high-level abstraction for building Cardano transactions:
 * - Defines transaction recipe types for structured transaction building
 * - Handles conversion between recipe types and Lucid transaction types
 * - Manages UTxO handling, minting, withdrawals, and outputs
 * - Supports script validation and witness handling
 */

import { Assets, OutputData, Script, slotToBeginUnixTime, SLOT_CONFIG_NETWORK, UTxO } from "lucid-cardano";
import { LucidExt, TxExt } from "./lucid-ext";

/**
 * Transaction Input with Spending Witness
 * 
 * Represents a UTxO being spent in a transaction, including:
 * - Transaction input details (reference and output)
 * - Witness data for validation
 */
export type TxInSpend = {
  txIn: TxIn;
  witness: SpendWitness;
};

/**
 * Transaction Input
 * 
 * Represents a UTxO reference and its associated output data
 */
export type TxIn = {
  txOutRef: UtxoRef;
  txOut: TxOut;
};

/**
 * Script Reference Type
 * 
 * Represents either an inline script or a reference to a script in a UTxO
 */
type TxRecipeScript = {
  tag: "Script";
  cbor: string;
} | {
  tag: "ScriptRef";
  txIn: TxIn;
  cbor: string;
}

/**
 * Spending Witness Type
 * 
 * Represents either a key-based or script-based witness for spending UTxOs
 */
export type SpendWitness = {
  tag: "SpendWitnessKey";
} | {
  tag: "SpendWitnessScript";
  script: TxRecipeScript;
  redeemer: string;
};

/**
 * Transaction Output
 * 
 * Represents an output in a transaction, including:
 * - Destination address
 * - Value (assets)
 * - Optional datum
 * - Optional reference script
 */
export type TxOut = {
  address: string; // bech32
  value: Value;
  datum: Datum | null;
  refScript: string | null;
};

/**
 * Value Type
 * 
 * Represents a collection of assets with their quantities
 * Format: { "policyId.tokenName": bigint }
 */
export type Value = {
  [assetClass: string]: bigint;
};

/**
 * Datum Type
 * 
 * Represents Plutus datum with CBOR encoding and inline flag
 */
export type Datum = {
  cbor: string;
  isInline: boolean;
};

/**
 * UTxO Reference
 * 
 * Represents a UTxO reference in the format "txHash#index"
 */
export type UtxoRef = string;

/**
 * Minting Witness Type
 * 
 * Represents script-based witness for minting assets
 */
type MintWitness = {
  script: TxRecipeScript;
  redeemer: string;
}

/**
 * Mint Operation Type
 * 
 * Represents a minting operation with:
 * - Witness data
 * - Policy ID
 * - Token name
 * - Amount to mint
 */
export type Mint = {
  witness: MintWitness;
  policyId: string;
  tokenName: string;
  amount: bigint;
};

/**
 * Withdrawal Witness Type
 * 
 * Represents either a key-based or script-based witness for withdrawing rewards
 */
export type WithdrawWitness = {
  tag: "WithdrawWitnessKey";
} | {
  tag: "WithdrawWitnessScript";
  script: TxRecipeScript;
  redeemer: string;
};

/**
 * Withdrawal Operation Type
 * 
 * Represents a withdrawal operation with:
 * - Witness data
 * - Stake address
 * - Amount to withdraw
 */
export type Withdraw = {
  witness: WithdrawWitness;
  stakeAddress: string; // stake address bech32
  amount: bigint;
}

/**
 * Transaction Recipe Type
 * 
 * Complete recipe for building a transaction, including:
 * - Input references and spends
 * - Minting operations
 * - Withdrawal operations
 * - Outputs
 * - Validity intervals
 * - Metadata
 * - Required signers
 */
export type TxRecipe = {
  txInRefs: TxIn[];
  txInSpends: TxInSpend[];
  mints: Mint[];
  withdraws: Withdraw[];
  txOuts: TxOut[];
  validityStartSlot: number | null;
  validityEndSlot: number | null;
  txMetadata: string | null;
  requiredSignerPkhs: string[];
};

/**
 * Converts a Value type to Lucid Assets type
 * 
 * @param value - Value to convert
 * @returns Lucid Assets object
 */
const valueToLucidAssets = (value: Value): Assets => {
  // TODO
  const assets: Assets = {};
  for (const [assetClass, amount] of Object.entries(value)) {
    const [policyId, tokenName] = assetClass.split(".");
    if (policyId === "lovelace") {
      assets["lovelace"] = BigInt(amount);
    } else {
      assets[`${policyId}${tokenName}`] = BigInt(amount);
    }
  }
  return assets;
};

/**
 * Converts a Mint operation to Lucid mint format
 * 
 * @param mint - Mint operation to convert
 * @returns Tuple of [Assets, MintWitness]
 */
const mintToLucidMint = (mint: Mint): [Assets, MintWitness] => {
  const policyId = mint.policyId;
  const tokenName = mint.tokenName;
  const amount = mint.amount;

  const assets: Assets = {}
  assets[`${policyId}${tokenName}`] = amount;

  return [assets, mint.witness]
}

/**
 * Converts multiple Mint operations to Lucid mint format
 * 
 * @param mints - Array of mint operations to convert
 * @returns Array of [Assets, MintWitness] tuples
 */
const mintsToLucidMints = (mints: Mint[]): [Assets, MintWitness][] => {
  const lucidMints: [Assets, MintWitness][] = []
  for (const mint of mints) {
    lucidMints.push(mintToLucidMint(mint))
  }
  return lucidMints;
};

/**
 * Converts a TxInSpend to a UTxO and Witness pair
 * 
 * @param spend - Transaction input spend to convert
 * @returns Tuple of [UTxO, SpendWitness]
 */
const txInSpendToUTxOWitnessPair = (
  spend: TxInSpend,
): [UTxO, SpendWitness] => {
  const utxo = txInToUTxO(spend.txIn);
  const witness = spend.witness;
  return [utxo, witness];
};

/**
 * Converts a UTxO reference to a [txHash, outputIndex] pair
 * 
 * @param utxoRef - UTxO reference to convert
 * @returns Tuple of [txHash, outputIndex]
 */
const utxoRefToPair = (utxoRef: UtxoRef): [string, number] => {
  // NOTE: if this errors it's a bug
  const [txHash, outputIndex] = utxoRef.split("#");
  return [txHash, Number(outputIndex)];
};

/**
 * Converts a TxIn to a Lucid UTxO
 * 
 * @param txIn - Transaction input to convert
 * @returns Lucid UTxO object
 */
const txInToUTxO = (txIn: TxIn): UTxO => {
  const [txHash, outputIndex] = utxoRefToPair(txIn.txOutRef);
  const txOut = txIn.txOut;
  let refScript: Script | null =
    (txOut.refScript !== null)
      ? ({ type: 'PlutusV2', script: txOut.refScript })
      : null;

  if (txOut.refScript) {
    refScript = {
      type: "PlutusV2" as const,
      script: txOut.refScript,
    };
  }
  return {
    txHash,
    outputIndex,
    address: txOut.address,
    assets: valueToLucidAssets(txOut.value),
    datum: txOut.datum?.cbor,
    scriptRef: refScript,
  };
};

/**
 * Converts a Transaction Recipe to a Lucid Transaction
 * 
 * This function handles:
 * - Reading from UTxOs
 * - Collecting inputs with witnesses
 * - Minting assets
 * - Withdrawing rewards
 * - Setting outputs
 * - Configuring validity intervals
 * - Adding required signers
 * 
 * @param lucid - Lucid instance
 * @param txRecipe - Transaction recipe to convert
 * @returns Lucid Transaction
 */
export const txRecipeToTx =
  (lucid: LucidExt) => (txRecipe: TxRecipe): TxExt => {
    let tx = lucid.newTx();

    const txInRefUtxos = txRecipe.txInRefs.map(txInToUTxO);
    tx = tx.readFrom(txInRefUtxos);

    const spends = txRecipe.txInSpends.map(txInSpendToUTxOWitnessPair);
    for (const [utxo, witness] of spends) {
      if (witness.tag === "SpendWitnessScript") {
        const redeemer = witness.redeemer;
        const txRecipeScript = witness.script;
        if (txRecipeScript.tag === "Script") {
          const validator = {
            type: "PlutusV2" as const,
            script: txRecipeScript.cbor,
          };
          tx = tx.attachSpendingValidator(validator);
        } else {
          const refInput = txInToUTxO(txRecipeScript.txIn);
          tx = tx.readFrom([refInput]);
        }
        tx = tx.collectFrom([utxo], redeemer);
      } else {
        tx = tx.collectFrom([utxo], undefined);
      }
    }

    const lucidMints = mintsToLucidMints(txRecipe.mints);
    lucidMints.forEach(([assets, witness]) => {
      const redeemer = witness.redeemer;
      if (witness.script.tag === "Script") {
        const script: Script = {
          type: "PlutusV2" as const,
          script: witness.script.cbor,
        };
        tx = tx.attachMintingPolicy(script);
      } else {
        const refInput = txInToUTxO(witness.script.txIn);
        tx = tx.readFrom([refInput]);
      }
      tx = tx.mintAssets(assets, redeemer);
    })

    for (const withdraw of txRecipe.withdraws) {
      const stakeAddress = withdraw.stakeAddress;
      const amount = withdraw.amount;
      const witness = withdraw.witness;
      if (witness.tag === "WithdrawWitnessScript") {
        const txRecipeScript = witness.script;
        if (txRecipeScript.tag === "Script") {
          const script: Script = {
            type: "PlutusV2" as const,
            script: txRecipeScript.cbor,
          };
          tx = tx.attachWithdrawalValidator(script);
        } else {
          const refInput = txInToUTxO(txRecipeScript.txIn);
          tx = tx.readFrom([refInput]);
        }
        const redeemer = witness.redeemer;
        tx = tx.withdraw(stakeAddress, amount, redeemer);
      } else {
        tx = tx.withdraw(stakeAddress, amount, undefined);
      }
    }

    for (const txOut of txRecipe.txOuts) {
      const address = txOut.address;
      const assets = valueToLucidAssets(txOut.value);
      const outputData: OutputData = {};
      if (txOut.datum) {
        if (txOut.datum.isInline) {
          outputData.inline = txOut.datum.cbor;
        } else {
          outputData.asHash = txOut.datum.cbor;
        }
        const scriptRef = txOut.refScript === null
          ? undefined
          : { type: "PlutusV2" as const, script: txOut.refScript };
        outputData.scriptRef = scriptRef;
      }
      tx = tx.payToAddressWithData(address, outputData, assets);
    }

    if (txRecipe.validityStartSlot !== null) {
      const slotConfig = SLOT_CONFIG_NETWORK[lucid.network];
      tx = tx.validFrom(
        slotToBeginUnixTime(Number(txRecipe.validityStartSlot), slotConfig),
      );
    }

    if (txRecipe.validityEndSlot !== null) {
      const slotConfig = SLOT_CONFIG_NETWORK[lucid.network];
      tx = tx.validTo(
        slotToBeginUnixTime(Number(txRecipe.validityEndSlot), slotConfig),
      );
    }

    for (const pkh of txRecipe.requiredSignerPkhs) {
      tx = tx.addSignerKey(pkh);
    }

    return tx;
  };

