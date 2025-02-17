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

type LockType = {
  days: number,
  ratio: Big
}

export const lockTypes: { [key: string]: LockType } = {
  "6 Months": {
    days: 183,
    ratio: Big(7)
  },
  "9 Months": {
    days: 275,
    ratio: Big(9).div(2)
  },
  "12 Months": {
    days: 366,
    ratio: Big(3)
  }
}

export const OptimizLock = () => {
  const location = useLocation()
  const [lockTime, setLockTime] = useState<keyof typeof lockTypes>("6 Months")
  const [lockAmount, setLockAmount] = useState("")

  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)

  useEffect(() => {
    dispatch(updateWalletUtxosThunk(null))
  }, [wallet?.address, dispatch])

  const optimizInWallet = useAppSelector(selectWalletOptimizAmount).div(1_000_000)
  const oadaInWallet = useAppSelector(selectWalletOadaletAmount).div(1_000_000)

  const oadaNeeded =
    !isNaN(parseFloat(lockAmount))
      ? Big(lockAmount).mul(lockTypes[lockTime].ratio).round(6, Big.roundUp)
      : Big(0)

  const sufficientOada = oadaInWallet.gte(oadaNeeded)
  const validInput = sufficientOada

  return <>
    <div className="grid p-2 md:p-8 gap-6 justify-center grid gap-6">
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
      <section>
        <div>
          <div className="flex flex-col gap-2">
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

            <div className="flex justify-end relative">
              <Input
                autoFocus={true}
                value={lockAmount.toString()}
                onChange={e => 
                  e.target.value.match(/^-?[0-9]*(\.[0-9]{0,6})?$/) && setLockAmount(e.target.value)
                }
                onBlur={e => {
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
      {!sufficientOada && 
        <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
          Your wallet does not contain enough OADA to create this lock.
        </Attention>
      }
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

export const OptimizUnlock = () => {
  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)
  const [confirming, setConfirming] = useState<OptimizLockView | null>(null)

  useInterval("optimizLockInfo", () => {
    dispatch(getOptimizToOptimInfo())
  }, 6000, [wallet?.address])

  const oneMinute = 1000 * 60
  const oneHour = oneMinute * 60
  const oneDay = oneHour * 24
  const ownerLockViews: OptimizLockView[] | undefined = useAppSelector(selectOptimizToOptimInfo)?.ownerOptimizLockViews
  return <>
    <section className="py-8 grid w-full mx-auto gap-6">
      <Text className="px-4" size="large">Your locks</Text>
      <Attention className="px-1.5 py-2 text-xs items-center rounded-lg">
        Once closed (and you may hold until maturity) create a ticket in our discord so we may process it with the new $O token
      </Attention>
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
            {ownerLockViews && ownerLockViews.map((orderView) => {
              const timeCompleted = Date.now() - orderView.startPosixTime
              const timeRemaining =
                orderView.maxLockupDays * oneDay - timeCompleted
              const completesIn =
                timeRemaining < oneDay
                  ? timeRemaining < oneHour
                    ? timeRemaining <= 0
                      ? 'Ready'
                      : '< 1 hour'
                    : `${Math.round(timeRemaining / oneHour)} hours`
                  : `${Math.ceil(timeRemaining / oneDay)} days`

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
                  <Button
                    size="sm"
                    variant="secondary"
                    className="text-sm capitalize"
                    disabled={timeCompleted < 0}
                    onClick={() => 
                      timeRemaining > 0 
                        ? setConfirming(orderView)
                        : dispatch(unlockOptimiz({ optimizLockId: orderView.txOutRef }))
                    }
                  >
                    Unlock
                  </Button>
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
      <Modal
        open={confirming !== null}
        onClose={() => setConfirming(null)}
      >
        <Text size="large" className="px-1.5 py-3">Confirm Unlock</Text>
        <section>
          <Attention alert className="px-1.5 py-2 text-xs items-center rounded-lg">
            This will cancel the lock early and forfeit {
              confirming && (() => {
                const complete = Big(Date.now() - confirming.startPosixTime).div(confirming.maxLockupDays * oneDay)
                const forfeitRatio = Big(confirming.earlyForfeitRatio[0]).div(confirming.earlyForfeitRatio[1])
                const expected =
                  Big(1)
                    .sub(complete)
                    .add(forfeitRatio.mul(complete))
                    .mul(confirming.optimizAmount)
                    .round(0, Big.roundUp)

                return expected.div(1_000_000).round(2).toString()
              })()
            } OPTIM along with all locked OPTIMiz. Locked OADA will be returned to your wallet.
          </Attention>
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
