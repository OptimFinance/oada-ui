/**
 * OADA Mint-Stake-Earn Component
 * 
 * This component provides a multi-tab interface for users to interact with the OADA token ecosystem:
 * 1. Mint: Convert ADA to OADA tokens (1:1 ratio)
 * 2. Stake: Stake OADA tokens to receive sOADA tokens (yield-bearing version of OADA)
 * 3. Unstake: Convert sOADA tokens back to OADA tokens
 * 
 * Key features:
 * - Tab-based navigation between mint/stake/unstake functions
 * - Real-time wallet balance display
 * - Transaction simulation with conversion rates and fees
 * - Staking vault capacity monitoring with queue management
 * - Pending stakes table with cancellation functionality
 * 
 * The component handles token conversions, transaction fee calculations,
 * and manages the staking queue when the staking vault reaches capacity.
 */

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

/**
 * OADAMSE (OADA Mint-Stake-Earn) Component
 * 
 * Main component for the OADA token interaction interface.
 * Provides functionality to mint OADA from ADA, stake OADA to earn yield (as sOADA),
 * and unstake sOADA back to OADA.
 * 
 * @returns The complete OADA Mint-Stake-Earn interface
 */
export const OADAMSE = () => {
  // Get URL info for tab navigation
  const {pathname, hash} = useLocation();
  const dispatch = useAppDispatch();

  // Component state
  const [, setIsSpinnerModalOpen] = useState(false); // Controls loading spinner visibility
  const [inputAmount, setInputAmount] = useState("0.00"); // User input amount
  const [validInput, setValidInput] = useState(false) // Tracks if input is valid
  const [currentTab, setCurrentTab] = useState<TABS>("mint"); // Current active tab

  // Set the current tab based on URL hash and reset input
  useEffect(() => {
    if (!hash)
      return

    setCurrentTab(hash.slice(1,) as TABS)
    setInputAmount("");
  }, [hash])

  // Wallet balances - Convert from Lovelace (smallest unit) to ADA (display unit)
  const walletAmountAsLovelace = useAppSelector(selectWalletLovelaceAmount)
  const walletAmountAsAda = walletAmountAsLovelace.div(1_000_000).toNumber() // 1 ADA = 1,000,000 Lovelace

  // OADA and sOADA balances
  const walletOadaletAmount = useAppSelector(selectWalletOadaletAmount);
  const walletOadaAmount = walletOadaletAmount.div(1_000_000).toNumber() // Convert to display units
  const walletSoadaletAmount = useAppSelector(selectWalletSoadaletAmount);
  const walletSoadaAmount = walletSoadaletAmount.div(1_000_000).toNumber() // Convert to display units

  // Transaction response selectors
  const buyOadaResponse = useAppSelector(selectBuyOadaResponse);
  const stakeOadaResponse = useAppSelector(selectStakeOadaResponse);
  const unstakeOadaResponse = useAppSelector(selectUnstakeOadaResponse);

  // Group all responses for easier monitoring
  const responses: { [key: string]: BasicResponse<string> | undefined } = useMemo(() => ({
    buyOadaResponse,
    stakeOadaResponse,
    unstakeOadaResponse,
  }), [buyOadaResponse?.contents, stakeOadaResponse?.contents, unstakeOadaResponse?.contents]);

  // Track previous response state to detect changes
  const prev = useRef(responses);
  
  // Handle response changes (transaction completions)
  useEffect(() => {
    for (const [key, prevResponse] of Object.entries(prev.current)) {
      const currResponse = responses[key];
      // If response changed, show appropriate alert and update wallet if successful
      if (prevResponse !== currResponse) {
        console.log("Response changed", key, prevResponse, currResponse);
        dispatch(setAlert(basicResponseToAlert(currResponse)));
        if (currResponse !== undefined && currResponse.tag === "OK") {
          (async () => await dispatch(updateWalletUtxosThunk(null)))();
        }
      }
      setIsSpinnerModalOpen(false);
      prev.current[key] = currResponse;
    }
    // Fetch latest OADA and staking info
    dispatch(getOadaFrontendInfo())
    dispatch(getSoadaHistoricalReturn())
  }, [dispatch, buyOadaResponse?.contents, stakeOadaResponse?.contents, unstakeOadaResponse?.contents, walletAmountAsLovelace.toString()]);
  
  // Get OADA frontend information
  const oadaFrontendInfo = useAppSelector(selectOadaFrontendInfo)

  // Constants and calculated values
  const minimumMint = 100 // Minimum ADA amount to mint OADA
  const stakingApy = formatPercent(useAppSelector(selectSoadaApyMovingAverage())) // Current staking APY

  // Staking capacity calculations
  const currentDeposits = oadaFrontendInfo?.stakingAmoView.soadaAmount ?? 0; // Current amount in staking vault
  const maxCapacity = oadaFrontendInfo?.stakingAmoView.soadaLimit ?? 0; // Maximum staking vault capacity
  const stakeVaultCapacity = (maxCapacity - currentDeposits) / 1e6; // Available space in vault (converted to display units)
  const stakingQueue = oadaFrontendInfo?.batchStakesView.oadaAmount; // Amount in queue waiting to be staked
  
  // Conversion rate between OADA and sOADA based on staking pool backing
  const stakingRate = (oadaFrontendInfo?.stakingAmoView?.soadaBackingLovelace ?? 1) / currentDeposits

  // Conversion rates for display and calculations
  const ada_oada_conversion_rate = "1 ADA = 1 OADA"; // Fixed 1:1 ratio
  const oada_soada_conversion_rate = `1 sOADA = ${formatDecimals(stakingRate, 5)} OADA`; // Dynamic rate based on staking pool
  const soada_oada_conversion_rate = `1 sOADA = ${formatDecimals(stakingRate * 0.999, 5)} OADA`; // Unstaking includes 0.1% fee

  /**
   * Mint OADA handler
   * Converts ADA to OADA at 1:1 ratio
   */
  const handleMintOada = () => {
    console.log("Minting OADA");
    const adaAmount = Big(inputAmount).mul(1_000_000) // Convert to Lovelace
    if (adaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        buyOada({
          amount: BigInt(adaAmount.toString()),
        })
      );
    }
  };

  /**
   * Stake OADA handler
   * Converts OADA to sOADA based on current staking rate
   */
  const handleStakeOada = () => {
    console.log("Staking OADA");
    const oadaAmount = Big(inputAmount).mul(1_000_000) // Convert to smallest unit
    if (oadaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        stakeOada({
          amount: BigInt(oadaAmount.toString()),
        })
      );
    }
  };

  /**
   * Unstake sOADA handler
   * Converts sOADA back to OADA based on current staking rate
   */
  const handleUnstakeSoada = () => {
    console.log("Unstaking sOADA");
    const soadaAmount = Big(inputAmount).mul(1_000_000) // Convert to smallest unit
    if (soadaAmount.gt(0)) {
      setIsSpinnerModalOpen(true);
      dispatch(
        unstakeOada({
          amount: BigInt(soadaAmount.toString()),
        })
      )
    }
  };

  /**
   * Add to queue handler
   * Redirects to stake handler for adding to queue when vault is full
   */
  const handleAddToQueue = () => {
    handleStakeOada()
  };

  // Type definitions for stake order display
  type StakeOrderJob = 'stake' | 'unstake'
  type StakeOrderFormattedView = {
    job: StakeOrderJob,
    assetIn: CustomIconsType[],
    assetOut: CustomIconsType[],
    amountIn: string,
    amountOut: string,
    id: string
  }
  
  // Prepare user's pending stake/unstake orders for display
  const ownerOrderViews: StakeOrderFormattedView[] = []

  // Add stake orders (OADA → sOADA)
  oadaFrontendInfo?.ownerOadaStakeOrderViews.forEach(view => {
    ownerOrderViews.push({
      job: 'stake',
      assetIn: ['oada'],
      assetOut: ['soada'],
      amountIn: formatNumberWithSuffix(view.oadaAmount, 6),
      amountOut: formatNumberWithSuffix(view.oadaAmount / stakingRate, 6), // Calculate expected sOADA output
      id: view.txOutRef
    })
  })
  
  // Add unstake orders (sOADA → OADA)
  oadaFrontendInfo?.ownerOadaUnstakeOrderViews.forEach(view => {
    ownerOrderViews.push({
      job: 'unstake',
      assetIn: ['soada'],
      assetOut: ['oada'],
      amountIn: formatNumberWithSuffix(view.soadaAmount, 6),
      amountOut: formatNumberWithSuffix(view.soadaAmount * stakingRate, 6), // Calculate expected OADA output
      id: view.txOutRef
    })
  })

  // Get tab titles with appropriate formatting
  const tabTitles = getTabTitles("OADA");

  return (
    <div className="grid p-2 md:p-8 gap-6 justify-center">
      {/* Display dynamic tab title - stake tab shows APY */}
      {currentTab === "stake"
        ? tabTitles[currentTab](stakingApy)
        : tabTitles[currentTab]}
      
      {/* Main card with tabs for mint/stake/unstake */}
      <Card className="md:w-[560px]">
        <Tabs
          defaultValue="mint"
          value={currentTab}
        >
          {/* Tab navigation */}
          <TabsList className="w-full p-[3px]">
            {["mint", "stake", "unstake"].map(value =>
              <Link className="flex-1" to={`${pathname}#${value}`}>
                <TabsTrigger value={value} className="w-full capitalize">
                  {value}
                </TabsTrigger>
              </Link>
            )}
          </TabsList>

          {/* Mint OADA tab content */}
          <TabsContent value="mint" className="space-y-6">
            <CustomTitle title="Mint OADA" />
            {/* Input amount field with validation */}
            <TransactionInputAmount
              currency="ADA"
              icons={["ada"]}
              availableAmount={Math.max(0, walletAmountAsAda - 5)} // Reserve 5 ADA for fees
              setInputAmount={setInputAmount}
              inputAmount={inputAmount}
              setValidInput={setValidInput}
              currentTab={currentTab}
              minimum={minimumMint}
            />
            <Separator />
            {/* Transaction details showing conversion rate and fees */}
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={ada_oada_conversion_rate}
              txFee={`${Number(oadaMintFee) / 1000000} ADA`}
            />
            <Separator />
            {/* Action button - disabled until input is valid */}
            <Button size="lg" className="w-full" onClick={handleMintOada} disabled={!validInput}>
              Mint OADA
            </Button>
          </TabsContent>

          {/* Stake OADA tab content */}
          <TabsContent value="stake" className="space-y-6">
            <CustomTitle title="Stake OADA" />
            {/* Input amount field with validation */}
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
            {/* Display current deposits and staking capacity */}
            <CurrentDeposits
              currency="OADA"
              currentDeposits={currentDeposits}
              maxCapacity={maxCapacity}
              stakingQueue={stakingQueue}
            />
            {/* Transaction details showing conversion rate and fees */}
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={oada_soada_conversion_rate}
              expectedOutput={inputAmount && formatDecimals(parseFloat(inputAmount) / stakingRate, 2)}
              txFee={`${Number(oadaStakeFee) / 1000000} ADA`}
            />
            <Separator />
            {/* Conditionally show "Add to Queue" or "Stake" button based on vault capacity */}
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

          {/* Unstake sOADA tab content */}
          <TabsContent value="unstake" className="space-y-6">
            <CustomTitle title="Unstake OADA" />
            {/* Input amount field with validation */}
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
            {/* Transaction details showing conversion rate and fees */}
            <TransactionDetails
              currency="ada"
              currentTab={currentTab}
              conversionRate={soada_oada_conversion_rate}
              expectedOutput={inputAmount && formatDecimals(parseFloat(inputAmount) * stakingRate * 0.999, 2)} // 0.1% fee for unstaking
              txFee={`${Number(oadaStakeFee) / 1000000} ADA`}
            />
            <Separator />
            {/* Action button - disabled until input is valid */}
            <Button size="lg" className="w-full" onClick={handleUnstakeSoada} disabled={!validInput}>
              Unstake sOADA
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Pending stakes section - only shown if user has pending orders */}
      {ownerOrderViews.length > 0 && 
        <section className="py-8">
          <div className="grid w-full mx-auto gap-6">
            <Text className="px-4" size="large">Your pending stakes</Text>
            <div className="rounded-xl border border-ui-border-default p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-fit px-0 pb-4">
                      {/* Job type column (stake/unstake) */}
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
                  {/* Render each pending order */}
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
