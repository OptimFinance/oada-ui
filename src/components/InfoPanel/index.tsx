/**
 * InfoPanel Component
 * 
 * A premium display panel that presents structured information about a bond or investment product.
 * Features include:
 * - Diamond icon header with title
 * - Duration and cost display
 * - Structured details list with name-value pairs
 * - Support for tooltips on detail items
 * - Responsive layout
 */

import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { chunk } from "../../utils";
import { UITypes } from "../../types";
import { Info } from "../Info";
import { CustomIcon } from "../ui/custom-icon";
import { Text } from "../ui/typography";
export { infoPanelMock } from "./mock";

/**
 * Props for the InfoPanel component
 * 
 * @property details - Array of detail objects containing name-value pairs and optional tooltips
 * @property duration - Text describing the duration of the bond/investment
 * @property cost - Text describing the cost or value of the bond/investment
 * @property header - Optional custom header content to override the default
 */
interface Props {
  details: UITypes.Card.Detail[];
  duration: string;
  cost: string;
  header?: ReactNode;
}

/**
 * InfoPanel Component
 * 
 * Renders a premium panel displaying bond/investment information with structured details.
 * Uses Tailwind CSS for styling instead of the SCSS module approach seen in other components.
 * 
 * Note: This component appears to be a newer implementation using Tailwind,
 * while the corresponding SCSS module (.bondCardWrapper, etc.) might be for an older version.
 * 
 * @example
 * // Basic usage
 * <InfoPanel 
 *   details={[
 *     { name: "Term", value: "12 months" },
 *     { name: "Interest Rate", value: "5.5%", tooltip: "Annual percentage rate" }
 *   ]}
 *   duration="12 Month Bond"
 *   cost="$1,000 USD"
 * />
 */
export const InfoPanel = ({ details, duration, cost, header }: Props) => {
  // Group details into pairs for potential two-column layout
  // (Note: The current implementation doesn't actually use the pair grouping for columns)
  const pairs = chunk(details, 2);

  return (
    <div className="rounded-[20px] border-2 border-ui-base-primary flex flex-col p-8 gap-8 h-fit">
      {/* Commented out optional header prop */}
      {/* {header} */}
      
      {/* Header section with icon, title, duration, and cost */}
      <div className="flex flex-col items-center mx-auto">
        {/* Diamond icon */}
        <CustomIcon icon="diamond" className="h-32 w-32 mb-5" />
        
        {/* Title */}
        <h2 className="text-4xl uppercase font-semibold mb-2">Optim Bond</h2>
        
        {/* Duration text with purple styling */}
        <Text size="medium" className="text-ui-base-purple uppercase mb-8">
          {duration}
        </Text>
        
        {/* Cost display in bordered container */}
        <div className="border border-ui-border-sub p-3 rounded-[20px]">
          <Text size="large" weight="semibold">
            {cost}
          </Text>
        </div>
      </div>
      
      {/* Details list section */}
      <ul className="border border-ui-border-sub rounded-xl divide-y divide-ui-border-sub">
        {pairs.map((pair) =>
          pair.map((item) => (
            <li
              key={uuidv4()}  // Generate unique keys for each list item
              className="flex justify-between items-center py-2 px-4"
            >
              {/* Detail name/label with optional tooltip */}
              <Text tone="muted" className="flex items-center">
                {item.name}
                {item.tooltip !== undefined && <Info label={item.tooltip} />}
              </Text>
              
              {/* Detail value with full text in title attribute for overflow cases */}
              <Text weight="medium" title={item.value}>
                {item.value}
              </Text>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
