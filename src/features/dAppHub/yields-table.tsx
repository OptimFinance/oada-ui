/**
 * Yields Table Component
 * 
 * This component displays a structured table of yield opportunities across different
 * protocols and investment options. It presents key information including:
 * - Protocol name with currency logos
 * - Opportunity description
 * - Current APY (Annual Percentage Yield)
 * - Action buttons for direct interaction
 * 
 * Key features:
 * - Consistent presentation of yield opportunities
 * - Tooltips for additional context on APY calculations
 * - Support for both internal and external links
 * - Visual indication of token/protocol through currency logos
 * - Responsive design with column hiding on smaller screens
 * 
 * Used in dashboards to help users discover and compare yield-generating
 * opportunities across the platform.
 */

import {ReactJSXElement} from "@emotion/react/types/jsx-namespace";
import {FiInfo} from "react-icons/fi";
import {Link} from "react-router-dom";
import { CurrencyLogos } from "src/components/CurrencyLogos";
import { Button } from "src/components/ui/button";
import { CustomIconsType } from "src/components/ui/custom-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "src/components/ui/table";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "src/components/ui/tooltip";

/**
 * YieldOption Type
 * 
 * Defines the data structure for each yield opportunity displayed in the table
 * 
 * @property positionName - Display name for the protocol or position (e.g., "OADA-ADA LP")
 * @property opportunity - Description of the yield opportunity (e.g., "Liquidity Provision")
 * @property apy - Optional APY value as a formatted string (e.g., "5.2%")
 * @property externalLink - Whether clicking the opportunity opens an external site
 * @property currencyLogos - Array of currency/token icons to display
 * @property button - Configuration for the action button
 * @property button.label - Text for the button (defaults to "Stake" if not provided)
 * @property button.href - Link destination for the button
 * @property tooltip - Optional explanatory content for the APY calculation
 */
export type YieldOption = {
  positionName: string;
  opportunity: string;
  apy?: string;
  externalLink?: boolean;
  currencyLogos: string[];
  button?: {
    label?: string
    href?: string
  };
  tooltip?: ReactJSXElement
};

/**
 * YieldTableProps Type
 * 
 * @property yieldOptions - Array of yield opportunities to display in the table
 */
export type YieldTableProps = {
  yieldOptions: YieldOption[];
};

/**
 * Yields Table Component
 * 
 * Displays a table of yield opportunities with protocol information,
 * opportunity descriptions, APY values, and action buttons.
 * 
 * @param yieldOptions - Array of yield opportunity objects to display
 * @returns A styled table component with yield opportunities
 */
export const YieldsTable = ({ yieldOptions }: YieldTableProps) => {
  return (
    <div className="rounded-xl border border-ui-border-default p-6">
      <Table>
        {/* Table header with column titles */}
        <TableHeader>
          <TableRow>
            <TableHead className="h-fit px-0 pb-4 w-[284px]">
              Protocol
            </TableHead>
            {/* This column hides on mobile screens */}
            <TableHead className="h-fit px-0 pb-4 w-[244px]" minBreakpoint="sm">
              Opportunity
            </TableHead>
            <TableHead className="h-fit px-0 pb-4 w-[244px]">APY</TableHead>
            <TableHead className="h-fit px-0 pb-4"></TableHead>
          </TableRow>
        </TableHeader>
        
        {/* Table body with mapped yield options */}
        <TableBody>
          {yieldOptions.map((yieldOption, index) => (
            <TableRow key={`yield-option-${index}`}>
              {/* Protocol column with token logos and name */}
              <TableCell className="px-0 py-2 pt-6">
                <div className="flex gap-2 items-center">
                  <CurrencyLogos
                    logos={yieldOption.currencyLogos as CustomIconsType[]}
                  />
                  {yieldOption.positionName}
                </div>
              </TableCell>
              
              {/* Opportunity description column (hides on mobile) */}
              <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                {yieldOption.opportunity}
              </TableCell>
              
              {/* APY column with optional tooltip */}
              <TableCell className="px-0 py-2 pt-6">
                <Link to={yieldOption.button?.href ?? "#"} target={yieldOption.externalLink ? "_blank" : "_self"}>
                  {yieldOption.apy || "Available here"}
                </Link>
                {/* Tooltip with APY explanation if provided */}
                {yieldOption.tooltip &&
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <FiInfo className="h-4 w-4 text-ui-surface-sub ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{yieldOption.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                }
              </TableCell>
              
              {/* Action button column */}
              <TableCell className="px-0 py-2 pt-6 text-right">
                <Link to={yieldOption.button?.href ?? "#"} target={yieldOption.externalLink ? "_blank" : "_self"}>
                  <Button
                    size="sm"
                    variant="white"
                    className="w-24 text-sm"
                  >
                    {yieldOption.button?.label ?? "Stake"}
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
