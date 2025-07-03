import { 
  SchemaToType,
  addTypeSchema,
  bigintEncoder,
  listEncoder,
  mapEncoder,
  rawDataEncoder,
  stringEncoder,
  toPlutusData,
  unionEncoder
} from '../plutus-data/schema'
import {
  currencySymbolEncoder,
  tokenNameEncoder,
  pubKeyHashEncoder,
  positiveEncoder,
  stakingCredentialEncoder,
  maybePubKeyHashEncoder,
  txOutRefEncoder,
  naturalValueEncoder,
  assetClassEncoder,
  scriptHashEncoder,
  maybeTxOutRefEncoder,
  credentialEncoder,
  addressEncoder,
  maybeBigIntEncoder,
  booleanEncoder,
  valueEncoder,
} from '../plutus-data/plutus-v1-encoders'
import {} from '../plutus-data/plutus-v2-encoders'
import { Constr } from 'lucid-cardano';

export const liquidityBondPostDatumSchema = {
  name: 'LiquidityBondPostDatum' as const,
  constructor: 0n,
  fields: [
    [ 'epoRewards', naturalValueEncoder ],
    [ 'duration', positiveEncoder ],
    [ 'bondSymbol', currencySymbolEncoder ],
    [ 'tokenName', tokenNameEncoder ],
    [ 'bondAmount', positiveEncoder ],
    [ 'buffer', bigintEncoder ],
    [ 'otmFee', positiveEncoder ],
    [ 'stakeKey', stakingCredentialEncoder ],
    [ 'permissioned', maybePubKeyHashEncoder ],
  ] as const,
}
addTypeSchema(liquidityBondPostDatumSchema);
export type LiquidityBondPostDatum = SchemaToType<typeof liquidityBondPostDatumSchema>

export const liquidityBondOpenDatumSchema = {
  name: 'LiquidityBondOpenDatum' as const,
  constructor: 0n,
  fields: [
    [ 'epoRewards', naturalValueEncoder ],
    [ 'duration', positiveEncoder ],
    [ 'bondSymbol', currencySymbolEncoder ],
    [ 'tokenName', tokenNameEncoder ],
    [ 'bondAmount', positiveEncoder ],
    [ 'buffer', bigintEncoder ],
    [ 'otmFee', positiveEncoder ],
    [ 'ogLender', pubKeyHashEncoder ],
    [ 'start', positiveEncoder ],
  ] as const,
}
addTypeSchema(liquidityBondOpenDatumSchema);
export type LiquidityBondOpenDatum = SchemaToType<typeof liquidityBondOpenDatumSchema>

const mintNftSchema = {
  name: 'MintNft' as const,
  constructor: 0n,
  fields: [
    [ 'txOutRef', txOutRefEncoder ],
  ] as const,
}
addTypeSchema(mintNftSchema);
export type MintNft = SchemaToType<typeof mintNftSchema>

const burnNftSchema = {
  name: 'BurnNft' as const,
  constructor: 1n,
  fields: [] as const,
}
addTypeSchema(burnNftSchema);
export type BurnNft = SchemaToType<typeof burnNftSchema>

export type NftMintingPolicyRedeemer = MintNft | BurnNft

const writeSchema = {
  name: 'Write' as const,
  constructor: 0n,
  fields: [] as const,
}
addTypeSchema(writeSchema);
type Write = SchemaToType<typeof writeSchema>

const cancelSchema = {
  name: 'Cancel' as const,
  constructor: 1n,
  fields: [] as const,
}
addTypeSchema(cancelSchema);
type Cancel = SchemaToType<typeof cancelSchema>

export type BondWriterValidatorRedeemer = Write | Cancel

const closeSchema = {
  name: 'Close' as const,
  constructor: 0n,
  fields: [] as const,
}
addTypeSchema(closeSchema);
type Close = SchemaToType<typeof closeSchema>

const keychangeSchema = {
  name: 'Keychange' as const,
  constructor: 1n,
  fields: [] as const,
}
addTypeSchema(keychangeSchema);
type Keychange = SchemaToType<typeof keychangeSchema>

const marginAddSchema = {
  name: 'MarginAdd' as const,
  constructor: 2n,
  fields: [
    [ 'epochs', positiveEncoder ]
  ] as const,
}
addTypeSchema(marginAddSchema);
type MarginAdd = SchemaToType<typeof marginAddSchema>

export type OpenValidatorRedeemer = Close | Keychange | MarginAdd

export const collateralAmoDatumSchema = {
  name: 'CollateralAmoDatum' as const,
  constructor: 0n,
  fields: [
    [ 'adaProfitUncommitted', bigintEncoder ],
    [ 'stakingAmo', assetClassEncoder ],
    [ 'childStrategies', listEncoder(assetClassEncoder) ]
  ] as const
}
addTypeSchema(collateralAmoDatumSchema)
export type CollateralAmoDatum = SchemaToType<typeof collateralAmoDatumSchema>

export const stakingAmoDatumSchema = {
  name: 'StakingAmoDatum' as const,
  constructor: 0n,
  fields: [
    [ 'sotoken', scriptHashEncoder ],
    [ 'sotokenAmount', bigintEncoder ],
    [ 'sotokenBacking', bigintEncoder ],
    [ 'sotokenLimit', bigintEncoder ],
    [ 'odaoFee', bigintEncoder ],
    [ 'odaoSotoken', bigintEncoder ],
    [ 'feeClaimer', assetClassEncoder ],
    [ 'feeClaimRule', scriptHashEncoder ]
  ] as const
}
addTypeSchema(stakingAmoDatumSchema)
export type StakingAmoDatum = SchemaToType<typeof stakingAmoDatumSchema>

export const updateStakingAmoSchema = {
  name: 'UpdateStakingAmo' as const,
  constructor: 0n,
  fields: [] as const
}
addTypeSchema(updateStakingAmoSchema)
export type UpdateStakingAmo = SchemaToType<typeof updateStakingAmoSchema>

export const spawnStrategySchema = {
  name: 'SpawnStrategy' as const,
  constructor: 1n,
  fields: [
    [ 'strategy', scriptHashEncoder ],
    [ 'txOutRef', txOutRefEncoder ]
  ] as const
}
addTypeSchema(spawnStrategySchema)
export type SpawnStrategy = SchemaToType<typeof spawnStrategySchema>

export const despawnStrategySchema = {
  name: 'DespawnStrategy' as const,
  constructor: 2n,
  fields: [
    [ 'id', assetClassEncoder ]
  ] as const
}
addTypeSchema(despawnStrategySchema)
export type DespawnStrategy = SchemaToType<typeof despawnStrategySchema>

export const syncStrategyCollateralSchema = {
  name: 'SyncStrategyCollateral' as const,
  constructor: 3n,
  fields: [
    [ 'id', assetClassEncoder ]
  ] as const
}
addTypeSchema(syncStrategyCollateralSchema)
export type SyncStrategyCollateral = SchemaToType<typeof syncStrategyCollateralSchema>

export const mergeStakingRateSchema = {
  name: 'MergeStakingRate' as const,
  constructor: 4n,
  fields: [] as const
}
addTypeSchema(mergeStakingRateSchema)
export type MergeStakingRate = SchemaToType<typeof mergeStakingRateSchema>

export const mergeNewDepositsSchema = {
  name: 'MergeNewDeposits' as const,
  constructor: 5n,
  fields: [] as const
}
addTypeSchema(mergeNewDepositsSchema)
export type MergeNewDeposits = SchemaToType<typeof mergeNewDepositsSchema>

export type CollateralAmoRedeemer
  = UpdateStakingAmo
  | SpawnStrategy
  | DespawnStrategy
  | SyncStrategyCollateral
  | MergeStakingRate
  | MergeNewDeposits

export const closeStrategySchema = {
  name: 'CloseStrategy' as const,
  constructor: 0n,
  fields: [] as const
}
addTypeSchema(closeStrategySchema)
export type CloseStrategy = SchemaToType<typeof closeStrategySchema>

export const syncStrategySchema = {
  name: 'SyncStrategy' as const,
  constructor: 1n,
  fields: [] as const
}
addTypeSchema(syncStrategySchema)
export type SyncStrategy = SchemaToType<typeof syncStrategySchema>

export type StrategyRedeemer = CloseStrategy | SyncStrategy

export const donateSchema = {
  name: 'Donate' as const,
  constructor: 2n,
  fields: [] as const
}
addTypeSchema(donateSchema)
export type Donate = SchemaToType<typeof donateSchema>

export type DonationStrategyRedeemer = StrategyRedeemer | Donate

export const moveStakesSchema = {
  name: 'MoveStakes' as const,
  constructor: 2n,
  fields: [] as const
}
addTypeSchema(moveStakesSchema)
export type MoveStakes = SchemaToType<typeof moveStakesSchema>

export type StakeAuctionStrategyRedeemer = StrategyRedeemer | MoveStakes

export const strategyDatumSchema = {
  name: 'StrategyDatum' as const,
  constructor: 0n,
  fields: [
    [ 'adaProfit', bigintEncoder ],
    [ 'strategyData', rawDataEncoder ]
  ] as const
}
addTypeSchema(strategyDatumSchema)
export type StrategyDatum = SchemaToType<typeof strategyDatumSchema>

export const donationDatumSchema = {
  name: 'DonationDatum' as const,
  constructor: 0n,
  fields: [] as const
}
addTypeSchema(donationDatumSchema)
export type DonationDatum = SchemaToType<typeof donationDatumSchema>

export const stakeAuctionParamsSchema = {
  name: 'StakeAuctionParams',
  constructor: 0n,
  fields: [
    [ 'strategy', assetClassEncoder ],
    [ 'profit', bigintEncoder ],
    [ 'diff', valueEncoder ],
  ] as const
}
addTypeSchema(stakeAuctionParamsSchema)
export type StakeAuctionParams = SchemaToType<typeof stakeAuctionParamsSchema>

export type StakeAuctionDatum = StakeAuctionBidDatum | StakeAuctionLockDatum

export const partialBidSchema = {
  name: 'Partial' as const,
  constructor: 0n,
  fields: []
}
addTypeSchema(partialBidSchema)
export type PartialBid = SchemaToType<typeof partialBidSchema>

export const fullBidSchema = {
  name: 'Full' as const,
  constructor: 1n,
  fields: []
}
addTypeSchema(fullBidSchema)
export type FullBid = SchemaToType<typeof fullBidSchema>

export type BidType = PartialBid | FullBid
const bidTypeConstructors = ['Partial', 'Full']
const bidTypeEncoder = unionEncoder<BidType, typeof bidTypeConstructors>(bidTypeConstructors)

export const stakeAuctionBidDatumSchema = {
  name: 'StakeAuctionBidDatum' as const,
  constructor: 0n,
  fields: [
    [ 'owner', pubKeyHashEncoder ],
    [ 'stakeCredential', credentialEncoder ],
    [ 'bid', bigintEncoder ],
    [ 'bidType', bidTypeEncoder ],
    [ 'previousFill', maybeTxOutRefEncoder ]
  ] as const
}
addTypeSchema(stakeAuctionBidDatumSchema)
export type StakeAuctionBidDatum = SchemaToType<typeof stakeAuctionBidDatumSchema>

export const stakeAuctionLockDatumSchema = {
  name: 'StakeAuctionLockDatum' as const,
  constructor: 1n,
  fields: [
    [ 'epoch', bigintEncoder ]
  ] as const
}
addTypeSchema(stakeAuctionLockDatumSchema)
export type StakeAuctionLockDatum = SchemaToType<typeof stakeAuctionLockDatumSchema>

export const cancelOrderSchema = {
  name: 'CancelOrder' as const,
  constructor: 0n,
  fields: []
}
addTypeSchema(cancelOrderSchema)
export type CancelOrder = SchemaToType<typeof cancelOrderSchema>

export const matchOrderSchema = {
  name: 'MatchOrder' as const,
  constructor: 1n,
  fields: [
    [ 'fillType', bidTypeEncoder ],
    [ 'lockOutputIndex', bigintEncoder ]
  ] as const
}
addTypeSchema(matchOrderSchema)
export type MatchOrder = SchemaToType<typeof matchOrderSchema>

export const unlockStakeSchema = {
  name: 'UnlockStake' as const,
  constructor: 2n,
  fields: [] as const
}
addTypeSchema(unlockStakeSchema)
export type UnlockStake = SchemaToType<typeof unlockStakeSchema>

export type StakeAuctionRedeemer = CancelOrder | MatchOrder | UnlockStake

export const dexWithdrawSchema = {
  name: 'DexWithdraw' as const,
  constructor: 0n,
  fields: [] as const
}
addTypeSchema(dexWithdrawSchema)
export type DexWithdraw = SchemaToType<typeof dexWithdrawSchema>

export const dexDepositSchema = {
  name: 'DexDeposit' as const,
  constructor: 1n,
  fields: [] as const
}
addTypeSchema(dexDepositSchema)
export type DexDeposit = SchemaToType<typeof dexDepositSchema>

export const dexPegSchema = {
  name: 'DexPeg' as const,
  constructor: 2n,
  fields: [] as const
}
addTypeSchema(dexPegSchema)
export type DexPeg = SchemaToType<typeof dexPegSchema>
export type DexActionType = DexWithdraw | DexDeposit | DexPeg
const dexActionConstructors = ['DexWithdraw', 'DexDeposit', 'DexPeg'] 
const dexActionEncoder = unionEncoder<DexActionType, typeof dexActionConstructors>(dexActionConstructors)

export const dexActionSchema = {
  name: 'DexAction' as const,
  constructor: 2n,
  fields: [['action', dexActionEncoder]] as const
}
addTypeSchema(dexActionSchema)
export type DexAction = SchemaToType<typeof dexActionSchema>

export type DexStrategyRedeemer = CloseStrategy | SyncStrategy | DexAction

export const dexStrategyDatumSchema = {
  name: 'DexStrategyDatum' as const,
  constructor: 0n,
  fields: [
    ['deposited', bigintEncoder],
  ] as const
}
addTypeSchema(dexStrategyDatumSchema)
export type DexStrategyDatum = SchemaToType<typeof dexStrategyDatumSchema>

export const batchStakeDatumSchema  = {
  name: 'BatchStakeDatum' as const,
  constructor: 0n,
  fields: [
    [ 'owner', pubKeyHashEncoder ],
    [ 'returnAddress', addressEncoder ]
  ] as const
}
addTypeSchema(batchStakeDatumSchema)
export type BatchStakeDatum = SchemaToType<typeof batchStakeDatumSchema>

export const cancelStakeSchema = {
  name: 'CancelStake' as const,
  constructor: 0n,
  fields: []
}
addTypeSchema(cancelStakeSchema)
export type CancelStake = SchemaToType<typeof cancelStakeSchema>

export const digestStakeSchema = {
  name: 'DigestStake' as const,
  constructor: 1n,
  fields: [
    [ "returnIndex", bigintEncoder ],
    [ "continuingOrderIndex", maybeBigIntEncoder ]
  ] as const
}
addTypeSchema(digestStakeSchema)
export type DigestStake = SchemaToType<typeof digestStakeSchema>

export type BatchStakeRedeemer = CancelStake | DigestStake

export const ammActionSchema = {
  name: 'AmmAction' as const,
  constructor: 0n,
  fields: [
    ['optionInt0', bigintEncoder],
    ['optionInt1', bigintEncoder]
  ] as const
}
addTypeSchema(ammActionSchema)
export type AmmAction = SchemaToType<typeof ammActionSchema>

export const pDaoActionSchema = {
  name: 'PDaoAction' as const,
  constructor: 1n,
  fields: [] as const
}
addTypeSchema(pDaoActionSchema)
export type PDaoAction = SchemaToType<typeof pDaoActionSchema>

export type PoolAction = AmmAction | PDaoAction
const poolActionConstructors = ['AmmAction', 'PDaoAction'] 
const poolActionEncoder = unionEncoder<PoolAction, typeof poolActionConstructors>(poolActionConstructors)

export const poolRedeemerSchema = {
  name: 'PoolRedeemer' as const,
  constructor: 0n,
  fields: [
    ['poolInIx', bigintEncoder],
    ['poolOutIx', bigintEncoder],
    ['poolAction', poolActionEncoder]
  ] as const
}
addTypeSchema(poolRedeemerSchema)
export type PoolRedeemer = SchemaToType<typeof poolRedeemerSchema>


export const poolDataSchema = {
  name: 'PoolData' as const,
  constructor: 0n,
  fields: [
    ['poolNft', assetClassEncoder],
    ['n', bigintEncoder],
    ['tradableAssets', listEncoder(assetClassEncoder)],
    ['tradableTokensMultipliers', listEncoder(bigintEncoder)],
    ['lpToken', assetClassEncoder],
    ['lpFeeIsEditable', booleanEncoder],
    ['amplCoeff', bigintEncoder],
    ['lpFeeNum', bigintEncoder],
    ['protocolFeeNum', bigintEncoder],
    ['daoStabeProxyWitness', listEncoder(scriptHashEncoder)],
    ['treasuryAddress', scriptHashEncoder],
    ['protocolFees', listEncoder(bigintEncoder)],
    ['inv', bigintEncoder]
  ] as const
}
addTypeSchema(poolDataSchema)
export type PoolData = SchemaToType<typeof poolDataSchema>

export const yieldDonationDatumSchema = {
  name: 'YieldDonationDatum' as const,
  constructor: 0n,
  fields: [
    [ "owner", pubKeyHashEncoder ],
    [ "donationRatio", listEncoder(bigintEncoder) ],
    [ "initialExchange", listEncoder(bigintEncoder) ]
  ] as const
}
addTypeSchema(yieldDonationDatumSchema)
export type YieldDonationDatum = SchemaToType<typeof yieldDonationDatumSchema>

export const yieldDonationNftDatumSchema = {
  name: 'YieldDonationNftDatum' as const,
  constructor: 0n,
  fields: [
    [ "metadata", mapEncoder(stringEncoder, stringEncoder) ],
    [ "version", bigintEncoder ],
    [ "extra", rawDataEncoder ]
  ] as const
}
addTypeSchema(yieldDonationNftDatumSchema)
export type YieldDonationNftDatum = SchemaToType<typeof yieldDonationNftDatumSchema>


export const toWrappedData = (data: any) => new Constr(1, [toPlutusData(data)])

export const _x = (() => 1)()
