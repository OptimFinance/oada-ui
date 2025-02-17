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

function formatHours(milliseconds: number) {
  const seconds = (Math.floor(milliseconds / 1000) % 60).toString().padStart(2, "0")
  const minutes = (Math.floor(milliseconds / 1000 / 60) % 60).toString().padStart(2, "0")
  const hours = Math.floor(milliseconds / 1000 / 60 / 60).toString().padStart(2, "0")

  return `${hours}:${minutes}:${seconds}`
}

type ApyBucket = {
  apy: string,
  requestedStakeAmount: number,
}

type HeaderCardData = {
  title: string,
  body: string | JSX.Element,
  tooltip?: string 
}

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

export const EpochStakeAuctionDashboard = () => {
  const [auctionEndCountdownFormatted, setAuctionEndCountdownFormatted] = useState("-")

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const wallet = useAppSelector(selectWallet)

  useEffect(() => {
    dispatch(getOadaFrontendInfo());
    dispatch(getStakeAuctionVolume());
  }, [dispatch, wallet?.address]);

  useInterval("updateFrontendInfo", () => {
    dispatch(getOadaFrontendInfo())
  }, 30000)

  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)

  let epochFormatted = "-"
  let volumeFormatted: string | JSX.Element = "-"
  let lockedStakeFormatted: string | JSX.Element = "-"
  let bidViews: BidView[] = []
  let ownerBidViews: BidView[] = []

  let clearingRateFormatted = "0%";

  useInterval("updateCountdown", () => {
    if (oadaFrontendInfo !== undefined) {
      const auctionEndMillis = Number(oadaFrontendInfo.currEpochEndPosixTime - 7200) * 1000
      setAuctionEndCountdownFormatted(formatHours(Math.max(0, auctionEndMillis-Date.now())))
    }
  }, 1000, [oadaFrontendInfo === undefined])

  // what are we trying to accomplish here?
  // we need divide the range of bid apys into buckets
  // and then divide the bid views into those buckets
  // cumulatively
  let tableBuckets: ApyBucket[] = []
  const cumApyBuckets: ApyBucket[] = []
  const bidApyBucketCount = 8
  const stakeAuctionVolume = useAppSelector(selectStakeAuctionVolume);
  if (oadaFrontendInfo !== undefined) {
    epochFormatted = relativeEpochToAbsoluteEpoch(oadaFrontendInfo.currEpoch).toString()
    const totalReserves = Big(oadaFrontendInfo.totalReserves.toString())
    const stakedReserves = Big(oadaFrontendInfo.stakedReserves.toString())

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
    lockedStakeFormatted = <>
      <div>
        <Text size="xlarge">{formatNumberWithSuffix(+stakedReserves, 6) + "/" + formatNumberWithSuffix(+totalReserves, 6)} ₳</Text>
      </div>
      <Progress value={+stakedReserves.div(totalReserves).mul(100)} />
    </>
    const currEpochEndPosixTimeAsMillis = Number(oadaFrontendInfo.currEpochEndPosixTime - 7200) * 1000
    const clearingRate = Big(oadaFrontendInfo.clearingRate.toString()).div(10).round(1, Big.roundDown)
    clearingRateFormatted = `${clearingRate.toString()}%`

    const [minBidApy, maxBidApy] = oadaFrontendInfo.bidViews.reduce(([prevMinApy, prevMaxApy], view) => {
      const apy = Big(view.apy.toString())
      const nextMinApy = min(prevMinApy, apy)
      const nextMaxApy = max(prevMaxApy, apy)
      return [nextMinApy, nextMaxApy]
    }, [Big(Number.MAX_VALUE), Big(Number.MIN_VALUE)])

    const bidRange = maxBidApy.eq(minBidApy) ? Big(1) : maxBidApy.sub(minBidApy)
    const bidStep = bidRange.div(bidApyBucketCount)
    const intervalLength = bidStep

    tableBuckets = _.range(0, +bidRange + 1, 1).map(v => {
      return {
        apy: `${minBidApy.add(v).div(10)}%`,
        requestedStakeAmount: 0,
      }
    })
    oadaFrontendInfo.bidViews.forEach(bidView =>
      tableBuckets[bidView.apy - +minBidApy].requestedStakeAmount += +calcRequestedStakeAmount(Big(bidView.amount), Big(bidView.apy))
    )

    if (maxBidApy.round(0).gt(0)) {
      const apyBuckets = _.range(0, bidApyBucketCount + 1, 0).map((_v, i) => {
        return {
          apy: `${minBidApy.add(i * +bidStep).div(10).round(1).toString()}%`,
          requestedStakeAmount: 0,
        }
      })
      oadaFrontendInfo.bidViews.forEach((bidView) => {
        const apy = Big(bidView.apy.toString())
        const bidAmount = Big(bidView.amount.toString())
        const requestedStakeAmount = calcRequestedStakeAmount(bidAmount, apy)

        const index = (apy.sub(minBidApy).div(intervalLength).round(0, Big.roundDown)).toNumber()
        apyBuckets[index].requestedStakeAmount += requestedStakeAmount.toNumber()
      })

      apyBuckets.reduceRight((acc, bucket, i) => {
        const requestedStakeAmount = bucket.requestedStakeAmount / 1e6
        cumApyBuckets[i] = {
          ...bucket,
          requestedStakeAmount: requestedStakeAmount + acc.toNumber()
        }
        return acc.add(requestedStakeAmount)
      }, Big(0))

      bidViews = oadaFrontendInfo.bidViews.map(formatBidView(currEpochEndPosixTimeAsMillis))
      ownerBidViews = oadaFrontendInfo.ownerBidViews.map(formatBidView(currEpochEndPosixTimeAsMillis))
    } else {
      // presentable empty data
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
  const maxY = Math.max(...bidViews.map((item) => item.amount));
  const marketClearRateLineHeight = maxY / 7;

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
      <section className="py-8">
        <div className="grid grid-cols-2 fold:grid-cols-4 w-full max-w-[1128px] mx-auto gap-2 fold:gap-6">
          {headerData.map(data => <HeaderCard data={data} />)}
        </div>
      </section>
      <section className="py-8">
        <div className="w-full max-w-[1128px] mx-auto">
          <Text className="p-4" size="large">Order Book</Text>
          <div className="grid fold:grid-cols-2 gap-6">
            <div>
              {/*<div className="grid md:grid-rows-[1fr,360px] w-full gap-6">*/}
              <div className="gap-3">
                <div className="flex flex-col gap-6">
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
            <Card className="relative">
              <BidForm bidId={""} />
            </Card>
          </div>
        </div>
      </section>
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

function isCartesianViewBox(object: ViewBox): object is CartesianViewBox {
  return (
    object &&
    "x" in object &&
    "y" in object &&
    "width" in object &&
    "height" in object
  );
}
