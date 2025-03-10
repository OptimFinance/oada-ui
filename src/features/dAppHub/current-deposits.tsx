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

export const CurrentDeposits = (props: {
  currentDeposits: number;
  currency: string;
  maxCapacity: number;
  stakingQueue?: number;
}) => {
  const { currentDeposits, maxCapacity, stakingQueue, currency } = props;
  const progress = 
    Math.min(100, ((currentDeposits + (stakingQueue || 0)) / maxCapacity) * 100);

  return (
    <Card className="rounded-lg p-4 grid gap-2">
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
        <Text>
          {
            formatNumberWithSuffix(
              Math.min(currentDeposits + (stakingQueue || 0), maxCapacity),
              6
            )
          } s{currency}
        </Text>
      </div>
      <Progress value={progress} />
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
        <Text className="text-ui-base-green">
          {formatNumberWithSuffix(maxCapacity, 6)} s{currency}
        </Text>
      </div>

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
          <Text>{formatNumberWithSuffix(stakingQueue - (maxCapacity - currentDeposits), 6)} {currency}</Text>
        </div>
      )}
    </Card>
  );
};
