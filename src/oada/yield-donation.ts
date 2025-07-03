import {
  C,
  Data,
  Lucid,
  Tx,
  fromText,
} from 'lucid-cardano'
import * as L from 'lucid-cardano'
import OadaScripts from './scripts/oada.json'

import {Validator} from './types'
import {mkScriptUtils} from './utils'

import {
  MintNft,
  BatchStakeDatum,
  StakingAmoDatum,
  _x,
  stakingAmoDatumSchema,
  toWrappedData,
  YieldDonationDatum,
  yieldDonationDatumSchema,
  YieldDonationNftDatum
} from "./datums";
import { fromPlutusData, toPlutusData } from "../plutus-data/schema";
import { Credential } from "../plutus-data/plutus-v1-encoders";

// hack to force evaluate the datums module until I can figure out the right way
const __x = _x


export type YieldDonationParams = {
  donationTargetKeyHash: string,
  sotokenScriptHash: string,
  stakingAmoScriptHash: string,
  stakingAmoTokenName: string,
  batchStakeScriptHash: string,
  referenceLockScriptHash: string,
}

export const initYieldDonation = async ({
  lucid,
  params: {
    donationTargetKeyHash,
    sotokenScriptHash,
    stakingAmoScriptHash,
    stakingAmoTokenName,
    batchStakeScriptHash,
    referenceLockScriptHash,
  }
}: {
  lucid: Lucid
  params: YieldDonationParams
}) => {
  const utils = new L.Utils(lucid)
  const scriptUtils = mkScriptUtils(lucid)

  const {
    loadValidator,
  } = scriptUtils;

  const newTx = (...scripts: Validator[]) => {
    const tx = lucid.newTx()
    for (const script of scripts)
      tx.attachSpendingValidator(script.validator)
    return tx
  }

  const seedUtxoToMintRedeemer = (
    seedUtxo: L.UTxO
  ): MintNft => {
    return {
        kind: 'MintNft',
        txOutRef: {
          kind: 'TxOutRef',
          txId: { kind: 'TxId', id: seedUtxo.txHash },
          txIdx: BigInt(seedUtxo.outputIndex)
        }
      }
  }

  const utxoToTokenName = (
    seedUtxo: L.UTxO
  ) => {
    const mintRedeemer = seedUtxoToMintRedeemer(seedUtxo)
    return Buffer.from(C.hash_blake2b256(new Uint8Array(Buffer.from(Data.to(toPlutusData(mintRedeemer.txOutRef)), 'hex')))).toString('hex')
  }

  const yieldDonation = loadValidator(OadaScripts, 'donate_soada', [
    donationTargetKeyHash,
    toPlutusData({
      kind: 'AssetClass',
      currencySymbol: stakingAmoScriptHash,
      tokenName: stakingAmoTokenName,
    }),
    batchStakeScriptHash
  ])

  const donationNftMetadata = new Map([
    [fromText('description'), fromText('Proof of your donation')],
    [fromText('donated'), null],
    [fromText('image'), fromText('https://example.com/image.jpg')],
    [fromText('name'), fromText('sOADA Yield Donation NFT')],
  ])
  const yieldDonationNft = loadValidator(OadaScripts, 'donate_soada', [
    yieldDonation.hash,
    toPlutusData({
      kind: 'ScriptCredential',
      hash: referenceLockScriptHash,
    } as Credential),
    donationNftMetadata.get(fromText('name'))!,
    donationNftMetadata.get(fromText('description'))!,
    donationNftMetadata.get(fromText('image'))! 
  ], 'mint_nft')

  const mintId = async (
    validator: Validator,
    datum: Data,
    seedUtxo: L.UTxO,
    refScript?: string,
    attachScript: boolean = true,
    extraAssets?: L.Assets
  ): Promise<Tx> => {
    const tokenName = utxoToTokenName(seedUtxo)
    const mintRedeemer = seedUtxoToMintRedeemer(seedUtxo)
    const tx = newTx()
      .collectFrom([seedUtxo])
      .mintAssets(
        { [validator.hash + tokenName]: 1n },
        Data.to(toPlutusData(mintRedeemer))
      )
      .payToAddressWithData(
        validator.mkAddress(),
        {
          inline: Data.to(datum),
          scriptRef: refScript ? {
            script: refScript,
            type: 'PlutusV2'
          } : undefined
        },
        { ...extraAssets, [validator.hash + tokenName]: 1n }
      )

      if (attachScript)
        tx.attachSpendingValidator(validator.validator)

      return tx
  }

  const utxoDatum = async(utxo: L.UTxO): Promise<L.Data | null> => {
    const datum = 
      utxo.datum
        ? utxo.datum
        : utxo.datumHash
          ? await lucid.provider.getDatum(utxo.datumHash!)
          : null
    return datum ? Data.from(datum) : null
  }

  const forceUtxoDatum = async(utxo: L.UTxO): Promise<L.Data> => {
    return (await utxoDatum(utxo))!
  }

  const createYieldDonation = async (sotokenAmount: bigint, donationRatio: [bigint, bigint]) => {
    const stakingAmoUtxo = await lucid.utxoByUnit(stakingAmoScriptHash + stakingAmoTokenName);
    const stakingAmoDatum: StakingAmoDatum = fromPlutusData(stakingAmoDatumSchema, await forceUtxoDatum(stakingAmoUtxo))
    const { paymentCredential } = utils.getAddressDetails(await lucid.wallet.address())
    const datum: YieldDonationDatum = {
      kind: 'YieldDonationDatum',
      owner: paymentCredential!.hash,
      initialExchange: [stakingAmoDatum.sotokenBacking, stakingAmoDatum.sotokenAmount],
      donationRatio
    }
    const utxos = await lucid.wallet.getUtxos()
    return newTx()
      .readFrom([stakingAmoUtxo])
      .addSignerKey(paymentCredential!.hash)
      .compose(await mintId(
        yieldDonation,
        toPlutusData(datum),
        utxos[0],
        undefined,
        true,
        { [sotokenScriptHash]: sotokenAmount }
      ))
  }

  const walletDetails = utils.getAddressDetails(await lucid.wallet.address())
  const walletPubKeyHash = walletDetails.paymentCredential!.hash
  const commitYieldDonation = async (donationView?: YieldDonationView) => {
    if (!donationView)
      [donationView] = await getOwnerDonations()
    const donationInput = donationView.utxo

    const { paymentCredential } = utils.getAddressDetails(await lucid.wallet.address())
    const stakingAmoUtxo = donationView.stakingAmoUtxo
    const donationUnstakeDatum: BatchStakeDatum = {
      kind: 'BatchStakeDatum',
      owner: walletPubKeyHash,
      returnAddress: {
        kind: 'Address',
        paymentCredential: {
          kind: 'PubKeyCredential',
          hash: walletPubKeyHash 
        },
        stakingCredential: {
          kind: 'Nothing'
        }
      }
    }
    const changeUnstakeDatum: BatchStakeDatum = {
      kind: 'BatchStakeDatum',
      owner: paymentCredential!.hash,
      returnAddress: {
        kind: 'Address',
        paymentCredential: {
          kind: 'PubKeyCredential',
          hash: paymentCredential!.hash
        },
        stakingCredential: {
          kind: 'Nothing'
        }
      }
    }
    const tokenName = utxoToTokenName(donationInput).slice(8, )
    const start = Date.now() - 60_000 * 10
    const oneDay = 24 * 60 * 60 * 1000
    const leftInDay = oneDay - start % oneDay
    const ttl = 60_000 * 30
    const end = start + (leftInDay < ttl ? leftInDay - 1 : ttl)
    const metadata: Map<string, any> = new Map(donationNftMetadata)

    const {toDonate, baseDonation, unburnedSotoken} = donationAmounts(donationView)

    metadata.set(fromText('donated'), baseDonation)
    metadata.set(fromText('time'), BigInt(end) - (BigInt(end) % 1000n))

    const referenceNftDatum: YieldDonationNftDatum = {
      kind: 'YieldDonationNftDatum',
      metadata: metadata,
      version: 1n,
      extra: { constructor: 0n, fields: [] }
    }

    const batchStakeAddress = utils.credentialToAddress(
      utils.scriptHashToCredential(batchStakeScriptHash)
    )
    const referenceLockAddress = utils.credentialToAddress(
      utils.scriptHashToCredential(referenceLockScriptHash)
    )
    
    const mintTx = newTx()

    if (baseDonation > 0) {
      mintTx
        .mintAssets({
          [yieldDonationNft.hash + '000643b0' + tokenName]: 1n,
          [yieldDonationNft.hash + '000de140' + tokenName]: 1n,
        }, Data.void())
        .attachMintingPolicy(yieldDonationNft.validator)
        .payToAddressWithData(
          referenceLockAddress,
          { inline: Data.to(toPlutusData(referenceNftDatum)) },
          { [yieldDonationNft.hash + '000643b0' + tokenName]: 1n },
        )
    }

    return newTx()
      .readFrom([stakingAmoUtxo])
      .collectFrom([donationInput], Data.to(toWrappedData([0n, 1n, baseDonation])))
      .payToContract(
        batchStakeAddress,
        { inline: Data.to(toPlutusData(donationUnstakeDatum)) },
        toDonate > 0n ? { [sotokenScriptHash]: toDonate } : {}
      )
      .payToContract(
        batchStakeAddress,
        { inline: Data.to(toPlutusData(changeUnstakeDatum)) },
        { [sotokenScriptHash]: unburnedSotoken - (toDonate > 0n ? toDonate : 0n) }
      )
      .addSignerKey(paymentCredential!.hash)
      .attachSpendingValidator(yieldDonation.validator)
      .compose(mintTx)
      .validFrom(start)
      .validTo(end)
  }

  const getOwnerDonations = async () => {
    const scriptAddress = utils.credentialToAddress({ type: 'Key', hash: yieldDonation.hash });
    const donationUtxos = await lucid.utxosAt(scriptAddress)
    const stakingAmoUtxo = await lucid.utxoByUnit(stakingAmoScriptHash + stakingAmoTokenName);
    const stakingAmoDatum: StakingAmoDatum = fromPlutusData(stakingAmoDatumSchema, Data.from(stakingAmoUtxo.datum!))
    const addressDetails = utils.getAddressDetails(await lucid.wallet.address())
    const ownerLocks = donationUtxos.filter(utxo => {
      if (!utxo.datum)
        return false

      const datum = fromPlutusData(yieldDonationDatumSchema, Data.from(utxo.datum))
      return datum.owner === addressDetails.paymentCredential?.hash
    })

    return ownerLocks.map(utxo => {
      const datum = fromPlutusData(yieldDonationDatumSchema, Data.from(utxo?.datum!))
      return {
        utxo,
        stakingAmoUtxo,
        amount: utxo.assets[sotokenScriptHash],
        donationRatio: datum.donationRatio as [bigint, bigint],
        initialExchange: datum.initialExchange as [bigint, bigint],
        currentExchange: [stakingAmoDatum.sotokenBacking, stakingAmoDatum.sotokenAmount] as [bigint, bigint]
      }
    })
  }

  const donationAmounts = (donationView: YieldDonationView) => {
    const unburnedSotoken = donationView.amount * 999n / 1000n
    const { initialExchange, currentExchange } = donationView
    const yieldChange = [currentExchange[0] * initialExchange[1] - initialExchange[0] * currentExchange[1], initialExchange[1] * currentExchange[1]]
    const otokenYield = [yieldChange[0] * unburnedSotoken, yieldChange[1]]
    const baseDonation =
      otokenYield[0]
        * donationView.donationRatio[0]
        / otokenYield[1]
        / donationView.donationRatio[1]
    const toDonate = 
      otokenYield[0]
        * donationView.donationRatio[0]
        * currentExchange[1]
        / otokenYield[1]
        / donationView.donationRatio[1]
        / currentExchange[0]

    return { baseDonation, toDonate, otokenYield, yieldChange, unburnedSotoken }
  }

  return {
    createYieldDonation,
    commitYieldDonation,
    donationAmounts,
    getOwnerDonations
  }
}

export type YieldDonationSystem = Awaited<ReturnType<typeof initYieldDonation>>
export type YieldDonationView = {
  utxo: L.UTxO
  stakingAmoUtxo: L.UTxO
  amount: bigint
  donationRatio: [bigint, bigint]
  initialExchange: [bigint, bigint]
  currentExchange: [bigint, bigint]
}
