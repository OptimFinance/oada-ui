/**
 * CurrencyLogos Component
 * 
 * A reusable component for displaying one or more currency logos in a horizontal layout.
 * When multiple logos are displayed, they slightly overlap to create a stacked effect.
 * This component is commonly used in financial interfaces to visually represent currencies,
 * trading pairs, or token combinations.
 * 
 * Features:
 * - Displays one or more currency icons in a consistent size
 * - Creates a visual stack effect with multiple icons
 * - Supports custom styling through className prop
 * - Maintains circular shape for all logos
 */

import { cn } from "src/utils/tailwind";
import { CustomIcon, CustomIconsType } from "./ui/custom-icon";

/**
 * CurrencyLogos Component
 * 
 * @param logos - Array of currency icon identifiers to display (uses CustomIconsType from custom-icon)
 * @param className - Optional custom classes to extend or override default styling
 * 
 * @example
 * // Single currency logo
 * <CurrencyLogos logos={["btc"]} />
 * 
 * // Trading pair with overlapping logos
 * <CurrencyLogos logos={["eth", "usdt"]} />
 * 
 * // With custom styling
 * <CurrencyLogos logos={["btc", "eth"]} className="mb-2" />
 */
export const CurrencyLogos = ({
  logos,
  className,
}: {
  logos: CustomIconsType[];
  className?: string;
}) => {
  return (
    <div className={cn("flex h-6", className)}>
      {logos.map((img, index) => (
        <CustomIcon
          icon={img}
          key={index}
          className={cn(
            // Base styling for all currency logos
            "rounded-full h-full aspect-square w-auto",
            // Apply negative margin for overlapping effect except for the last icon
            logos.length > 1 && index !== logos.length - 1 ? "-mr-2" : ""
          )}
        />
      ))}
    </div>
  );
};
