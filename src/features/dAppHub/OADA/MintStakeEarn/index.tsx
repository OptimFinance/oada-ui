import Big from "big.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { BasicResponse, basicResponseToAlert } from "src/utils";
import { Button } from "src/components/ui/button";
import { Card } from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "src/components/ui/tabs";
import { buyOada, cancelStakeOrder, getOadaFrontendInfo, getSoadaHistoricalReturn, selectBuyOadaResponse, selectOadaFrontendInfo, selectSoadaApyMovingAverage, selectStakeOadaResponse, selectUnstakeOadaResponse, stakeOada, unstakeOada } from "src/oada/actions";
import { useAppDispatch, useAppSelector } from "src/store/hooks";
import { setAlert } from "src/store/slices/alertSlice";
import { selectWalletLovelaceAmount, selectWalletOadaletAmount, selectWalletSoadaletAmount, updateWalletUtxosThunk } from "src/store/slices/walletSlice";
import { CurrentDeposits } from "../../current-deposits";
import { TransactionInputAmount } from "../../input-amount";
import { getTabTitles, TABS } from "../../tabs";
import { TransactionDetails } from "../../transaction-details";
import {Link, useLocation} from "react-router-dom";
import {oadaMintFee, oadaStakeFee} from "src/config.local";
import {formatDecimals, formatNumberWithSuffix, formatPercent} from "src/utils/formatNumbers";
import CustomTitle from "src/components/Title";
import { Text } from "src/components/ui/typography";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "src/components/ui/table";
import {CurrencyLogos} from "src/components/CurrencyLogos";
import {CustomIconsType} from "src/components/ui/custom-icon";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "src/components/ui/tooltip";
import {FiInfo} from "react-icons/fi";

export const OADAMSE = () => {
  const {pathname, hash} = useLocation();
  const dispatch = useAppDispatch();

  const [, setIsSpinnerModalOpen] = useState(false);
  const [inputAmount, setInputAmount] = useState("0.00");
  const [validInput, setValidInput] = useState(false)
  const [currentTab, setCurrentTab] = useState<TABS>("mint");

  useEffect(() => {
    if (!hash)
      return

    setCurrentTab(hash.slice(1,) as TABS)
    setInputAmount("");
  }, [hash])

  const walletAmountAsLovelace = useAppSelector(selectWalletLovelaceAmount)
  const walletAmountAsAda = walletAmountAsLovelace.div(1_000_000).toNumber()

  const walletOadaletAmount = useAppSelector(selectWalletOadaletAmount);
  const walletOadaAmount = walletOadaletAmount.div(1_000_000).toNumber()
  const walletSoadaletAmount = useAppSelector(selectWalletSoadaletAmount);
  const walletSoadaAmount = walletSoadaletAmount.div(1_000_000).toNumber()

  const buyOadaResponse = useAppSelector(selectBuyOadaResponse);
  const stakeOadaResponse = useAppSelector(selectStakeOadaResponse);
  const unstakeOadaResponse = useAppSelector(selectUnstakeOadaResponse);

  const responses: { [key: string]: BasicResponse<string> | undefined } = useMemo(() => ({
    buyOadaResponse,
    stakeOadaResponse,
    unstakeOadaResponse,
  }), [buyOadaResponse?.contents, stakeOadaResponse?.contents, unstakeOadaResponse?.contents]);

  // remember to update the list of values it watches
  const prev = useRef(responses);
  useEffect(() => {
    for (const [key, prevResponse] of Object.entries(prev.current)) {
      const currResponse = responses[key];
      if (prevResponse !== currResponse) {
        console.log("Response changed", key, prevResponse, currResponse);
        dispatch(setAlert(basicResponseToAlert(currResponse)));
        if (currResponse !== undefined && currResponse.tag === "OK") {
          (async () => await dispatch(updateWalletUtxosThunk(null)))();
        }
      }
      setIsSpinnerModalOpen(false);
      prev.current[key] = currResponse; // { [key]: currResponse }
    }
    dispatch(getOadaFrontendInfo())
    dispatch(getSoadaHistoricalReturn())
  }, [dispatch, buyOadaResponse?.contents, stakeOadaResponse?.contents, unstakeOadaResponse?.contents, walletAmountAsLovelace.toString()]);
  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)

  const minimumMint = 100
  const stakingApy = formatPercent(useAppSelector(selectSoadaApyMovingAverage()))

  const currentDeposits = oadaFrontendInfo?.stakingAmoView.soadaAmount ?? 0;
  const maxCapacity = oadaFrontendInfo?.stakingAmoView.soadaLimit ?? 0;
  const stakeVaultCapacity = (maxCapacity - currentDeposits) / 1e6;
  const stakingQueue = oadaFrontendInfo?.batchStakesView.oadaAmount;
  const stakingRate = (oadaFrontendInfo?.stakingAmoView?.soadaBackingLovelace ?? 1) / currentDeposits

  const ada_oada_conversion_rate = "1 ADA = 1 OADA";
  const oada_soada_conversion_rate = `1 sOADA = ${formatDecimals(stakingRate, 5)} OADA`;
  const soada_oada_conversion_rate = `1 sOADA = ${formatDecimals(stakingRate * 0.999, 5)} OADA`;

  const handleMintOada = () => {
    console.log("Minting OADA");
    const adaAmount = Big(inputAmount).mul(1_000_000)
    if (adaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        buyOada({
          amount: BigInt(adaAmount.toString()),
        })
      );
    }
  };

  const handleStakeOada = () => {
    console.log("Staking OADA");
    const oadaAmount = Big(inputAmount).mul(1_000_000)
    if (oadaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        stakeOada({
          amount: BigInt(oadaAmount.toString()),
        })
      );
    }
  };

  const handleUnstakeSoada = () => {
    console.log("Unstaking sOADA");
    const soadaAmount = Big(inputAmount).mul(1_000_000)
    if (soadaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        unstakeOada({
          amount: BigInt(soadaAmount.toString()),
        })
      )
    }
  };

  const handleAddToQueue = () => {
    handleStakeOada()
  };

  type StakeOrderJob = 'stake' | 'unstake'
  type StakeOrderFormattedView = {
    job: StakeOrderJob,
    assetIn: CustomIconsType[],
    assetOut: CustomIconsType[],
    amountIn: string,
    amountOut: string,
    id: string
  }
  const ownerOrderViews: StakeOrderFormattedView[] = []

  oadaFrontendInfo?.ownerOadaStakeOrderViews.forEach(view => {
    ownerOrderViews.push({
      job: 'stake',
      assetIn: ['oada'],
      assetOut: ['soada'],
      amountIn: formatNumberWithSuffix(view.oadaAmount, 6),
      amountOut: formatNumberWithSuffix(view.oadaAmount / stakingRate, 6),
      id: view.txOutRef
    })
  })
  oadaFrontendInfo?.ownerOadaUnstakeOrderViews.forEach(view => {
    ownerOrderViews.push({
      job: 'unstake',
      assetIn: ['soada'],
      assetOut: ['oada'],
      amountIn: formatNumberWithSuffix(view.soadaAmount, 6),
      amountOut: formatNumberWithSuffix(view.soadaAmount * stakingRate, 6),
      id: view.txOutRef
    })
  })

  const tabTitles = getTabTitles("OADA");

  return (
    <div className="grid p-2 md:p-8 gap-6 justify-center">
      {currentTab === "stake"
        ? tabTitles[currentTab](stakingApy)
        : tabTitles[currentTab]}
      <Card className="md:w-[560px]">
        <Tabs
          defaultValue="mint"
          value={currentTab}
        >
          <TabsList className="w-full p-[3px]">
            {["mint", "stake", "unstake"].map(value =>
              <Link className="flex-1" to={`${pathname}#${value}`}>
                <TabsTrigger value={value} className="w-full capitalize">
                  {value}
                </TabsTrigger>
              </Link>
            )}
          </TabsList>

          <TabsContent value="mint" className="space-y-6">
            <CustomTitle title="Mint OADA" />
            <TransactionInputAmount
              currency="ADA"
              icons={["ada"]}
              availableAmount={Math.max(0, walletAmountAsAda - 5)}
              setInputAmount={setInputAmount}
              inputAmount={inputAmount}
              setValidInput={setValidInput}
              currentTab={currentTab}
              minimum={minimumMint}
            />
            <Separator />
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={ada_oada_conversion_rate}
              txFee={`${Number(oadaMintFee) / 1000000} ADA`}
            />
            <Separator />
            <Button size="lg" className="w-full" onClick={handleMintOada} disabled={!validInput}>
              Mint OADA
            </Button>
          </TabsContent>

          <TabsContent value="stake" className="space-y-6">
            <CustomTitle title="Stake OADA" />
            <TransactionInputAmount
              currentTab={currentTab}
              currency="OADA"
              icons={["oada"]}
              availableAmount={walletOadaAmount}
              setInputAmount={setInputAmount}
              inputAmount={inputAmount}
              setValidInput={setValidInput}
              stakingQueue={stakingQueue}
              handleAddToQueue={handleAddToQueue}
              stakeVaultCapacity={stakeVaultCapacity}
            />
            <Separator />
            <CurrentDeposits
              currency="OADA"
              currentDeposits={currentDeposits}
              maxCapacity={maxCapacity}
              stakingQueue={stakingQueue}
            />
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={oada_soada_conversion_rate}
              expectedOutput={inputAmount && formatDecimals(parseFloat(inputAmount) / stakingRate, 2)}
              txFee={`${Number(oadaStakeFee) / 1000000} ADA`}
            />
            <Separator />
            {parseFloat(inputAmount) > stakeVaultCapacity ? (
              <Button size="lg" className="w-full" onClick={handleStakeOada} disabled={!validInput}>
                Add to Queue
              </Button>
            ) : (
              <Button size="lg" className="w-full" onClick={handleStakeOada} disabled={!validInput}>
                Stake OADA
              </Button>
            )}
          </TabsContent>

          <TabsContent value="unstake" className="space-y-6">
            <CustomTitle title="Unstake OADA" />
            <TransactionInputAmount
              currentTab={currentTab}
              currency="sOADA"
              icons={["soada"]}
              availableAmount={walletSoadaAmount}
              setInputAmount={setInputAmount}
              inputAmount={inputAmount}
              setValidInput={setValidInput}
            />
            <Separator />
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={soada_oada_conversion_rate}
              expectedOutput={inputAmount && formatDecimals(parseFloat(inputAmount) * stakingRate * 0.999, 2)}
              txFee={`${Number(oadaStakeFee) / 1000000} ADA`}
            />
            <Separator />
            <Button size="lg" className="w-full" onClick={handleUnstakeSoada} disabled={!validInput}>
              Unstake sOADA
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
      {ownerOrderViews.length > 0 && 
        <section className="py-8">
          <div className="grid w-full mx-auto gap-6">
            <Text className="px-4" size="large">Your pending stakes</Text>
            <div className="rounded-xl border border-ui-border-default p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-fit px-0 pb-4">
                      
                    </TableHead>
                    <TableHead className="h-fit px-0 pb-4">
                      Amount Sent
                    </TableHead>
                    <TableHead className="h-fit px-0 pb-4" minBreakpoint="sm">
                      Amount to Receive
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <FiInfo className="h-4 w-4 ml-1" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This amount is calculated based on the current staking rate and is subject to change.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="h-fit px-0 pb-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownerOrderViews.map((orderView, _index) => (
                    <TableRow>
                      <TableCell className="px-0 py-2 pt-6">
                        <div className="flex gap-2 items-center capitalize">
                          {orderView.job}
                        </div>
                      </TableCell>
                      <TableCell className="px-0 py-2 pt-6">
                        <Text size="large" className="p-2 inline-block">
                        {orderView.amountIn}
                        <CurrencyLogos
                          logos={orderView.assetIn}
                          className="inline-block h-4"
                        />
                        </Text>
                      </TableCell>
                      <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                        <Text size="large" className="p-2 inline-block">
                        {orderView.amountOut}
                        <CurrencyLogos
                          logos={orderView.assetOut}
                          className="inline-block h-4"
                        />
                        </Text>
                      </TableCell>
                      <TableCell className="px-0 py-2 pt-6 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-sm capitalize"
                          onClick={() => dispatch(cancelStakeOrder({ orderId: orderView.id }))}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                   ))
                  }
                </TableBody>
              </Table>
            </div>
          </div>
        </section>
      }
    </div>
  );
};
