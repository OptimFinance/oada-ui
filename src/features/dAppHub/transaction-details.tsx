import { Text } from "src/components/ui/typography";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { FiInfo } from "react-icons/fi";
import { CustomIcon, CustomIconsType } from "src/components/ui/custom-icon";
import { Attention } from "src/components/Attention";
import { TABS } from "./tabs";

const TooltipGiven = ({value}: { value?: string }) =>
  value
    ? <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FiInfo className="h-4 w-4 ml-1" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    : <></>

export const TransactionDetails = (props: {
  currency?: CustomIconsType;
  conversionRate: string;
  expectedOutput?: string;
  txFee: string;
  currentTab: TABS;
}) => {
  const { conversionRate, txFee, currentTab, expectedOutput, currency } = props;
  const CURRENCY = currency?.toUpperCase()
  const tooltipsMap: { [currency in TABS]?: {
    conversionRate?: string
    transactionFee?: string
  } } = {
    'mint': {
      conversionRate: `The amount of O${CURRENCY} minted per ${CURRENCY} sent to the Deposit AMO`,
      transactionFee: `Static system fee for minting ${CURRENCY}`
    },
    'stake': {
      conversionRate: `The amount of sO${CURRENCY} minted per O${CURRENCY} sent to the Staking AMO`,
      transactionFee: `Static transaction fee for staking O${CURRENCY}`
    },
    'unstake': {
      conversionRate: `The amount of O${CURRENCY} minted per sO${CURRENCY} sent to the Staking AMO`,
      transactionFee: `Static transaction fee for unstaking O${CURRENCY}`
    },
  }
  const tooltips = currentTab && tooltipsMap[currentTab]
  return (
    <div className="grid gap-4">
      <Text size="medium" className="font-medium">
        Transaction details
      </Text>
      <ul className="space-y-2">
        <li className="flex justify-between items-center">
          <Text tone="muted" className="flex items-center">
            Conversion rate
            <TooltipGiven value={tooltips?.conversionRate} />
          </Text>
          <Text className="text-ui-base-green">{conversionRate}</Text>
        </li>
        <li className="flex justify-between items-center">
          <Text tone="muted" className="flex items-center">
            Transaction Fee
            <TooltipGiven value={tooltips?.transactionFee} />
          </Text>
          <Text>{txFee}</Text>
        </li>
      </ul>

      {currentTab === "stake" && (
        <Attention
          info
          icon={
            currency && (
              <CustomIcon
                icon={`sO${CURRENCY}` as CustomIconsType}
                className="h-6 w-6"
              />
            )
          }
          className="px-1.5 py-2 text-xs items-center"
        >
          After staking O{CURRENCY} you&#39;ll receive {expectedOutput && ("approximately " + expectedOutput)} sO{CURRENCY}
        </Attention>
      )}

      {currentTab === "unstake" && (
        <Attention
          info
          icon={currency && <CustomIcon icon={currency} className="h-6 w-6" />}
          className="px-1.5 py-2 text-xs items-center"
        >
          After unstaking sO{CURRENCY} you&#39;ll receive {expectedOutput && ("approximately " + expectedOutput)} O{CURRENCY}
        </Attention>
      )}
    </div>
  );
};
