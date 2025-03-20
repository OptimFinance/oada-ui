/**
 * OptimizLock Component
 * 
 * This component provides functionality for managing OPTIMiz token locks:
 * 1. Lock: Lock OPTIMiz tokens together with OADA tokens for a fixed duration to earn yield
 * 2. Unlock: View existing locks and unlock them (either at maturity or early with penalties)
 * 
 * Key features:
 * - Duration selection (6, 9, or 12 months) with different OADA requirement ratios
 * - Input validation for OPTIMiz amounts
 * - Automatic calculation of required OADA based on selected duration
 * - Management interface for viewing and unlocking existing locks
 * - Early unlocking with penalty calculation
 * 
 * The component implements a token locking mechanism where users lock their OPTIMiz tokens 
 * along with OADA tokens for a fixed period to earn yield, with longer durations requiring
 * more OADA but offering better returns.
 */

import { FiInfo } from "react-icons/fi";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import {useEffect, useState} from "react";
import {Input} from "src/components/ui/input";
import { Text } from "src/components/ui/typography";
import {formatNumberWithSuffix} from "src/utils/formatNumbers";
import {Link, useLocation} from "react-router-dom";
import Big from "big.js";
import {Button} from "src/components/ui/button";
import {Separator} from "src/components/ui/separator";
import {
  selectWallet,
  selectWalletOadaletAmount,
  selectWalletOptimizAmount,
  updateWalletUtxosThunk
} from "src/store/slices/walletSlice";
import {useAppDispatch, useAppSelector, useInterval} from "src/store/hooks";
import {Attention} from "src/components/Attention";
import { OptimizLockView, getOptimizToOptimInfo, selectOptimizToOptimInfo, unlockOptimiz } from "src/oada/actions";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "src/components/ui/table";
import {Modal} from "src/components/Modal";

/**
 * LockType definition
 * 
 * Represents a lock duration option with its associated parameters:
 * - days: The number of days for the lock period
 * - ratio: The ratio of OADA tokens required per OPTIMiz token (higher ratio = more OADA needed)
 */
type LockType = {
  days: number,
  ratio: Big
}

/**
 * Available lock durations with their parameters
 * 
 * Each option specifies:
 * - Duration in days (approximate months)
 * - Ratio of OADA required per OPTIMiz token
 * 
 * Longer durations require more OADA tokens but typically offer better yields.
 * The ratio is used to calculate how much OADA is needed for a given OPTIMiz amount.
 */
export const lockTypes: { [key: string]: LockType } = {
  "6 Months": {
    days: 183,
    ratio: Big(7)  // 7 OADA per OPTIMiz
  },
  "9 Months": {
    days: 275,
    ratio: Big(9).div(2)  // 4.5 OADA per OPTIMiz
  },
  "12 Months": {
    days: 366,
    ratio: Big(3)  // 3 OADA per OPTIMiz
  }
}

/**
 * OptimizLock Component
 * 
 * This component allows users to lock OPTIMiz tokens together with OADA tokens
 * for a fixed duration to earn yield. The user selects a lock duration and
 * enters the amount of OPTIMiz to lock, and the component calculates how
 * much OADA is needed.
 * 
 * @returns React component for creating OPTIMiz locks
 */
export const OptimizLock = () => {
  // Get current location for creating links
  const location = useLocation()
  
  // Component state
  const [lockTime, setLockTime] = useState<keyof typeof lockTypes>("6 Months") // Selected lock duration
  const [lockAmount, setLockAmount] = useState("") // OPTIMiz amount to lock

  // Redux state and actions
  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)

  // Update wallet data when component mounts or wallet changes
  useEffect(() => {
    dispatch(updateWalletUtxosThunk(null))
  }, [wallet?.address, dispatch])

  // Get wallet balances (convert from smallest units to display units)
  const optimizInWallet = useAppSelector(selectWalletOptimizAmount).div(1_000_000)
  const oadaInWallet = useAppSelector(selectWalletOadaletAmount).div(1_000_000)

  // Calculate required OADA amount based on OPTIMiz amount and selected lock duration
  const oadaNeeded =
    !isNaN(parseFloat(lockAmount))
      ? Big(lockAmount).mul(lockTypes[lockTime].ratio).round(6, Big.roundUp)
      : Big(0)

  // Validate if user has enough OADA to create the lock
  const sufficientOada = oadaInWallet.gte(oadaNeeded)
  const validInput = sufficientOada

  return <>
    <div className="grid p-2 md:p-8 gap-6 justify-center grid gap-6">
      {/* Lock duration selection */}
      <Text size="medium" className="flex items-center">
        Lockup Duration
      </Text>
      <Tabs
        defaultValue="market"
        value={lockTime.toString()}
        onValueChange={(value: keyof typeof lockTypes) => {
          setLockTime(value)
        }}
      >
        <TabsList className="w-full p-1">
          {Object.keys(lockTypes).map((name) => {
              return <TabsTrigger className="flex-1" value={name}>
                {name}
              </TabsTrigger>
            })
          }
        </TabsList>
      </Tabs>
      
      {/* OPTIMiz input section */}
      <section>
        <div>
          <div className="flex flex-col gap-2">
            {/* OPTIMiz amount header with max button and external link */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
              <Text size="medium" className="flex items-center">
                Locked amount
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The amount of OPTIMiz you want to lock.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Text>
              <Text size="medium" tone="muted">
                <Link
                  to={`${location.pathname}${location.search}${location.hash}`}
                  onClick={() => setLockAmount(optimizInWallet.toString())}
                >
                  {formatNumberWithSuffix(+optimizInWallet, 0)}{" "}
                </Link>
                OPTIMiz
              </Text>
              <Link to="https://app.dexhunter.io/optimiz" target="_blank">
                [ Get OPTIMiz ]
              </Link>
            </div>

            {/* OPTIMiz amount input field with validation */}
            <div className="flex justify-end relative">
              <Input
                autoFocus={true}
                value={lockAmount.toString()}
                onChange={e => 
                  // Only allow numbers with up to 6 decimal places
                  e.target.value.match(/^-?[0-9]*(\.[0-9]{0,6})?$/) && setLockAmount(e.target.value)
                }
                onBlur={e => {
                  // Validate and constrain input on blur:
                  // - Not negative
                  // - Not more than wallet balance
                  const inputValue = Big(e.target.value)
                  const newValue =
                    inputValue.lt(Big(0))
                      ? Big(0)
                      : inputValue.gt(optimizInWallet)
                        ? optimizInWallet
                        : inputValue
                  setLockAmount(newValue.toString())
                }}
                className="rounded-lg border-none text-2xl w-full py-5 px-4"
              />
            </div>
            
            {/* OADA requirement display */}
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
              <Text size="medium" className="flex items-center">
                Need OADA
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The amount of to lock with your OPTIMiz.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Text>
              <Text size="medium" tone="muted">
                {formatNumberWithSuffix(+oadaInWallet, 0)}{" OADA"}
              </Text>
            </div>
            
            {/* Required OADA amount display with gradient styling */}
            <div className="w-full bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end rounded-lg p-[1px]">
              <div className="bg-[hsl(233,31%,11%)] rounded-lg">
                <Text className="py-3 px-4 text-3xl font-medium text-start bg-gradient-to-tr from-ui-brand-gradient-start to-ui-brand-gradient-end text-ui-base-transparent bg-clip-text">
                  {+oadaNeeded}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Separator />
      
      {/* Warning message if insufficient OADA */}
      {!sufficientOada && 
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          Your wallet does not contain enough OADA to create this lock.
        </Attention>
      }
      
      {/* Action button */}
      <section>
        <div>
          <Button
            size="lg"
            className="w-full"
            disabled={!validInput}
            >
            Create Lock
          </Button>
        </div>
      </section>
    </div>
  </>
}

/**
 * OptimizUnlock Component
 * 
 * This component allows users to view and manage their existing OPTIMiz locks.
 * Users can see their locked amounts, remaining time, and unlock their positions.
 * Early unlocking (before maturity) requires confirmation and incurs penalties.
 * 
 * @returns React component for managing existing OPTIMiz locks
 */
export const OptimizUnlock = () => {
  // Redux state and actions
  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)
  
  // Track which lock the user is confirming to unlock early (if any)
  const [confirming, setConfirming] = useState<OptimizLockView | null>(null)

  // Poll for lock information every 6 seconds
  useInterval("optimizLockInfo", () => {
    dispatch(getOptimizToOptimInfo())
  }, 6000, [wallet?.address])

  // Time constants for calculating remaining time
  const oneMinute = 1000 * 60
  const oneHour = oneMinute * 60
  const oneDay = oneHour * 24
  
  // Get user's lock data from Redux store
  const ownerLockViews: OptimizLockView[] | undefined = useAppSelector(selectOptimizToOptimInfo)?.ownerOptimizLockViews
  
  return <>
    <section className="py-8 grid w-full mx-auto gap-6">
      <Text className="px-4" size="large">Your locks</Text>
      
      {/* Information notice about lock processing */}
      <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
        Once closed (and you may hold until maturity) create a ticket in our discord so we may process it with the new $O token
      </Attention>
      
      {/* Locks table */}
      <div className="rounded-xl border border-ui-border-default p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-fit px-0 pb-4">
                OPTIMiz
              </TableHead>
              <TableHead className="h-fit px-0 pb-4" minBreakpoint="sm">
                OADA
              </TableHead>
              <TableHead className="h-fit px-0 pb-4">
                Remaining
              </TableHead>
              <TableHead className="h-fit px-0 pb-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Render each lock with calculated time remaining */}
            {ownerLockViews && ownerLockViews.map((orderView) => {
              // Calculate time metrics
              const timeCompleted = Date.now() - orderView.startPosixTime
              const timeRemaining =
                orderView.maxLockupDays * oneDay - timeCompleted
              
              // Format the remaining time for display
              const completesIn =
                timeRemaining < oneDay
                  ? timeRemaining < oneHour
                    ? timeRemaining <= 0
                      ? 'Ready'  // Lock is mature
                      : '< 1 hour'  // Less than an hour left
                    : `${Math.round(timeRemaining / oneHour)} hours`  // Display hours
                  : `${Math.ceil(timeRemaining / oneDay)} days`  // Display days
              
              // Calculate time metrics for new locks that can't be cancelled yet
              const canCancelHours = Math.round(-timeCompleted / oneHour)
              const canCancelMinutes = Math.round(-timeCompleted / oneMinute)
              
              return <TableRow>
                <TableCell className="px-0 py-2 pt-6">
                  <Text size="large" className="p-2 inline-block">
                  {formatNumberWithSuffix(orderView.optimizAmount, 6)}
                  </Text>
                </TableCell>
                <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                  <Text size="large" className="p-2 inline-block">
                  {formatNumberWithSuffix(orderView.oadaAmount, 6)}
                  </Text>
                </TableCell>
                <TableCell className="px-0 py-2 pt-6">
                  <div className="flex gap-2 items-center capitalize">
                    {completesIn}
                  </div>
                </TableCell>
                <TableCell className="px-0 py-2 pt-6 text-right">
                  {/* Unlock button with different behavior based on maturity */}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-sm capitalize"
                    disabled={timeCompleted < 0}  // Disable if lock is too new
                    onClick={() => 
                      timeRemaining > 0 
                        ? setConfirming(orderView)  // Confirm early unlock (with penalty)
                        : dispatch(unlockOptimiz({ optimizLockId: orderView.txOutRef }))  // Immediate unlock (mature)
                    }
                  >
                    Unlock
                  </Button>
                  {/* Show tooltip with wait time for very new locks */}
                  { timeCompleted < 0 &&
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <FiInfo className="h-4 w-4 ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You can cancel this lock in approximately
                            {canCancelHours > 0
                              ? ` ${canCancelHours} hours`
                              : ` ${canCancelMinutes} minutes`
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  }
                </TableCell>
              </TableRow>
             })
            }
          </TableBody>
        </Table>
      </div>
      
      {/* Confirmation modal for early unlocking with penalty calculation */}
      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
      >
        <Text size="large" className="px-1.5 py-3">Confirm Unlock</Text>
        <section>
          <Attention alert className="px-1.5 py-2 text-xs items-center rounded-lg">
            This will cancel the lock early and forfeit {
              confirming && (() => {
                // Calculate penalty based on time elapsed and forfeit ratio
                const complete = Big(Date.now() - confirming.startPosixTime).div(confirming.maxLockupDays * oneDay)
                const forfeitRatio = Big(confirming.earlyForfeitRatio[0]).div(confirming.earlyForfeitRatio[1])
                const expected =
                  Big(1)
                    .sub(complete)  // Remaining time proportion
                    .add(forfeitRatio.mul(complete))  // Add penalty based on elapsed time
                    .mul(confirming.optimizAmount)  // Apply to locked amount
                    .round(0, Big.roundUp)  // Round up

                return expected.div(1_000_000).round(2).toString()  // Convert to display units
              })()
            } OPTIM along with all locked OPTIMiz. Locked OADA will be returned to your wallet.
          </Attention>
          {/* Confirmation buttons */}
          <div className="flex flex-row place-content-evenly w-full p-6">
            <Button
              size="sm"
              variant="secondary"
              className="text-sm capitalize"
              onClick={() => setConfirming(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="text-sm capitalize hover:bg-ui-error-light bg-ui-error-default"
              onClick={() =>
                dispatch(unlockOptimiz({ optimizLockId: confirming!.txOutRef })).finally(() => setConfirming(null))
              }
            >
              Confirm
            </Button>
          </div>
        </section>
      </Modal>
    </section>
  </>
}
