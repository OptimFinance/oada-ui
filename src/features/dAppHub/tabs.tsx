/**
 * Tab Navigation Utilities
 * 
 * This file provides utilities for creating consistent tab titles and navigation
 * in the token transaction interfaces (mint, stake, unstake). It handles:
 * 
 * - Tab type definition for type safety
 * - Standardized title formatting for different transaction types
 * - Conditional APY display with tooltip for staking tabs
 * - Currency-specific naming conventions (adding "s" prefix for staked tokens)
 * 
 * The utilities ensure a consistent UI across different token transaction interfaces
 * while allowing for token-specific customization and transaction-specific information.
 */

import { FiInfo } from "react-icons/fi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "src/components/ui/tooltip";

/**
 * TABS Type
 * 
 * Defines the available transaction tab types in the token interfaces.
 * - "mint": For converting from the base currency to the token
 * - "stake": For staking tokens to earn yield
 * - "unstake": For unstaking tokens back to their unstaked form
 */
export type TABS = "mint" | "stake" | "unstake";

/**
 * Create Tab Title
 * 
 * Factory function that creates standardized tab title components with consistent styling.
 * 
 * @param action - The action verb for the tab (e.g., "Mint", "Stake", "Unstake")
 * @param currency - The currency code (e.g., "OADA")
 * @param apy - Optional APY value to display for stake tabs
 * @returns A React component with formatted tab title and optional tooltip
 */
const createTabTitle = (action: string, currency: string, apy?: string) => (
  <h1 className="text-ui-surface-default text-[32px] leading-10 font-normal text-center">
    {action}{" "}
    <span className="text-ui-base-primary">
      {currency} {apy && `| ${apy}`}
      {/* APY tooltip - only displayed when APY is provided (stake tabs) */}
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

/**
 * Get Tab Titles
 * 
 * Factory function that creates a set of tab titles specific to a currency.
 * 
 * @param currency - The base currency code (e.g., "OADA")
 * @returns An object with title components for each tab type:
 *   - mint: Static component for the mint tab
 *   - stake: Function that takes an APY and returns a component with APY display
 *   - unstake: Static component for the unstake tab (prefixes currency with "s")
 */
export const getTabTitles = (currency: string) => ({
  mint: createTabTitle("Mint", currency),
  stake: (apy: string) => createTabTitle("Stake", currency, apy),
  unstake: createTabTitle("Unstake", "s" + currency), // "s" prefix indicates staked version of token
});
