import {createAsyncThunk} from '@reduxjs/toolkit';
import {cardanoNetwork, optimServerUrl} from '../config.local';
import {C, Lucid, Blockfrost as LucidBlockfrost, Tx, Address, OutputData, UTxO, TxComplete, fromHex, RewardAddress, networkToId, utxoToCore} from 'lucid-cardano';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch, GetThunkAPIConfig, ThunkAPI } from './index';
import {useEffect, useLayoutEffect, useRef} from 'react';
import * as L from 'lucid-cardano';
import { LucidExt } from '../lucid-ext';


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// no dependencies on the callback because we only want to cleanup
// intervals on component unmount
export function useInterval(name: string, callback: any, delay: number, deps?: any[]) {
  const savedCallback = useRef(callback)
  useEffect(() => {
    savedCallback.current = callback;
  }, deps ? deps : []);

  // runs twice because of React.StrictMode
  useEffect(() => {
    savedCallback.current();
  }, deps ? deps : [])

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      console.log('setInterval: ' + name + " " + id)
      // this is run after next render, before the next useEffect (any useEffect)
      return () => {
        clearInterval(id);
        console.log('clearInterval: ' + name + " " + id)
      };
    }
  }, [delay]);
}

export function useLayoutInterval(name: string, callback: any, delay: number, deps?: any[]) {
  const savedCallback = useRef(callback)
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, deps ? deps : []);

  // runs twice because of React.StrictMode
  useLayoutEffect(() => {
    savedCallback.current();
  }, deps ? deps : [])

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      console.log('setInterval: ' + name + " " + id)
      // this is run after next render, before the next useEffect (any useEffect)
      return () => {
        clearInterval(id);
        console.log('clearInterval: ' + name + " " + id)
      };
    }
  }, [delay, name]);
}

export const createAsyncThunkk = <P, R = string>(name: string, callback: (params: P, thunkAPI: ThunkAPI) => Promise<R>) =>
  createAsyncThunk<R, P, GetThunkAPIConfig<ThunkAPI>>(name, callback);

// delegates to blockfrost except for protocol params
class BlockchainProvider implements L.Provider {
  blockfrost: LucidBlockfrost

  constructor(blockfrostEndpoint: string, blockfrostKey?: string) {
    this.blockfrost = new LucidBlockfrost(blockfrostEndpoint, blockfrostKey)
  }

  async getProtocolParameters(): Promise<L.ProtocolParameters> {
    const requestOptions = {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
      // body: Json.stringify(signedTxRequest),
    }
    const httpResponse = await fetch(
      `${optimServerUrl}/ogmios-proto-params`,
      requestOptions
    )
    const responseBodyJson = await httpResponse.json()
    console.log(responseBodyJson)

    if (responseBodyJson.tag === 'OK') {
      const result = responseBodyJson.contents
      const costModels: any = {}
      Object.keys(result.plutusCostModels).forEach((v) => {
        const version = v.split(":")[1].toUpperCase();
        const plutusVersion = "Plutus" + version;
        costModels[plutusVersion] = result.plutusCostModels[v];
      });
      const [memNum, memDenom] = result.scriptExecutionPrices.memory.split("/");
      const [stepsNum, stepsDenom] = result.scriptExecutionPrices.cpu.split("/");
      console.log(result)
      console.log(costModels)
      return {
        minFeeA: parseInt(result.minFeeCoefficient),
        minFeeB: parseInt(result.minFeeConstant.ada.lovelace),
        maxTxSize: parseInt(result.maxTransactionSize),
        maxValSize: parseInt(result.maxValueSize),
        keyDeposit: BigInt(result.stakeCredentialDeposit.ada.lovelace),
        poolDeposit: BigInt(result.stakePoolDeposit.ada.lovelace),
        priceMem: parseInt(memNum) / parseInt(memDenom),
        priceStep: parseInt(stepsNum) / parseInt(stepsDenom),
        maxTxExMem: BigInt(result.maxExecutionUnitsPerTransaction.memory),
        maxTxExSteps: BigInt(
          result.maxExecutionUnitsPerTransaction.cpu,
        ),
        coinsPerUtxoByte: BigInt(result.minUtxoDepositCoefficient),
        collateralPercentage: parseInt(result.collateralPercentage),
        maxCollateralInputs: parseInt(result.maxCollateralInputs),
        minfeeRefscriptCostPerByte: 15,
        costModels,
      }
    } else {
      console.error('Could not get protocol parameters')
      console.error(responseBodyJson.contents)
      throw responseBodyJson.contents
    }
  }
  getUtxos(addressOrCredential: string | L.Credential): Promise<L.UTxO[]> {
    return this.blockfrost.getUtxos(addressOrCredential)
  }
  getUtxosWithUnit(addressOrCredential: string | L.Credential, unit: string): Promise<L.UTxO[]> {
    return this.blockfrost.getUtxosWithUnit(addressOrCredential, unit)
  }
  getUtxoByUnit(unit: string): Promise<L.UTxO> {
    return this.blockfrost.getUtxoByUnit(unit)
  }
  getUtxosByOutRef(outRefs: L.OutRef[]): Promise<L.UTxO[]> {
    return this.blockfrost.getUtxosByOutRef(outRefs)
  }
  getDelegation(rewardAddress: string): Promise<L.Delegation> {
    return this.blockfrost.getDelegation(rewardAddress)
  }
  getDatum(datumHash: string): Promise<string> {
    return this.blockfrost.getDatum(datumHash)
  }
  awaitTx(txHash: string, checkInterval?: number): Promise<boolean> {
    return this.blockfrost.awaitTx(txHash, checkInterval)
  }
  submitTx(tx: string): Promise<string> {
    return this.blockfrost.submitTx(tx)
  }

}

Tx.prototype.complete = async function (options?: {
  change?: { address?: Address; outputData?: OutputData };
  coinSelection?: boolean;
  nativeUplc?: boolean;
  utxos?: UTxO[];
}): Promise<TxComplete> {
  const tasks = Reflect.get(this, "tasks");
  const lucid = Reflect.get(this, "lucid");
  if (
    [
      options?.change?.outputData?.hash,
      options?.change?.outputData?.asHash,
      options?.change?.outputData?.inline,
    ].filter((b) => b)
      .length > 1
  ) {
    throw new Error(
      "Not allowed to set hash, asHash and inline at the same time.",
    );
  }

  let task = tasks.shift();
  while (task) {
    await task(this);
    task = tasks.shift();
  }

  const utxos: C.TransactionUnspentOutputs =
    options?.utxos === undefined
    ? await lucid.wallet.getUtxosCore()
    : (() => {
        const utxos = C.TransactionUnspentOutputs.new();
        options.utxos.forEach((utxo) => {
          utxos.add(utxoToCore(utxo))
        })
        return utxos
      })()

  const changeAddress: C.Address = addressFromWithNetworkCheck(
    options?.change?.address || (await lucid.wallet.address()),
    lucid,
  );

  if (options?.coinSelection || options?.coinSelection === undefined) {
    this.txBuilder.add_inputs_from(
      utxos,
      changeAddress,
      Uint32Array.from([
        200, // weight ideal > 100 inputs
        1000, // weight ideal < 100 inputs
        1500, // weight assets if plutus
        800, // weight assets if not plutus
        800, // weight distance if not plutus
        5000, // weight utxos
      ]),
    );
  }

  this.txBuilder.balance(
    changeAddress,
    (() => {
      if (options?.change?.outputData?.hash) {
        return C.Datum.new_data_hash(
          C.DataHash.from_hex(
            options.change.outputData.hash,
          ),
        );
      } else if (options?.change?.outputData?.asHash) {
        this.txBuilder.add_plutus_data(
          C.PlutusData.from_bytes(
            fromHex(options.change.outputData.asHash),
          ),
        );
        return C.Datum.new_data_hash(
          C.hash_plutus_data(
            C.PlutusData.from_bytes(
              fromHex(options.change.outputData.asHash),
            ),
          ),
        );
      } else if (options?.change?.outputData?.inline) {
        return C.Datum.new_data(
          C.Data.new(
            C.PlutusData.from_bytes(
              fromHex(options.change.outputData.inline),
            ),
          ),
        );
      } else {
        return undefined;
      }
    })(),
  );

  return new TxComplete(
    lucid,
    await this.txBuilder.construct(
      utxos,
      changeAddress,
      options?.nativeUplc === undefined ? true : options?.nativeUplc,
    ),
  );
};

function addressFromWithNetworkCheck(
  address: Address | RewardAddress,
  lucid: Lucid,
): C.Address {
  const { type, networkId } = lucid.utils.getAddressDetails(address);

  const actualNetworkId = networkToId(lucid.network);
  if (networkId !== actualNetworkId) {
    throw new Error(
      `Invalid address: Expected address with network id ${actualNetworkId}, but got ${networkId}`,
    );
  }
  return type === "Byron"
    ? C.ByronAddress.from_base58(address).to_address()
    : C.Address.from_bech32(address);
}

// this should be in its own lucid service
export const lucid: LucidExt = await Lucid.new(new BlockchainProvider('', undefined), cardanoNetwork);
