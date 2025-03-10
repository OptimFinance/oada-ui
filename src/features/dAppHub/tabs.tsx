import { FiInfo } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

export type TABS = "mint" | "stake" | "unstake";

const createTabTitle = (action: string, currency: string, apy?: string) => (
  <h1 className="text-ui-surface-default text-[32px] leading-10 font-normal text-center">
    {action}{" "}
    <span className="text-ui-base-primary">
      {currency} {apy && `| ${apy}`}
      {apy && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiInfo className="h-6 w-6 ml-1" />
            </TooltipTrigger>
            <TooltipContent>
              <p>The APY is calculated as the average total profit over the last 6 epochs (6 epoch SMA), taking the difference of staking rate at the beginning of the epoch from the exchage rate at the end of it.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  </h1>
);

export const getTabTitles = (currency: string) => ({
  mint: createTabTitle("Mint", currency),
  stake: (apy: string) => createTabTitle("Stake", currency, apy),
  unstake: createTabTitle("Unstake", "s" + currency),
});
