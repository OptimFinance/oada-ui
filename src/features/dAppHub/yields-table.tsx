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

export type YieldTableProps = {
  yieldOptions: YieldOption[];
};

export const YieldsTable = ({ yieldOptions }: YieldTableProps) => {
  return (
    <div className="rounded-xl border border-ui-border-default p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="h-fit px-0 pb-4 w-[284px]">
              Protocol
            </TableHead>
            <TableHead className="h-fit px-0 pb-4 w-[244px]" minBreakpoint="sm">
              Opportunity
            </TableHead>
            <TableHead className="h-fit px-0 pb-4 w-[244px]">APY</TableHead>
            <TableHead className="h-fit px-0 pb-4"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {yieldOptions.map((yieldOption) => (
            <TableRow>
              <TableCell className="px-0 py-2 pt-6">
                <div className="flex gap-2 items-center">
                  <CurrencyLogos
                    logos={yieldOption.currencyLogos as CustomIconsType[]}
                  />
                  {yieldOption.positionName}
                </div>
              </TableCell>
              <TableCell className="px-0 py-2 pt-6" minBreakpoint="sm">
                {yieldOption.opportunity}
              </TableCell>
              <TableCell className="px-0 py-2 pt-6">
                <Link to={yieldOption.button?.href ?? "#"} target={yieldOption.externalLink ? "_blank" : "_self"}>
                  {yieldOption.apy || "Available here"}
                </Link>
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
