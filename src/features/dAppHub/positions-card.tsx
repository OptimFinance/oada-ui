/**
 * User Positions Card Component
 * 
 * This component displays a summary of a user's financial positions across different
 * assets or tokens in the dApp ecosystem. It renders a card with multiple position
 * entries, each showing:
 * - Currency logos (can be single or multiple for LP positions)
 * - Position value (formatted with appropriate suffixes)
 * - Position name/label
 * 
 * Used in dashboard interfaces to give users a quick overview of their holdings
 * across different parts of the ecosystem (tokens, liquidity positions, staked assets).
 * 
 * The component is responsive and will adapt its layout based on available space,
 * with positions wrapping as needed.
 */

import { CurrencyLogos } from "src/components/CurrencyLogos";
import { Card } from "src/components/ui/card";
import { CustomIconsType } from "src/components/ui/custom-icon";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";

/**
 * UserPosition Type
 * 
 * Represents a single financial position held by the user.
 * 
 * @property positionName - Display name of the position (e.g., "OADA", "sOADA", "OADA-ADA LP")
 * @property value - Numerical value of the position (typically token amount)
 * @property currencyLogos - Array of logo identifiers for the currencies involved
 *                           (single logo for tokens, multiple for LP positions)
 */
type UserPosition = {
  positionName: string;
  value: number;
  currencyLogos: string[];
};

/**
 * PositionsCardProps Type
 * 
 * Props for the UserPositionsCard component.
 * 
 * @property userPositions - Array of UserPosition objects to display
 */
type PositionsCardProps = {
  userPositions: UserPosition[];
};

/**
 * UserPositionsCard Component
 * 
 * Displays a card containing a summary of the user's financial positions.
 * 
 * @param props - Component properties
 * @param props.userPositions - Array of positions to display in the card
 * @returns A card component displaying the user's financial positions
 */
export const UserPositionsCard = ({ userPositions }: PositionsCardProps) => {
  return (
    <Card className="p-6 grid-cols-1 col-span-2 sm:col-span-1">
      {/* Card title */}
      <Text tone="muted" className="mb-6">
        Your positions
      </Text>
      
      {/* Container for position items - uses flexbox with wrapping for responsive layout */}
      <div className="flex justify-center items-center flex-wrap gap-6">
        {/* Map each position to a display element */}
        {userPositions.map((position) => (
          <div className="flex gap-2 items-center">
            {/* Currency logos - handles both single tokens and pairs */}
            <CurrencyLogos
              logos={position.currencyLogos as CustomIconsType[]}
            />
            {/* Position value with formatted number */}
            <Text>{formatNumberWithSuffix(position.value)}</Text>
            {/* Position name with muted styling */}
            <Text tone="muted">{position.positionName}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
