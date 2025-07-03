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
import {formatNumberWithSuffix, formatPercent} from "src/utils/formatNumbers";
import {Link, useLocation, useNavigate} from "react-router-dom";
import Big from "big.js";
import {Button} from "src/components/ui/button";
import {Separator} from "src/components/ui/separator";
import {
  selectWallet,
  selectWalletSoadaletAmount,
  updateWalletUtxosThunk
} from "src/store/slices/walletSlice";
import {lucid, useAppDispatch, useAppSelector, useInterval} from "src/store/hooks";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "src/components/ui/table";
import {YieldDonationSystem, YieldDonationView, initYieldDonation} from "src/oada/yield-donation";
import {getAddressDetails} from "lucid-cardano";
import {Slider} from "src/components/Slider";
import {Card} from "src/components/ui/card";
import {config} from "src/mainnet/oada-config";
import unhcrLogo from "src/assets/images/unhcr.png";

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

export const DonateCreate = ({
  donationSystem,
  updateOwnerDonations,
}: {
  donationSystem: YieldDonationSystem | null,
  updateOwnerDonations: () => void
}) => {
  const location = useLocation()
  const [lockAmount, setLockAmount] = useState('100')
  const [donateRatio, setDonateRatio] = useState(30)

  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)

  useEffect(() => {
    dispatch(updateWalletUtxosThunk(null))
  }, [wallet?.address])

  const sotokenInWallet = useAppSelector(selectWalletSoadaletAmount).div(1_000_000)

  const validInput = true

  const handleCreateLock = async () => {
    const tx = await donationSystem?.createYieldDonation(BigInt(Number(lockAmount) * 1_000_000), [BigInt(donateRatio), 100n])
    await tx?.complete().then(tx => tx.sign().complete()).then(tx => tx.submit())
    updateOwnerDonations()
  }

  return <>
    <div className="grid p-2 md:p-8 gap-6 justify-center grid gap-6">
      <section>
        <div>
          <div className="flex flex-col gap-2">
            <Text size="large">Donate OADA yield to the UNHCR</Text>
            <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
              <Text size="medium" className="flex items-center">
                Locked amount
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The amount of sOADA you want to lock.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Text>
              <Text size="medium" tone="muted">
                <Link
                  to={`${location.pathname}${location.search}${location.hash}`}
                  onClick={() => setLockAmount(sotokenInWallet.toString())}
                >
                  {formatNumberWithSuffix(+sotokenInWallet, 0)}{" "}
                </Link>
                sOADA
              </Text>
            </div>

            <div className="flex justify-end relative">
              <Input
                autoFocus={true}
                value={lockAmount.toString()}
                onChange={e => 
                  e.target.value.match(/^\-?[0-9]*(\.[0-9]{0,6})?$/) && setLockAmount(e.target.value)
                }
                onBlur={e => {
                  const inputValue = Big(e.target.value)
                  const newValue =
                    inputValue.lt(Big(0))
                      ? Big(0)
                      : inputValue.gt(sotokenInWallet)
                        ? sotokenInWallet
                        : inputValue
                  setLockAmount(newValue.toString())
                }}
                className="rounded-lg border-none text-2xl w-full py-5 px-4"
              />
            </div>
            <div>
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center">
                <Text size="medium" className="flex items-center">
                  Donation ratio
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The portion of sOADA yield you want to donate</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Text>
                <Text size="medium" tone="muted">
                  {Number(donateRatio)} %
                </Text>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                onChange={(value) => {
                  setDonateRatio(value)
                }}
                value={Number(donateRatio)}
              />
            </div>
          </div>
        </div>
      </section>
      <Separator />
      <section>
        <div className="flex flex-row mb-4">
          <p className="align-middle">
            <img src={unhcrLogo} className="max-w-[96px] rounded-md m-2" />
          </p>
          <p className="p-2 align-middle">
            Your contribution will be calculated as a portion of your
            accrued yield from the time you create the lock until you
            commit your donation.
          </p>
        </div>
        <div>
          <Button
            size="lg"
            className="w-full"
            disabled={!validInput}
            onClick={handleCreateLock}
            >
            Create Lock
          </Button>
        </div>
      </section>
    </div>
  </>
}

export const DonateCommit = ({
  donationSystem,
  ownerDonationViews,
  updateOwnerDonations
}: {
  donationSystem: YieldDonationSystem | null,
  ownerDonationViews: YieldDonationView[] | null,
  updateOwnerDonations: () => void
}) => {
  const handleCommitLock = async (orderView: YieldDonationView) => {
    const tx = await donationSystem?.commitYieldDonation(orderView)
    await tx?.complete().then(tx => tx.sign().complete()).then(tx => tx.submit())
    updateOwnerDonations()
  }

  return ownerDonationViews && ownerDonationViews.length > 0
      ? <>
        <section className="py-8 grid w-full mx-auto gap-6">
          <Text className="px-4" size="large">Your locks</Text>
          <div className="rounded-xl border border-ui-border-default p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="h-fit px-4 pb-4">
                    sOADA Amount
                  </TableHead>
                  <TableHead className="h-fit px-4 pb-4" minBreakpoint="sm">
                    Donation
                  </TableHead>
                  <TableHead className="h-fit px-4 pb-4" minBreakpoint="sm">
                    Accrued donation
                  </TableHead>
                  <TableHead className="h-fit px-4 pb-4"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerDonationViews && ownerDonationViews.map((donationView) => {
                  const amounts = donationSystem?.donationAmounts(donationView)
                  return <TableRow>
                    <TableCell className="px-0 py-2 pt-6">
                      <Text size="large" className="p-2 inline-block">
                      {formatNumberWithSuffix(Number(donationView.amount), 6)}
                      </Text>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                      <Text size="large" className="p-2 inline-block">
                      {formatPercent(Number(donationView.donationRatio[0]) / Number(donationView.donationRatio[1]))}
                      </Text>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                      <Text size="large" className="p-2 inline-block">
                      {formatNumberWithSuffix(Number(amounts?.baseDonation), 6)} ADA
                      </Text>
                    </TableCell>
                    <TableCell className="px-0 py-2 pt-6 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-sm capitalize"
                        disabled={false}
                        onClick={() => handleCommitLock(donationView) }
                      >
                        Unlock
                      </Button>
                    </TableCell>
                  </TableRow>
                 })
                }
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-row px-2 md:px-8">
            <p className="align-middle">
              <img src={unhcrLogo} className="max-w-[96px] rounded-md m-2" />
            </p>
            <p className="p-2 align-middle">
              Commit your donation and receive an NFT recording the amount and
              date of your donation on the blockchain.
            </p>
          </div>
        </section>
      </>
    : <>
      <Text size="large" className="px-1.5 py-8 text-center">
        {ownerDonationViews === null ? "Loading..." : "You have no donation locks available"}
      </Text>
    </>
}

export const YieldDonation = () => {
  const navigate = useNavigate()
  const {hash} = useLocation()
  const [donationSystem, setDonationSystem] = useState<YieldDonationSystem | null>(null)
  const [ownerDonationViews, setOwnerDonationViews] = useState<YieldDonationView[] | null>(null)

  const wallet = useAppSelector(selectWallet)
  useEffect(() => {
    if (!hash)
      navigate('#create')

    if (!wallet?.address)
      return

    const addressDetails = getAddressDetails(wallet.address)

    if (addressDetails.paymentCredential?.type !== 'Key')
      return

    initYieldDonation({
      lucid,
      params: {
        donationTargetKeyHash: addressDetails.paymentCredential.hash,
        sotokenScriptHash: config.soadaPolicyId,
        stakingAmoScriptHash: '4fa34a7b4d48767f87f41fc6494b16cfdb4aaf497a694ec571c16cb4',
        stakingAmoTokenName: '59d757246d9f41d74338f195e8f1b3f44321347b3d0924494c0f6744b57546b6',
        batchStakeScriptHash: '903d444cc678f9a5993e6f260325e63d193e9d976a6c389e95c9c08e',
        referenceLockScriptHash: '00000000000000000000000000000000000000000000000000000000',
      }
    }).then(setDonationSystem)
  }, [wallet?.address])

  const updateOwnerDonations = () => {
    donationSystem?.getOwnerDonations().then(setOwnerDonationViews)
  }

  useInterval('ownerDonationViews', async () => {
    updateOwnerDonations()
  }, 30000, [wallet?.address, donationSystem])

  return <>
    <div className="grid p-2 md:p-8 gap-6 justify-center">
      <Card className="md:w-[560px]">
        <div>
          <Tabs
            defaultValue="market"
            value={hash}
            onValueChange={(value: string) => { navigate(value) }}
          >
            <TabsList className="align-center p-1 w-full">
              <TabsTrigger className="flex-1" value="#create">Create</TabsTrigger>
              <TabsTrigger className="flex-1" value="#commit">Commit</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {hash === '#create'
          ? <DonateCreate
              donationSystem={donationSystem}
              updateOwnerDonations={updateOwnerDonations}
            />
          : hash === '#commit'
            ? <DonateCommit
                donationSystem={donationSystem}
                ownerDonationViews={ownerDonationViews}
                updateOwnerDonations={updateOwnerDonations}
              />
            : <></>
        }
      </Card>
    </div>
  </>
}
