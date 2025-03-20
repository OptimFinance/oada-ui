/**
 * Volume Card Component
 * 
 * This component displays trading volume statistics for stake auctions in a card format.
 * It shows the all-time total volume and breaks down volume by different time periods
 * or categories (e.g., weekly, monthly) as specified in the chart data.
 * 
 * Key features:
 * - Display of total stake auction volume with appropriate number formatting
 * - Segmentation of volume data across different time periods
 * - Responsive layout that adapts to different screen sizes
 * - Consistent styling with other dashboard metric cards
 * 
 * Used on dashboards to provide users with insight into platform activity
 * and trading volume over time.
 */

import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";

/**
 * Volume Chart Data Type
 * 
 * Defines the data structure for each segment in the volume breakdown
 * 
 * @property name - Display name for the time period (e.g., "This Week", "This Month")
 * @property currency - Currency code for the volume (typically "ADA")
 * @property value - Numeric value used for potential calculations (not displayed in this component)
 * @property amount - Actual volume amount for the specified time period
 */
export type VolumeChartData = {
  name: string;
  currency: string;
  value: number;
  amount: number;
}[];

/**
 * Volume Card Props
 * 
 * @property chartData - Array of data points for volume breakdown by time period
 * @property totalVolume - The all-time total volume across all time periods
 */
type VolumeCardProps = {
  chartData: VolumeChartData;
  totalVolume: number;
};

/**
 * Volume Card Component
 * 
 * Displays a card with stake auction volume metrics including the all-time total
 * and a breakdown by different time periods.
 * 
 * @param chartData - Data points showing volume across different time periods
 * @param totalVolume - All-time total volume in ADA
 * @returns A responsive card component displaying volume metrics
 */
export const VolumeCard = ({ chartData, totalVolume }: VolumeCardProps) => {
  return (
    <>
      <Card className="justify-items-center p-0 items-center py-10 gap-4 grid grid-cols-1 col-span-2 sm:col-span-1">
        <div>
          {/* Volume header and total section */}
          <div className="justify-items-center grid">
            {/* Card title */}
            <div className="flex flex-col gap-6 items-center grow my-auto">
              <div className="flex flex-col items-center gap-1">
                <Text tone="muted">Stake Auction Volume</Text>
              </div>
            </div>
            
            {/* Total volume display with "All-time" label */}
            <div className="flex flex-col gap-6 items-center grow my-auto">
              <div className="flex flex-col items-center m-1">
                <Text size="xlarge">
                  {formatNumberWithSuffix(totalVolume, 6)} ₳
                </Text>
                <Text tone="muted" className="ml-1">All-time</Text>
              </div>
            </div>
          </div>
          
          {/* Volume breakdown by time period */}
          <div className="flex items-center mt-4 divide-x-2 divide-ui-background-sub">
            {chartData.map((item, index) => (
              <div className="flex flex-1 flex-col items-center gap-0 p-2" key={item.name + index}>
                {/* Volume amount and currency for this time period */}
                <div className="flex items-center gap-1">
                  <Text>{formatNumberWithSuffix(item.amount, 6)}</Text>
                  <Text tone="muted">{item.currency}</Text>
                </div>
                
                {/* Time period label (e.g., "This Week", "This Month") */}
                <div className="flex items-center gap-1">
                  <Text tone="muted" className="ml-1">
                    {item.name}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
};
