/**
 * OADA Dashboard Component
 * 
 * This component provides a comprehensive dashboard for the OADA (Optimiz ADA) token ecosystem.
 * It displays key metrics, user positions, yield opportunities, and integrates OptimizLock functionality.
 * 
 * Key features:
 * - Total Value Locked (TVL) visualization with breakdown between OADA and sOADA
 * - Volume statistics for stake auction activities
 * - User position overview displaying balances across different OADA-related assets
 * - Yield opportunities table with various options for earning with OADA tokens
 * - Modal integration for OptimizLock and OptimizUnlock features
 * 
 * The dashboard polls for updates and recalculates various metrics to provide users
 * with current information about the OADA ecosystem.
 */

import { Text } from "src/components/ui/typography";
import { UserPositionsCard } from "../../positions-card";
import { TvlChartData, TvlCard } from "../../tvl-card";
import { YieldOption, YieldsTable } from "../../yields-table";
import {useAppDispatch, useAppSelector} from "src/store/hooks";
import {selectWalletOadaLpAmount, selectWalletOadaletAmount, selectWalletSoadaletAmount} from "src/store/slices/walletSlice";
import {getOadaFrontendInfo, getSoadaHistoricalReturn, getStakeAuctionVolume, getStakeLockHistoricVolume, selectOadaFrontendInfo, selectSoadaApyMovingAverage, selectStakeAuctionVolumeData} from "src/oada/actions";
import {useEffect} from "react";
import CustomTitle from "src/components/Title";
import Big from "big.js";
import {OptimizLock, OptimizUnlock} from "../../OptimizLock";
import {useLocation, useNavigate} from "react-router-dom";
import {Modal} from "src/components/Modal";
import {formatDecimals, formatPercent} from "src/utils/formatNumbers";
import {Tabs, TabsList, TabsTrigger} from "src/components/ui/tabs";
import * as Optimiz from 'src/features/dAppHub/OptimizLock';
import {VolumeCard, VolumeChartData} from "../../volume-card";

/**
 * Initial TVL chart data structure
 * 
 * Provides a template for the Total Value Locked chart showing
 * the distribution between OADA and sOADA tokens
 */
const chartData: TvlChartData = [
  {
    name: "Total OADA",
    currency: "OADA",
    amount: 0,
    value: 0
  },
  {
    name: "Total sOADA",
    currency: "sOADA",
    amount: 0,
    value: 0
  },
];

/**
 * OADA yield options configuration
 * 
 * Defines the various yield opportunities available in the OADA ecosystem:
 * - sOADA staking (native yield)
 * - Splash DEX liquidity provision (OADA-ADA pair)
 * - WingRiders DEX liquidity provision (OADA-ADA pair)
 * - OADA Lock for OPTIMiz conversion
 * 
 * Each option includes display information, APY (when available),
 * and action buttons with appropriate links.
 */
const oada_yields: YieldOption[] = [
  {
    positionName: "sOADA",
    opportunity: "OADA Yield",
    apy: "-%",
    currencyLogos: ["soada"],
    button: {
      label: 'Stake',
      href: '/oada/mint-stake-earn#stake'
    }
  },
  {
    positionName: "Splash: OADA - ADA LP",
    opportunity: "MM Fees + Farming",
    apy: undefined,
    externalLink: true,
    currencyLogos: ["oada", "ada"],
    button: {
      label: 'View',
      href: '//app.splash.trade/liquidity/66eabfc9d78f7bbfb4a5ad9ae7de59f0a8bebcc96f0f57c33044f110.6e6674'
    }
  },
  {
    positionName: "WingRiders: OADA - ADA LP",
    opportunity: "MM Fees + Farming",
    apy: undefined,
    externalLink: true,
    currencyLogos: ["oada", "ada"],
    button: {
      label: 'View',
      href: '//app.wingriders.com/pools/6fdc63a1d71dc2c65502b79baae7fb543185702b12c3c5fb639ed737af566e23a4c4c055d5e6605137d1429f2a26c4ada9c699ba4c7f379b51e0332c'
    }
  },
  {
    positionName: "OADA Lock",
    opportunity: "OPTIMiz Conversion",
    apy: undefined,
    externalLink: false,
    currencyLogos: ["oada", "optimiz"],
    button: {
      label: 'Lock',
      href: '#optimiz-unlock'
    }
  },
];

/**
 * OADADashboard Component
 * 
 * Main dashboard component for the OADA ecosystem, displaying TVL,
 * volume data, user positions, and yield opportunities.
 * 
 * @returns The complete OADA dashboard interface
 */
export const OADADashboard = () => {
  const navigate = useNavigate()
  const {hash} = useLocation()
  const dispatch = useAppDispatch()
  
  // Fetch initial data on component mount
  useEffect(() => {
    dispatch(getOadaFrontendInfo())
    dispatch(getSoadaHistoricalReturn())
    dispatch(getStakeAuctionVolume())
    dispatch(getStakeLockHistoricVolume())
  }, [dispatch])
  
  // Get data from Redux store
  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)
  const walletOadalet = useAppSelector(selectWalletOadaletAmount)
  const walletSoadalet = useAppSelector(selectWalletSoadaletAmount)
  const walletLp = useAppSelector(selectWalletOadaLpAmount)
  
  // Calculate pool statistics for LP position
  const circLp = Big(oadaFrontendInfo?.stablePoolView.stablePoolCircLpAmount || 1)
  const stablePoolStake = walletLp.div(circLp)
  const walletStablePoolBaseAmount = Big(oadaFrontendInfo?.stablePoolView.stablePoolBaseAmount || 0)
  const walletStablePoolOadaAmount = Big(oadaFrontendInfo?.stablePoolView.stablePoolOadaAmount || 0)

  // Get sOADA APY for display
  const soadaApy = formatPercent(useAppSelector(selectSoadaApyMovingAverage()))

  // Calculate OPTIMiz conversion APYs
  const optimToOada = 0.400338 // OADA price in relation to OPTIMiz
  const optimizApys = Object.values(Optimiz.lockTypes).map(({ days, ratio }) => {
    return +Big(100).div(ratio).mul(365).div(days)
  })
  
  // Find min and max APYs for OPTIMiz locks
  const [minOptimizApy, maxOptimizApy] =
    optimizApys.reduce(([min, max]: [number | undefined, number | undefined], v) => {
      return [(!min || v < min) ? v : min, (!max || v > max) ? v : max]
      },
      [undefined, undefined]
    )

  // Update yield options with current APY data
  oada_yields.forEach(value => {
    if (value.positionName === 'sOADA') {
      value.apy = soadaApy || "-%"
      value.tooltip = <>The 6-epoch simple moving average APY for staking OADA</>
    }
    if (value.positionName === 'OADA Lock' && minOptimizApy && maxOptimizApy) {
      value.apy = `${formatDecimals(minOptimizApy * optimToOada, 2)} - ${formatDecimals(maxOptimizApy * optimToOada, 2)}%`
      value.tooltip = <>
        {`At OPTIM price of ${formatDecimals(optimToOada, 3)} ADA`}<br />
        Higher price implies a higher APY, and a Lower price implies a lower APY<br />
        Longer duration implies higher APY
      </>
    }
  })

  // Prepare user positions data for display
  const user_positions = [
    {
      positionName: "OADA",
      value: Number(walletOadalet.div(1000000)),
      opportunity: "OADA Yield",
      apy: "5.4%",
      currencyLogos: ["oada"],
    },
    {
      positionName: "sOADA",
      value: Number(walletSoadalet.div(1000000)),
      opportunity: "OADA Yield",
      apy: "5.4%",
      currencyLogos: ["soada"],
    },
    {
      positionName: "OADA - ADA LP",
      value: Number(stablePoolStake.mul(
        walletStablePoolBaseAmount.add(walletStablePoolOadaAmount)).div(1000000)
      ),
      opportunity: "OADA Yield",
      apy: "5.4%",
      currencyLogos: ["oada", "ada"],
    },
  ];
  
  // Calculate and update TVL data
  let totalValueLocked = 0
  if (oadaFrontendInfo) {
    totalValueLocked = oadaFrontendInfo.totalReserves
    chartData[0].amount = (totalValueLocked - oadaFrontendInfo.stakingAmoView.soadaBackingLovelace) / 1000000
    chartData[0].value = chartData[0].amount
    chartData[1].amount = oadaFrontendInfo.stakingAmoView.soadaAmount / 1000000
    chartData[1].value =
      chartData[1].amount
        * oadaFrontendInfo.stakingAmoView.soadaBackingLovelace
        / oadaFrontendInfo.stakingAmoView.soadaAmount
    totalValueLocked /= 1000000
  }

  // Prepare volume data for display
  const { intervals: stakeAuctionVolume, cumulativeVolume: stakeAuctionCumulatitveVolume } = useAppSelector(selectStakeAuctionVolumeData);
  const volumeData: VolumeChartData = stakeAuctionVolume ? [
    {
      name: "1D",
      currency: "₳",
      value: stakeAuctionVolume['1D'],
      amount: stakeAuctionVolume['1D'],
    },
    {
      name: "7D",
      currency: "₳",
      value: (stakeAuctionVolume['7D'] - stakeAuctionVolume['1D']),
      amount: stakeAuctionVolume['7D'],
    },
    {
      name: "30D",
      currency: "₳",
      value: (stakeAuctionVolume['30D'] - stakeAuctionVolume['7D']),
      amount: stakeAuctionVolume['30D']
    },
  ] : []
  
  return (
    <div className="grid">
      <CustomTitle title="OADA Dashboard" />
      
      {/* Cards section - TVL, Volume, User Positions */}
      <section className="py-8">
        <div className="grid fold:grid-cols-4 w-full max-w-[1128px] mx-auto gap-6">
          <TvlCard chartData={chartData.map(x => ({...x, value: +x.value}))} totalValueLocked={totalValueLocked} />
          <VolumeCard chartData={volumeData} totalVolume={stakeAuctionCumulatitveVolume} />
          <UserPositionsCard userPositions={user_positions} />
        </div>
      </section>
      
      {/* OADA Yields section */}
      <section className="py-8">
        <div className="grid w-full max-w-[1128px] mx-auto gap-6">
          <Text size="large">OADA Yields</Text>
          <YieldsTable yieldOptions={oada_yields} />
          
          {/* OptimizLock/Unlock Modal */}
          <Modal open={hash.startsWith('#optimiz-')} onClose={() => navigate('/dashboard')} className="w-fit min-h-[600px] md:h-[60vh] w-[90vw] sm:w-[500px] flex flex-col items-center">
            <div className="w-[80%]">
              <Tabs
                defaultValue="market"
                value={hash}
                onValueChange={(value: string) => { navigate(value) }}
              >
                <TabsList className="align-center p-1 w-full">
                  <TabsTrigger className="flex-1" value="#optimiz-unlock">Unlock</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {hash === '#optimiz-lock'
              ? <OptimizLock />
              : hash === '#optimiz-unlock'
                ? <OptimizUnlock />
                : <></>
            }
          </Modal>
        </div>
      </section>
    </div>
  );
};
