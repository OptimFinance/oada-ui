/**
 * CurrentDeposits Component
 * 
 * This component displays information about staking pool capacity and usage:
 * - Current staking deposits
 * - Maximum pool capacity
 * - Visual progress bar showing pool utilization
 * - Optional staking queue information when the pool is at capacity
 * 
 * Used in staking interfaces to help users understand the current state of the staking pool,
 * including available capacity and whether their stake might be queued due to the pool being full.
 * 
 * The component adapts to different token types through the currency prop and shows appropriate
 * tooltips explaining each metric to help new users understand the staking system.
 */

import { FiInfo } from "react-icons/fi";
import { Card } from "src/components/ui/card";
import { Progress } from "src/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";

/**
 * CurrentDeposits Component
 * 
 * @param props - Component properties
 * @param props.currentDeposits - Current amount deposited in the staking pool
 * @param props.currency - Token currency code (e.g., "OADA") - will be prefixed with "s" for staked version
 * @param props.maxCapacity - Maximum capacity of the staking pool
 * @param props.stakingQueue - Optional amount in the staking queue waiting to be staked
 * @returns A card component displaying staking pool metrics and utilization
 */
export const CurrentDeposits = (props: {
  currentDeposits: number;
  currency: string;
  maxCapacity: number;
  stakingQueue?: number;
}) => {
  const { currentDeposits, maxCapacity, stakingQueue, currency } = props;
  
  // Calculate progress percentage (cap at 100%)
  // Includes both current deposits and any queued stakes in the calculation
  const progress = 
    Math.min(100, ((currentDeposits + (stakingQueue || 0)) / maxCapacity) * 100);

  return (
    <Card className="rounded-lg p-4 grid gap-2">
      {/* Current Deposits Section */}
      <div className="flex flex-col xs:flex-row justify-between items-center">
        <Text tone="muted" className="flex items-center">
          Current Deposits
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <FiInfo className="h-4 w-4 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The total OADA currently staked under sOADA</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Text>
        {/* Display current deposits + any queued amount (capped at max capacity) */}
        <Text>
          {
            formatNumberWithSuffix(
              Math.min(currentDeposits + (stakingQueue || 0), maxCapacity),
              6
            )
          } s{currency}
        </Text>
      </div>
      
      {/* Visual progress bar showing pool utilization */}
      <Progress value={progress} />
      
      {/* Max Capacity Section */}
      <div className="flex flex-col xs:flex-row justify-between items-center">
        <Text tone="muted" className="flex items-center">
          Max Capacity
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <FiInfo className="h-4 w-4 ml-1" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The maximum amount of OADA beyond which no more deposits are accepted. Number may be exceeded due to interest being accumulated.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Text>
        {/* Display max capacity with green color to indicate limit */}
        <Text className="text-ui-base-green">
          {formatNumberWithSuffix(maxCapacity, 6)} s{currency}
        </Text>
      </div>

      {/* Staking Queue Section - Only shown when pool is at capacity and queue exists */}
      {progress >= 100 && stakingQueue && (
        <div className="flex flex-col xs:flex-row justify-between items-center">
          <Text tone="muted" className="flex items-center">
            Staking Queue
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FiInfo className="h-4 w-4 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>If submitting the stake order at capacity, it will be added to a FIFO waiting list. Shown here, its full depth.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Text>
          {/* Calculate and display the effective queue depth (total queue minus remaining capacity) */}
          <Text>{formatNumberWithSuffix(stakingQueue - (maxCapacity - currentDeposits), 6)} {currency}</Text>
        </div>
      )}
    </Card>
  );
};
