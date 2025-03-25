/**
 * Transaction Details Component
 * 
 * This component displays detailed information about token transactions in the dApp,
 * providing transparency about conversion rates, fees, and expected outputs.
 * It adapts its display based on the current transaction type (mint, stake, unstake)
 * and provides contextual help via tooltips for each transaction metric.
 * 
 * Key features:
 * - Dynamic tooltips with transaction-specific explanations
 * - Consistent display of conversion rates and transaction fees
 * - Conditional information banners for stake/unstake operations
 * - Currency-specific content customization
 * 
 * This component works in conjunction with the tab system to provide
 * a cohesive transaction interface across different token operations.
 */

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

/**
 * TooltipGiven Component
 * 
 * A utility component that conditionally renders a tooltip with an info icon
 * when explanatory text is provided. Returns an empty fragment when no value is given.
 * 
 * @param value - Optional tooltip content text
 * @returns A tooltip component or empty fragment
 */
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

/**
 * TransactionDetails Component
 * 
 * Displays transaction details for token operations, including conversion rates,
 * transaction fees, and expected output information with explanatory tooltips.
 * 
 * @param props - Component properties
 * @param props.currency - The token currency code (e.g., "ADA", "BTC")
 * @param props.conversionRate - The conversion rate between input and output tokens
 * @param props.expectedOutput - Optional estimated output amount from the transaction
 * @param props.txFee - The transaction fee amount
 * @param props.currentTab - The current transaction type (mint, stake, unstake)
 * @returns A transaction details panel with contextual information
 */
export const TransactionDetails = (props: {
  currency?: CustomIconsType;
  conversionRate: string;
  expectedOutput?: string;
  txFee: string;
  currentTab: TABS;
}) => {
  const { conversionRate, txFee, currentTab, expectedOutput, currency } = props;
  const CURRENCY = currency?.toUpperCase()
  
  /**
   * Tooltip content mapping based on transaction type and currency
   * Provides contextual explanations for different transaction details
   * across various operation types
   */
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
  
  // Get the specific tooltips for the current transaction type
  const tooltips = currentTab && tooltipsMap[currentTab]
  
  return (
    <div className="grid gap-4">
      {/* Transaction details panel title */}
      <Text size="medium" className="font-medium">
        Transaction details
      </Text>
      
      {/* List of transaction metrics with tooltips */}
      <ul className="space-y-2">
        {/* Conversion rate row */}
        <li className="flex justify-between items-center">
          <Text tone="muted" className="flex items-center">
            Conversion rate
            <TooltipGiven value={tooltips?.conversionRate} />
          </Text>
          <Text className="text-ui-base-green">{conversionRate}</Text>
        </li>
        
        {/* Transaction fee row */}
        <li className="flex justify-between items-center">
          <Text tone="muted" className="flex items-center">
            Transaction Fee
            <TooltipGiven value={tooltips?.transactionFee} />
          </Text>
          <Text>{txFee}</Text>
        </li>
      </ul>

      {/* Conditional information banner for stake operations */}
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

      {/* Conditional information banner for unstake operations */}
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
