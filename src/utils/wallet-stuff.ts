import * as Lucid from 'lucid-cardano'
import cloneDeep from "lodash.clonedeep"
import makeJSONBigInt, { } from "json-bigint"
import { C, UTxO } from "lucid-cardano"
import Big from "big.js"
import * as Server from '../types/server'

const JSONBigInt = makeJSONBigInt({ useNativeBigInt: true, alwaysParseAsBig: true, constructorAction: 'preserve' })

export type WalletUtxoMap = {
  outputUtxosRefByWalletUtxoId: {
    // wallet inputs mapping to tx outputs
    // txId#oix -> txId#oix1,oix2,...
    [walletUtxoId: string]: string
  },
  outputUtxosByOutputUtxosRef: {
    // not that much point is using Set here because javascript Set is neutered
    // and have to do conversions to array anyway
    // tx output refs to output details
    // txId#oix1,oix2,... -> [u1, u2, ...]
    [outputUtxosRef: string]: Server.Utxo[]
  },
  walletUtxoIdsByOutputUtxosRef: {
    // tx outputs to wallet inputs
    // txId#oix1,oix2,... -> [txId#oix, txId#oix1, ...]
    [outputUtxosRef: string]: Set<string>
  }
}

const utxoRefToString = (utxoRef: Server.UtxoRef): string => {
  return utxoRef.txHash + '#' + utxoRef.outputIndex
}

// the merged wallet map creates copies of both maps before merging
export const mergeWalletUtxoMap = (a: WalletUtxoMap, b: WalletUtxoMap): WalletUtxoMap => {
  const newOutputUtxosRefByWalletUtxoId = cloneDeep({ ...a.outputUtxosRefByWalletUtxoId, ...b.outputUtxosRefByWalletUtxoId })
  const newOutputUtxosByOutputUtxosRef = cloneDeep({ ...a.outputUtxosByOutputUtxosRef, ...b.outputUtxosByOutputUtxosRef })
  const newWalletUtxoIdsByOutputUtxosRef = cloneDeep({ ...a.walletUtxoIdsByOutputUtxosRef, ...b.walletUtxoIdsByOutputUtxosRef })
  return {
    outputUtxosRefByWalletUtxoId: newOutputUtxosRefByWalletUtxoId,
    outputUtxosByOutputUtxosRef: newOutputUtxosByOutputUtxosRef,
    walletUtxoIdsByOutputUtxosRef: newWalletUtxoIdsByOutputUtxosRef
  }
}

const outputUtxosRefToTxHash = (outputUtxosRef: string): string => {
  return outputUtxosRef.split('#', 1)[0]
}

const walletUtxoIdToTxHash = (walletUtxoId: string): string => {
  return walletUtxoId.split('#', 1)[0]
}

function union<A>(setA: Set<A>, setB: Set<A>) {
  const _union = new Set(setA);
  for (const elem of setB) {
    _union.add(elem);
  }
  return _union;
}

// mutates WalletUtxoMap
const pruneTxHashes = (walletUtxoMap: WalletUtxoMap, onchainTxHashes: Set<string>): WalletUtxoMap => {
  if (onchainTxHashes.size === 0) {
    return walletUtxoMap;
  } else {
    const outputUtxosRefs = Object.keys(walletUtxoMap.outputUtxosByOutputUtxosRef)

    const onchainOutputUtxosRefs =
      outputUtxosRefs
        .filter(outputUtxosRef => onchainTxHashes.has(outputUtxosRefToTxHash(outputUtxosRef)))

    let uselessWalletUtxoIds: Set<string> = new Set([])
    for (const onchainOutputUtxosRef of onchainOutputUtxosRefs) {
      const _uselessWalletUtxoIds = walletUtxoMap.walletUtxoIdsByOutputUtxosRef[onchainOutputUtxosRef]
      if (_uselessWalletUtxoIds !== undefined) {
        uselessWalletUtxoIds = union(uselessWalletUtxoIds, _uselessWalletUtxoIds)
      }

      delete walletUtxoMap.outputUtxosByOutputUtxosRef[onchainOutputUtxosRef]
      delete walletUtxoMap.walletUtxoIdsByOutputUtxosRef[onchainOutputUtxosRef]
    }
    for (const uselessWalletUtxoId of uselessWalletUtxoIds) {
      delete walletUtxoMap.outputUtxosRefByWalletUtxoId[uselessWalletUtxoId]
    }

    const uselessTxHashes = new Set(Array.from(uselessWalletUtxoIds).map(walletUtxoId => walletUtxoIdToTxHash(walletUtxoId)))

    return pruneTxHashes(walletUtxoMap, uselessTxHashes)
  }
}

// mutates walletUtxoMap
export const pruneWalletUtxoMap = (walletUtxoMap: WalletUtxoMap, lucidWalletUtxos: Lucid.UTxO[]) => {
  const onchainTxHashes = new Set(lucidWalletUtxos.map(u => u.txHash))
  pruneTxHashes(walletUtxoMap, onchainTxHashes)
}

const utxoToWalletUtxoId = (utxo: Server.Utxo): string => {
  return utxoRefToString(utxo.utxoRef)
}

const getMostRecentUtxos = (walletUtxoMap: WalletUtxoMap, walletUtxoId: string): Server.Utxo[] => {
  const outputUtxosRef = walletUtxoMap.outputUtxosRefByWalletUtxoId[walletUtxoId]
  if (outputUtxosRef === undefined) {
    return []
  } else {
    const outputUtxos = walletUtxoMap.outputUtxosByOutputUtxosRef[outputUtxosRef]
    let finalMostRecentUtxos: Server.Utxo[] = []
    for (const outputUtxo of outputUtxos) {
      const outputWalletUtxoId = utxoToWalletUtxoId(outputUtxo)
      const mostRecentUtxos = getMostRecentUtxos(walletUtxoMap, outputWalletUtxoId)
      if (mostRecentUtxos.length === 0) {
        finalMostRecentUtxos.push(outputUtxo)
      } else {
        finalMostRecentUtxos = finalMostRecentUtxos.concat(mostRecentUtxos)
      }
    }
    return Array.from(new Set(finalMostRecentUtxos))
  }
}

const lucidUtxoToWalletUtxoId = (lucidUtxo: Lucid.UTxO): string => {
  return lucidUtxo.txHash + '#' + lucidUtxo.outputIndex
}

const lucidUtxosToOutputUtxosRef = (lucidUtxos: Lucid.UTxO[]): string => {
  const txId = lucidUtxos[0].txHash
  const indexes = lucidUtxos.map(u => u.outputIndex).join(',')
  return txId + '#' + indexes
}

export const getMostRecentUtxosFromLucidUtxos = (
  walletUtxoMap: WalletUtxoMap, lucidWalletUtxos: Lucid.UTxO[]
): [Lucid.UTxO[], Server.Utxo[]] => {
  // possibly mutates our walletUtxoMap
  pruneWalletUtxoMap(walletUtxoMap, lucidWalletUtxos)
  const remainingLucidUtxos: Lucid.UTxO[] = []
  let finalServerUtxos: Server.Utxo[] = []
  for (const lucidUtxo of lucidWalletUtxos) {
    const serverUtxos = getMostRecentUtxos(walletUtxoMap, lucidUtxoToWalletUtxoId(lucidUtxo))
    if (serverUtxos.length === 0) {
      remainingLucidUtxos.push(lucidUtxo)
    } else {
      finalServerUtxos = finalServerUtxos.concat(serverUtxos)
    }
  }
  return [remainingLucidUtxos, Array.from(new Set(finalServerUtxos))]
}

export const serverToWalletUtxoMap = (walletStuff: Server.WalletStuff): WalletUtxoMap => {
  const newWalletUtxoIdsByOutputUtxosRef =
    Object.fromEntries(Object.entries(walletStuff.walletUtxoIdsByOutputUtxosRef).map(([k, v]) => [k, new Set(v)]))
  const newOutputUtxosByOutputUtxosRef =
    Object.fromEntries(Object.entries(walletStuff.outputUtxosByOutputUtxosRef).map(([k, v]) => [k, [...v]]))
  return {
    outputUtxosRefByWalletUtxoId: { ...walletStuff.outputUtxosRefByWalletUtxoId },
    outputUtxosByOutputUtxosRef: newOutputUtxosByOutputUtxosRef,
    walletUtxoIdsByOutputUtxosRef: newWalletUtxoIdsByOutputUtxosRef
  }
}

const dehydrateWalletUtxoMap = (walletUtxoMap: WalletUtxoMap): string => {
  const arrayized = Object.fromEntries(
    Object.entries(walletUtxoMap.walletUtxoIdsByOutputUtxosRef).map(
      ([k, v]) => [k, Array.from(v.values())]
    )
  )
  return JSONBigInt.stringify({
    outputUtxosRefByWalletUtxoId: walletUtxoMap.outputUtxosRefByWalletUtxoId,
    outputUtxosByOutputUtxosRef: walletUtxoMap.outputUtxosByOutputUtxosRef,
    walletUtxoIdsByOutputUtxosRef: arrayized
  })

}

const emptyWalletStuff: Server.WalletStuff = {
  outputUtxosRefByWalletUtxoId: {},
  outputUtxosByOutputUtxosRef: {},
  walletUtxoIdsByOutputUtxosRef: {}
}

export const getWalletUtxoMap = (): WalletUtxoMap => {
  const dehydratedWalletStuff = localStorage.getItem('walletStuff')
  console.log("GET DEHYDRATED UTXO MAP")
  console.log(dehydratedWalletStuff)
  let walletStuff = emptyWalletStuff
  if (dehydratedWalletStuff !== null) {
    walletStuff = JSONBigInt.parse(dehydratedWalletStuff)
  }
  return serverToWalletUtxoMap(walletStuff)
}

export const setWalletUtxoMap = (walletUtxoMap: WalletUtxoMap) => {
  const jsonified = dehydrateWalletUtxoMap(walletUtxoMap)
  localStorage.setItem('walletStuff', jsonified)
}

// mutates map
function removeTxHashFromWalletUtxoMap(txHash: string, walletUtxoMap: WalletUtxoMap): void {
  for (const [outputUtxosRef, walletUtxoIds] of Object.entries(walletUtxoMap.walletUtxoIdsByOutputUtxosRef)) {
    const [outputUtxosTxHash] = outputUtxosRef.split("#", 1)
    if (outputUtxosTxHash === txHash) {
      for (const walletUtxoId of walletUtxoIds) {
        delete walletUtxoMap.outputUtxosRefByWalletUtxoId[walletUtxoId]
      }
      delete walletUtxoMap.outputUtxosByOutputUtxosRef[outputUtxosRef]
      delete walletUtxoMap.walletUtxoIdsByOutputUtxosRef[outputUtxosRef]
    }
  }
}

// mutates map
export function removeTxHashesFromWalletUtxoMap(txHashes: string[], walletUtxoMap: WalletUtxoMap): void {
  for (const txHash of txHashes) {
    removeTxHashFromWalletUtxoMap(txHash, walletUtxoMap)
  }
}

export function walletUtxoMapContainsTxHash(txHash: string, walletUtxoMap: WalletUtxoMap): boolean {
  return Object.keys(walletUtxoMap.walletUtxoIdsByOutputUtxosRef).map(k => k.split('#', 1)[0]).some(hash => hash === txHash)
}

const lucidToWalletUtxo = (lucidUtxo: Lucid.UTxO): Server.Utxo => {
  const assets = lucidUtxo.assets
  const value: Server.Value = { lovelace: 0n, assets: {} }
  for (const [assetId, quantity] of Object.entries(assets)) {
    if (assetId === 'lovelace') {
      value[assetId] = quantity
    } else {
      const policyId = assetId.slice(0, 56)
      const tokenName = assetId.slice(56)
      value.assets[`${policyId}.${tokenName}`] = quantity
    }
  }

  return {
    utxoRef: {
      txHash: lucidUtxo.txHash,
      outputIndex: lucidUtxo.outputIndex
    },
    address: lucidUtxo.address,
    value
  }
}

export const coreTxToWalletStuff = (coreTxBody: C.TransactionBody): Server.WalletStuff => {
  const coreInputs = coreTxBody.inputs()
  const coreInputsLen = coreInputs.len()
  const inputs: C.TransactionInput[] = []
  for (let i = 0; i < coreInputsLen; i++) {
    inputs.push(coreInputs.get(i))
  }
  const inputRefs: { txId: string, utxoIx: number }[] = inputs.map(input => {
    return {
      txId: input.transaction_id().to_hex(),
      utxoIx: Big(input.index().to_str()).toNumber(),
    }
  })
  const inputRefIds = inputRefs.map(inputRef => inputRef.txId + '#' + inputRef.utxoIx)
  const coreTxId = C.hash_transaction(coreTxBody)

  const coreOutputs = coreTxBody.outputs()
  const coreOutputsLen = coreOutputs.len()
  const lucidUtxos: Lucid.UTxO[] = []
  for (let i = 0; i < coreOutputsLen; i++) {
    const coreOutputRef = C.TransactionInput.new(coreTxId, C.BigNum.from_str(i.toString()))
    const coreOutput = coreOutputs.get(i)
    const coreUnspentTxOutput = C.TransactionUnspentOutput.new(coreOutputRef, coreOutput)
    const lucidUtxo = Lucid.coreToUtxo(coreUnspentTxOutput)
    lucidUtxos.push(lucidUtxo)
  }

  const outputUtxosRef = lucidUtxosToOutputUtxosRef(lucidUtxos)
  const walletUtxoIdToOutputUtxosRef: { [walletUtxoId: string]: string } = {}
  for (const inputRefId of inputRefIds) {
    walletUtxoIdToOutputUtxosRef[inputRefId] = outputUtxosRef
  }

  const walletUtxos = lucidUtxos.map(lucidToWalletUtxo)
  const outputUtxosRefToOutputUtxos: { [outputUtxosRef: string]: Server.Utxo[] } = {
    [outputUtxosRef]: walletUtxos
  }

  const walletUtxoIdsByOutputUtxosRef: { [outputUtxosRef: string]: string[] } = {
    [outputUtxosRef]: inputRefIds
  }

  return {
    outputUtxosRefByWalletUtxoId: walletUtxoIdToOutputUtxosRef,
    outputUtxosByOutputUtxosRef: outputUtxosRefToOutputUtxos,
    walletUtxoIdsByOutputUtxosRef: walletUtxoIdsByOutputUtxosRef,
  }
}

// What is `WalletStuff`?
// It is a mapping from wallet inputs of a transaction to wallet outputs of the transaction.
// Specifically it's a mapping from any wallet input to a set of wallet outputs
//
// The basic idea is that whenever we want to create a transaction map each wallet input to
// a set of wallet outputs, then union all of those sets into a final set that represents the
// virtual wallet utxos that are available to be used in the transaction being signed.
//
// There are a few wrinkles in this. We want to remove inputs from the map as they go onchain.
// In order to detect whether they go onchain, we query the wallet for the utxos that it knows.
// For every single utxo that it knows, if that utxo exists in the map as an input then we need
// to remove it from the mapping. We also need to remove it from output sets that it is a member
// of.
//
//
type VirtualWalletUtxoMap = {
  utxoRefToTxId: { [utxoRef: string]: string },
  txIdToUtxos: { [txId: string]: UTxO[] },
}

const emptyVirtualWalletUtxoMap: VirtualWalletUtxoMap = {
  utxoRefToTxId: {},
  txIdToUtxos: {},
}

// knownInputRefs: TxId#OutputIndex
export const makeVirtualWalletUtxoMap = (userInputRefs: string[], userAddresses: Set<string>, txBody: C.TransactionBody): VirtualWalletUtxoMap => {
  const txInputs = txBody.inputs()
  const txInputsLen = txInputs.len()
  const individualTxInputs: C.TransactionInput[] = []
  for (let i = 0; i < txInputsLen; i++) {
    individualTxInputs.push(txInputs.get(i))
  }
  const txInputRefs = individualTxInputs.map(input => {
    return `${input.transaction_id().to_hex()}#${input.index().to_str()}`
  })
  const userInputRefSet = new Set(userInputRefs)
  const txUserInputRefs = txInputRefs.filter(inputRef => {
    return userInputRefSet.has(inputRef)
  })

  const txHash = C.hash_transaction(txBody)
  const txId = txHash.to_hex()
  const txOutputs = txBody.outputs()
  const txOutputsLen = txOutputs.len()
  const txLucidUtxos: UTxO[] = []
  for (let i = 0; i < txOutputsLen; i++) {
    const txOutputInput = C.TransactionInput.new(txHash, C.BigNum.from_str(i.toString()))
    const txOutput = txOutputs.get(i)
    const txUtxo = C.TransactionUnspentOutput.new(txOutputInput, txOutput)
    const txLucidUtxo = Lucid.coreToUtxo(txUtxo)
    txLucidUtxos.push(txLucidUtxo)
  }

  const txUserLucidUtxos = txLucidUtxos.filter(txLucidUtxo => {
    return userAddresses.has(txLucidUtxo.address)
  })

  const utxoRefToTxId: { [utxoRef: string]: string } = {}
  txUserInputRefs.forEach(txUserInputRef => {
    utxoRefToTxId[txUserInputRef] = txId
  })
  const txIdToUtxos: {[txId: string]: UTxO[]} = {}
  if (txUserLucidUtxos.length > 0) {
    txIdToUtxos[txId] = txUserLucidUtxos
  }
  return {
    utxoRefToTxId,
    txIdToUtxos,
  }
}

const mergeVirtualWalletUtxoMaps = (a: VirtualWalletUtxoMap, b: VirtualWalletUtxoMap): VirtualWalletUtxoMap => {
  const newUtxoRefToTxId = { ...a.utxoRefToTxId, ...b.utxoRefToTxId }
  const newTxIdToUtxos = { ...a.txIdToUtxos, ...b.txIdToUtxos }
  return {
    utxoRefToTxId: newUtxoRefToTxId,
    txIdToUtxos: newTxIdToUtxos,
  }
}

export const getLatestUtxosFromPersistedVirtualWalletUtxoMap = (knownUtxos: UTxO[]): UTxO[] => {
  const virtualWalletUtxoMap = getPersistedVirtualWalletUtxoMap()
  return getLatestUtxos(knownUtxos, virtualWalletUtxoMap)
}

const getLatestUtxos = (knownUtxos: UTxO[], virtualWalletUtxoMap: VirtualWalletUtxoMap): UTxO[] => {
  const utxos = getLatestUtxosWorker(knownUtxos, virtualWalletUtxoMap)
  const seen = new Set<string>()
  // a little nasty since filter does local mutation
  return utxos.filter(utxo => {
    const utxoRef = `${utxo.txHash}#${utxo.outputIndex}`
    if (seen.has(utxoRef)) {
      return false
    } else {
      seen.add(utxoRef)
      return true
    }
  })
}

const getLatestUtxosWorker = (knownUtxos: UTxO[], virtualWalletUtxoMap: VirtualWalletUtxoMap): UTxO[] => {
  const utxos: UTxO[] = []
  knownUtxos.forEach(knownUtxo => {
    const knownUtxoRef = `${knownUtxo.txHash}#${knownUtxo.outputIndex}`
    const txId = virtualWalletUtxoMap.utxoRefToTxId[knownUtxoRef]
    if (txId === undefined) {
      utxos.push(knownUtxo)
    } else {
      const txUtxos = virtualWalletUtxoMap.txIdToUtxos[txId]
      if (txUtxos !== undefined) {
        utxos.push(...getLatestUtxos(txUtxos, virtualWalletUtxoMap))
      }
    }
  })
  return utxos
}

export const updateVirtualWalletUtxoMapWithKnownTxIds = (
  knownTxIds: string[], virtualWalletUtxoMap: VirtualWalletUtxoMap
): VirtualWalletUtxoMap => {
  const utxoRefToTxId: { [utxoRef: string]: string } = {}
  Object.entries(virtualWalletUtxoMap.utxoRefToTxId).forEach(([utxoRef, txId]) => {
    if (!knownTxIds.includes(txId)) {
      utxoRefToTxId[utxoRef] = txId
    }
  })
  const txIdToUtxos: { [txId: string]: UTxO[] } = {}
  Object.entries(virtualWalletUtxoMap.txIdToUtxos).forEach(([txId, utxos]) => {
    if (!knownTxIds.includes(txId)) {
      txIdToUtxos[txId] = utxos
    }
  })
  return {
    utxoRefToTxId,
    txIdToUtxos,
  }
}

const getPersistedVirtualWalletUtxoMap = (): VirtualWalletUtxoMap => {
  const dehydratedVirtualWalletUtxoMap = localStorage.getItem('virtualWalletUtxoMap')
  let virtualWalletUtxoMap = emptyVirtualWalletUtxoMap
  if (dehydratedVirtualWalletUtxoMap !== null) {
    virtualWalletUtxoMap = JSONBigInt.parse(dehydratedVirtualWalletUtxoMap)
  }
  return virtualWalletUtxoMap
}

const setPersistedVirtualWalletUtxoMap = (virtualWalletUtxoMap: VirtualWalletUtxoMap): void => {
  const dehydratedVirtualWalletUtxoMap = JSONBigInt.stringify(virtualWalletUtxoMap)
  localStorage.setItem('virtualWalletUtxoMap', dehydratedVirtualWalletUtxoMap)
}

export const updatePersistedVirtualWalletUtxoMap = (knownTxIds: string[], virtualWalletUtxoMap: VirtualWalletUtxoMap): VirtualWalletUtxoMap => {
  const prevVirtualWalletUtxoMap = getPersistedVirtualWalletUtxoMap()
  const mergedVirtualWalletUtxoMap = mergeVirtualWalletUtxoMaps(prevVirtualWalletUtxoMap, virtualWalletUtxoMap)
  const nextVirtualWalletUtxoMap = updateVirtualWalletUtxoMapWithKnownTxIds(knownTxIds, mergedVirtualWalletUtxoMap)
  setPersistedVirtualWalletUtxoMap(nextVirtualWalletUtxoMap)
  setTimeout(() => {
    const currVirtualWalletUtxoMap = getPersistedVirtualWalletUtxoMap()
    const currTxIds = Object.keys(nextVirtualWalletUtxoMap.txIdToUtxos)
    console.log('Timing out:')
    console.log(currTxIds)
    const timedOutVirtualWalletUtxoMap = updateVirtualWalletUtxoMapWithKnownTxIds(currTxIds, currVirtualWalletUtxoMap)
    setPersistedVirtualWalletUtxoMap(timedOutVirtualWalletUtxoMap)
  }, 1000 * 180)
  return nextVirtualWalletUtxoMap
}


// NOTE: as long as a storage get and set happen within the
// same callback/function/resulting callstack then we have no race
// condition within a single tab. We DO have a race condition
// across several tabs/windows, but I assume it's rare to the point
// that no one will ever see it.
// This goes for the callback in the set timeout code. It will run
// to completion atomically within a SINGLE event loop. AKA a single
// tab. If this ever becomes a problem because someone has 10 tabs
// open on the same page clicking away, then we will actually need
// to care.
export const updateWalletUtxoMap = (walletStuff: Server.WalletStuff): void => {
  const currWalletUtxoMap = getWalletUtxoMap()
  const newWalletUtxoMap = serverToWalletUtxoMap(walletStuff)
  console.log("INCOMING WALLET UTXO MAP")
  console.log(newWalletUtxoMap)
  const nextWalletUtxoMap = mergeWalletUtxoMap(currWalletUtxoMap, newWalletUtxoMap)
  setWalletUtxoMap(nextWalletUtxoMap)
  setTimeout(() => {
    const currWalletUtxoMap = getWalletUtxoMap()
    const txHashes = new Set(Object.keys(newWalletUtxoMap.outputUtxosByOutputUtxosRef).map(outputUtxosRefToTxHash))
    txHashes.add('155e8de523769e9dbe2310aeeabaecc79d0fe95c1efbda1a4d9f424a3c3cd857')
    console.log('Timing out:')
    console.log(txHashes)
    const nextWalletUtxoMap = pruneTxHashes(currWalletUtxoMap, txHashes)
    setWalletUtxoMap(nextWalletUtxoMap)
  }, 1000 * 180)
}
