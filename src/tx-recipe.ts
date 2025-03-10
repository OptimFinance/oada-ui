import { Assets, OutputData, Script, slotToBeginUnixTime, SLOT_CONFIG_NETWORK, UTxO } from "lucid-cardano";
import { LucidExt, TxExt } from "./lucid-ext";

export type TxInSpend = {
  txIn: TxIn;
  witness: SpendWitness;
};

export type TxIn = {
  txOutRef: UtxoRef;
  txOut: TxOut;
};

type TxRecipeScript = {
  tag: "Script";
  cbor: string;
} | {
  tag: "ScriptRef";
  txIn: TxIn;
  cbor: string;
}

export type SpendWitness = {
  tag: "SpendWitnessKey";
} | {
  tag: "SpendWitnessScript";
  script: TxRecipeScript;
  redeemer: string;
};

export type TxOut = {
  address: string; // bech32
  value: Value;
  datum: Datum | null;
  refScript: string | null;
};

// assetClass: policyId.tokenName
export type Value = {
  [assetClass: string]: bigint;
};

export type Datum = {
  cbor: string;
  isInline: boolean;
};

// utxoRef: txHash#index
export type UtxoRef = string;

type MintWitness = {
  script: TxRecipeScript;
  redeemer: string;
}

export type Mint = {
  witness: MintWitness;
  policyId: string;
  tokenName: string;
  amount: bigint;
};

export type WithdrawWitness = {
  tag: "WithdrawWitnessKey";
} | {
  tag: "WithdrawWitnessScript";
  script: TxRecipeScript;
  redeemer: string;
};

export type Withdraw = {
  witness: WithdrawWitness;
  stakeAddress: string; // stake address bech32
  amount: bigint;
}

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

const mintToLucidMint = (mint: Mint): [Assets, MintWitness] => {
  const policyId = mint.policyId;
  const tokenName = mint.tokenName;
  const amount = mint.amount;

  const assets: Assets = {}
  assets[`${policyId}${tokenName}`] = amount;

  return [assets, mint.witness]
}

const mintsToLucidMints = (mints: Mint[]): [Assets, MintWitness][] => {
  const lucidMints: [Assets, MintWitness][] = []
  for (const mint of mints) {
    lucidMints.push(mintToLucidMint(mint))
  }
  return lucidMints;
};

const txInSpendToUTxOWitnessPair = (
  spend: TxInSpend,
): [UTxO, SpendWitness] => {
  const utxo = txInToUTxO(spend.txIn);
  const witness = spend.witness;
  return [utxo, witness];
};

const utxoRefToPair = (utxoRef: UtxoRef): [string, number] => {
  // NOTE: if this errors it's a bug
  const [txHash, outputIndex] = utxoRef.split("#");
  return [txHash, Number(outputIndex)];
};

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

// 0. Tx.complete() is monkey patched so that it can take (virtual) utxos that we give it
// 1. we must also make sure to give it a change address (this is the default)
// 2. we must also make sure to use nativeUplc (this is the default)
// The above allows this function to be almost pure when `complete()` is called.
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

