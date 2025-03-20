/**
 * Epoch Stake Auction Dashboard
 * 
 * This component provides a comprehensive dashboard for the Epoch Stake Auction feature,
 * displaying market data, user's bids, and an embedded bid form. It serves as the main
 * entry point to the staking auction functionality.
 * 
 * Key features:
 * - Real-time market data with headers showing epoch, sold stake, auction countdown, and volume
 * - Visual representation of the order book with a price/depth chart
 * - Current market clearing rate visualization
 * - Table of existing orders in the system
 * - Embedded bid form for quick order creation
 * - Table of user's active bids with cancellation options
 * 
 * The dashboard polls for updates and recalculates various metrics to provide
 * users with current auction information.
 */

import Big from "big.js";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FiInfo } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
//import { Fragment } from "react/jsx-runtime";
import {
  Area,
  AreaChart,
  Label,
  Tooltip as RechartsTooltip,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { CartesianViewBox, ViewBox } from "recharts/types/util/types";
import { relativeEpochToAbsoluteEpoch } from "src/utils";
import { max, min } from "src/utils";
import { CurrencyLogos } from "src/components/CurrencyLogos";
import { Button } from "src/components/ui/button";
import { Card } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { Text } from "src/components/ui/typography";
import { getOadaFrontendInfo, getStakeAuctionVolume, selectOadaFrontendInfo, selectStakeAuctionVolume } from "src/oada/actions";
import { useAppDispatch, useAppSelector, useInterval } from "src/store/hooks";
import { selectWallet } from "src/store/slices/walletSlice";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";
import { BidForm, calcRequestedStakeAmount } from "../Bid/bid-form";
import {BidView, formatBidView} from "src/oada/view";
import CustomTitle from "src/components/Title";
import {Progress} from "src/components/ui/progress";
import {VolumeChartData} from "../../volume-card";

/**
 * Format milliseconds to HH:MM:SS format
 * 
 * @param milliseconds - Time in milliseconds to format
 * @returns Formatted time string in HH:MM:SS format
 */
function formatHours(milliseconds: number) {
  const seconds = (Math.floor(milliseconds / 1000) % 60).toString().padStart(2, "0")
  const minutes = (Math.floor(milliseconds / 1000 / 60) % 60).toString().padStart(2, "0")
  const hours = Math.floor(milliseconds / 1000 / 60 / 60).toString().padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}

/**
 * APY Bucket type
 * 
 * Represents a bucket in the APY distribution chart,
 * with an APY value and corresponding stake amount
 */
type ApyBucket = {
  apy: string,
  requestedStakeAmount: number,
}

/**
 * Header Card Data type
 * 
 * Defines the structure for the header cards at the top of the dashboard
 */
type HeaderCardData = {
  title: string,
  body: string | JSX.Element,
  tooltip?: string 
}

/**
 * HeaderCard Component
 * 
 * Renders a card with a title, body content, and optional tooltip
 * Used for displaying key metrics at the top of the dashboard
 * 
 * @param data - Header card data including title, body content, and optional tooltip
 */
const HeaderCard = ({data}: {data: HeaderCardData}) =>
  <Card className="flex flex-col items-center justify-center px-4 py-10 gap-1 h-[170px]">
    <div className="flex items-center">
      <Text tone="muted">{data.title}</Text>
      {data.tooltip &&
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiInfo className="h-4 w-4 ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{data.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    </div>
    <Text size="xlarge">{data.body}</Text>
  </Card>

/**
 * EpochStakeAuctionDashboard Component
 * 
 * Main dashboard component for the Epoch Stake Auction feature,
 * displaying market data, charts, and user bids.
 * 
 * @returns The complete dashboard interface
 */
export const EpochStakeAuctionDashboard = () => {
  // State for the auction end countdown timer
  const [auctionEndCountdownFormatted, setAuctionEndCountdownFormatted] = useState("-")

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wallet = useAppSelector(selectWallet)

  // Fetch initial data on component mount or wallet change
  useEffect(() => {
    dispatch(getOadaFrontendInfo());
    dispatch(getStakeAuctionVolume());
  }, [dispatch, wallet?.address]);

  // Poll for updates every 30 seconds
  useInterval("updateFrontendInfo", () => {
    dispatch(getOadaFrontendInfo())
  }, 30000)

  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)

  // Initialize formatted display values
  let epochFormatted = "-"
  let volumeFormatted: string | JSX.Element = "-"
  let lockedStakeFormatted: string | JSX.Element = "-"
  let bidViews: BidView[] = []
  let ownerBidViews: BidView[] = []
  let clearingRateFormatted = "0%";

  // Update countdown timer every second
  useInterval("updateCountdown", () => {
    if (oadaFrontendInfo !== undefined) {
      const auctionEndMillis = Number(oadaFrontendInfo.currEpochEndPosixTime - 7200) * 1000
      setAuctionEndCountdownFormatted(formatHours(Math.max(0, auctionEndMillis-Date.now())))
    }
  }, 1000, [oadaFrontendInfo === undefined])

  // Initialize buckets for APY distribution chart and table
  let tableBuckets: ApyBucket[] = []
  const cumApyBuckets: ApyBucket[] = []
  const bidApyBucketCount = 8
  const stakeAuctionVolume = useAppSelector(selectStakeAuctionVolume);
  
  // Process data for display when OADA frontend info is available
  if (oadaFrontendInfo !== undefined) {
    // Format epoch number
    epochFormatted = relativeEpochToAbsoluteEpoch(oadaFrontendInfo.currEpoch).toString()
    const totalReserves = Big(oadaFrontendInfo.totalReserves.toString())
    const stakedReserves = Big(oadaFrontendInfo.stakedReserves.toString())

    // Format volume data
    const volumeData: VolumeChartData = stakeAuctionVolume ? [
      {
        name: "1D",
        currency: "₳",
        value: stakeAuctionVolume['1D'],
        amount: stakeAuctionVolume['1D'],
      },
      {
        name: "30D",
        currency: "₳",
        value: (stakeAuctionVolume['30D'] - stakeAuctionVolume['7D']),
        amount: stakeAuctionVolume['30D']
      },
    ] : []
    
    // Create volume display element
    volumeFormatted = <>
      <div className="flex flex-row divide-x-2 divide-ui-background-sub">
        {volumeData.map(x =>
          <div className="flex flex-col justify-center items-center p-2">
            <div className="flex">
              <Text size="xlarge">{formatNumberWithSuffix(x.amount, 6)}</Text>
              <Text tone="muted" size="xlarge">{x.currency}</Text>
            </div>
            <Text className="flex" size="medium" tone="muted">{x.name}</Text>
          </div>
        )}
      </div>
    </>
    
    // Create locked stake display with progress bar
    lockedStakeFormatted = <>
      <div>
        <Text size="xlarge">{formatNumberWithSuffix(+stakedReserves, 6) + "/" + formatNumberWithSuffix(+totalReserves, 6)} ₳</Text>
      </div>
      <Progress value={+stakedReserves.div(totalReserves).mul(100)} />
    </>
    
    // Prepare timestamp and format clearing rate
    const currEpochEndPosixTimeAsMillis = Number(oadaFrontendInfo.currEpochEndPosixTime - 7200) * 1000
    const clearingRate = Big(oadaFrontendInfo.clearingRate.toString()).div(10).round(1, Big.roundDown)
    clearingRateFormatted = `${clearingRate.toString()}%`

    // Find min and max APY values from all bids
    const [minBidApy, maxBidApy] = oadaFrontendInfo.bidViews.reduce(([prevMinApy, prevMaxApy], view) => {
      const apy = Big(view.apy.toString())
      const nextMinApy = min(prevMinApy, apy)
      const nextMaxApy = max(prevMaxApy, apy)
      return [nextMinApy, nextMaxApy]
    }, [Big(Number.MAX_VALUE), Big(Number.MIN_VALUE)])

    // Calculate bid range and interval for bucketing
    const bidRange = maxBidApy.eq(minBidApy) ? Big(1) : maxBidApy.sub(minBidApy)
    const bidStep = bidRange.div(bidApyBucketCount)
    const intervalLength = bidStep

    // Create table buckets for order book display
    tableBuckets = _.range(0, +bidRange + 1, 1).map(v => {
      return {
        apy: `${minBidApy.add(v).div(10)}%`,
        requestedStakeAmount: 0,
      }
    })
    
    // Populate table buckets with bid data
    oadaFrontendInfo.bidViews.forEach(bidView =>
      tableBuckets[bidView.apy - +minBidApy].requestedStakeAmount += +calcRequestedStakeAmount(Big(bidView.amount), Big(bidView.apy))
    )

    if (maxBidApy.round(0).gt(0)) {
      // Create APY buckets for the chart
      const apyBuckets = _.range(0, bidApyBucketCount + 1, 0).map((_v, i) => {
        return {
          apy: `${minBidApy.add(i * +bidStep).div(10).round(1).toString()}%`,
          requestedStakeAmount: 0,
        }
      })
      
      // Populate APY buckets with bid data
      oadaFrontendInfo.bidViews.forEach((bidView) => {
        const apy = Big(bidView.apy.toString())
        const bidAmount = Big(bidView.amount.toString())
        const requestedStakeAmount = calcRequestedStakeAmount(bidAmount, apy)

        const index = (apy.sub(minBidApy).div(intervalLength).round(0, Big.roundDown)).toNumber()
        apyBuckets[index].requestedStakeAmount += requestedStakeAmount.toNumber()
      })

      // Calculate cumulative values for the chart
      apyBuckets.reduceRight((acc, bucket, i) => {
        const requestedStakeAmount = bucket.requestedStakeAmount / 1e6
        cumApyBuckets[i] = {
          ...bucket,
          requestedStakeAmount: requestedStakeAmount + acc.toNumber()
        }
        return acc.add(requestedStakeAmount)
      }, Big(0))

      // Format bid views for display
      bidViews = oadaFrontendInfo.bidViews.map(formatBidView(currEpochEndPosixTimeAsMillis))
      ownerBidViews = oadaFrontendInfo.ownerBidViews.map(formatBidView(currEpochEndPosixTimeAsMillis))
    } else {
      // Create presentable empty data if no bids exist
      const start = 30
      const step = 2
      const end = start + bidApyBucketCount * step
      for (let apy = start; apy < end; apy += 2)
        cumApyBuckets.push({
          apy: Big(apy).div(10).toString(),
          requestedStakeAmount: 0
        })
    }
  }
  
  // Calculate chart dimensions
  const maxY = Math.max(...bidViews.map((item) => item.amount));
  const marketClearRateLineHeight = maxY / 7;

  // Prepare header card data
  const headerData: HeaderCardData[] = [
    {
      title: 'Epoch',
      body: epochFormatted,
      tooltip: 'Current epoch'
    },
    {
      title: 'Sold Stake',
      tooltip: 'Total Amount of system ADA reserves locked until the epoch end, with staking rights sold to the highest bidder.',
      body: lockedStakeFormatted
    },
    {
      title: 'Auction End',
      tooltip: 'The auction ends 2 hours before the epoch ends.',
      body: auctionEndCountdownFormatted
    },
    {
      title: 'Stake Auction Volume',
      tooltip: 'The cumulative amount of ADA staked via auction',
      body: volumeFormatted
    },
  ]

  return (
    <div className="grid">
      <CustomTitle title="Epoch Stake Auction" />
      
      {/* Header cards section */}
      <section className="py-8">
        <div className="grid grid-cols-2 fold:grid-cols-4 w-full max-w-[1128px] mx-auto gap-2 fold:gap-6">
          {headerData.map(data => <HeaderCard data={data} />)}
        </div>
      </section>
      
      {/* Order book and bid form section */}
      <section className="py-8">
        <div className="w-full max-w-[1128px] mx-auto">
          <Text className="p-4" size="large">Order Book</Text>
          <div className="grid fold:grid-cols-2 gap-6">
            <div>
              <div className="gap-3">
                <div className="flex flex-col gap-6">
                  {/* Price/depth chart */}
                  <Card className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={cumApyBuckets}
                        margin={{ top: 24, left: 0, right: 0, bottom: 16 }}
                      >
                        <XAxis
                          label={{
                            value: "Price %APY",
                            position: "insideRight",
                            dy: 24,
                            dx: 4,
                            style: { fontSize: "12px" },
                          }}
                          dataKey="apy"
                          axisLine={false}
                          tickLine={false}
                          tick={(props) => {
                            const isMarketClearingRate =
                              props.payload.value === clearingRateFormatted;
                            console.log('apykey', props)
                            return (
                              <g transform={`translate(${props.x},${props.y})`}>
                                <text
                                  x={0}
                                  y={0}
                                  dy={16}
                                  fontSize={12}
                                  textAnchor="middle"
                                  fill={isMarketClearingRate ? "#54b471" : "white"}
                                >
                                  {props.payload.value}
                                </text>
                              </g>
                            );
                          }}
                          fontSize="12px"
                          tickFormatter={(value) => value.replace("%", "")}
                        />
                        <YAxis
                          label={{
                            value: "Depth",
                            position: "top",
                            dy: -10,
                            dx: -14,
                            style: { fontSize: "12px" },
                          }}
                          tickFormatter={(value) =>
                            value === 0 ? value : formatNumberWithSuffix(value)
                          }
                          mirror={true}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "white" }}
                          fontSize="12px"
                        />
                        
                        {/* Market clearing rate reference line */}
                        <ReferenceLine
                          segment={[
                            { x: clearingRateFormatted, y: 0 },
                            { x: clearingRateFormatted, y: marketClearRateLineHeight },
                          ]}
                          stroke="#54B471"
                          strokeWidth={2}
                        >
                          <Label
                            color="#54B471"
                            value={"Market Clearing Rate"}
                            content={(props) => {
                              const { viewBox } = props;
                              if (viewBox && isCartesianViewBox(viewBox))
                                return (
                                  <text
                                    x={viewBox.x}
                                    y={viewBox.y}
                                    fill="#54B471"
                                    fontSize={12}
                                    textAnchor="middle"
                                    dy={-44}
                                  >
                                    {"Market Clearing Rate"
                                      .split(" ")
                                      .map((word, index) => (
                                        <tspan
                                          x={viewBox.x}
                                          dy={index > 0 ? "1.2em" : ""}
                                          key={index}
                                        >
                                          {word}
                                        </tspan>
                                      ))}
                                  </text>
                                );
                            }}
                          />
                        </ReferenceLine>
                        <ReferenceDot
                          x={clearingRateFormatted}
                          y={marketClearRateLineHeight}
                          r={4}
                          stroke="#54B471"
                          fill="#54B471"
                        />
                        <RechartsTooltip
                          allowEscapeViewBox={{ x: true, y: true }}
                          cursor={false}
                          content={<CustomTooltip />}
                        />
                        <Area
                          type="step"
                          dataKey="requestedStakeAmount"
                          fill="#54B471"
                          fillOpacity={0.2}
                          stroke="#54B471"
                          strokeWidth={2}
                        />
                      </AreaChart>
                      
                    </ResponsiveContainer>
                  </Card>
                  
                  {/* Orders table */}
                  <Card className="w-full">
                    <Text tone="muted">Orders</Text>
                    <Separator className="my-4" />
                    <Table>
                      <TableHeader className="border-none">
                        <TableRow>
                          <TableHead className="px-0 w-1/3 h-fit pb-4">
                            Price
                          </TableHead>
                          <TableHead className="px-0 w-1/3 h-fit pb-4">
                            Quantity
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Display only non-zero orders, sorted by price (highest first) */}
                        {tableBuckets.filter(item => item.requestedStakeAmount > 0).reverse().map((item) => (
                          <TableRow>
                            <TableCell className="px-0 py-2">{item.apy}</TableCell>
                            <TableCell className="px-0 py-2">
                              {formatNumberWithSuffix(item.requestedStakeAmount, 6)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>
            </div>
            
            {/* Embedded bid form */}
            <Card className="relative">
              <BidForm bidId={""} />
            </Card>
          </div>
        </div>
      </section>
      
      {/* User's bids section */}
      <section className="py-8">
        <div className="grid w-full max-w-[1128px] mx-auto gap-6">
          <Text className="px-4" size="large">Your Bids</Text>
          <div className="rounded-xl border border-ui-border-default p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-fit px-0 pb-4 w-[284px]">
                    Asset
                  </TableHead>
                  <TableHead className="h-fit px-0 pb-4 w-[244px]" minBreakpoint="sm">
                    APR Offered
                  </TableHead>
                  <TableHead className="h-fit px-0 pb-4 w-[244px]" minBreakpoint="sm">
                    Amount
                  </TableHead>
                  <TableHead className="h-fit px-0 pb-4 w-[244px]">
                    Quantity
                  </TableHead>
                  <TableHead className="h-fit px-0 pb-4 w-[250px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* List of user's active bids */}
                {ownerBidViews.map((bidView, _index) => (
                  <TableRow>
                    <TableCell className="px-0 py-2 pt-6">
                      <div className="flex gap-2 items-center">
                        <CurrencyLogos logos={[bidView.asset === 'OADA' ? "oada" : "ada"]} />
                        {bidView.asset}
                      </div>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">{bidView.apy}</TableCell>
                    <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                      {bidView.amountFormatted}
                      <span className="text-ui-surface-sub"> {bidView.asset}</span>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6">
                      {bidView.requestedSizeFormatted}
                      <span className="text-ui-surface-sub"> ADA</span>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-sm"
                        onClick={() =>
                          navigate(`/epoch-stake-auction/bid/${bidView.id}`)
                        }
                      >
                        Cancel Bid
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * Custom Tooltip Component for the Price/Depth Chart
 * 
 * Displays APY and quantity information when hovering over chart points
 * 
 * @param active - Whether the tooltip is active
 * @param payload - Data payload for the tooltip
 * @returns Tooltip component or null if inactive
 */
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const item: ApyBucket = payload[0].payload;

    return (
      <div
        style={{
          transform: "translate(-88px,-100px)",
        }}
        className="w-[176px] rounded-lg flex flex-col items-center border bg-ui-base-white px-4 py-2 text-sm text-ui-surface-dark"
      >
        <p className="label">APY: {`${item.apy}`}</p>
        <p className="label">Quantity: {`${formatNumberWithSuffix(+Big(item.requestedStakeAmount), 0)} ADA`}</p>
      </div>
    );
  }

  return null;
};

/**
 * Type guard for CartesianViewBox
 * 
 * Checks if a ViewBox object is a CartesianViewBox with the expected properties
 * 
 * @param object - The object to check
 * @returns Boolean indicating if the object is a CartesianViewBox
 */
function isCartesianViewBox(object: ViewBox): object is CartesianViewBox {
  return (
    object &&
    "x" in object &&
    "y" in object &&
    "width" in object &&
    "height" in object
  );
}
