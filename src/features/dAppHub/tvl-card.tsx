/**
 * TVL Card Component
 * 
 * This component displays the Total Value Locked (TVL) metrics in a card format
 * with a donut chart visualization. It shows the distribution of assets in the
 * protocol, their relative percentages, and the total value locked.
 * 
 * Key features:
 * - Responsive donut chart visualization of TVL distribution
 * - Breakdown of individual token contributions to TVL
 * - Percentage calculations for each token's share
 * - Formatted display of values with appropriate number suffixes
 * 
 * Used on dashboards to provide users with a quick visual summary of
 * capital allocation within the protocol.
 */

import { Cell, Pie, PieChart } from "recharts";
import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix, formatPercent } from "src/utils/formatNumbers";
import {cn} from "src/utils/tailwind";

/**
 * Color palette for the donut chart segments
 * First color (#8B72FF - purple) typically represents the base token
 * Second color (#54B471 - green) typically represents the staked version
 */
const chart_colors = ["#8B72FF", "#54B471"];

/**
 * TVL Chart Data Type
 * 
 * Defines the data structure for each segment in the TVL chart
 * 
 * @property name - Display name for the token/asset
 * @property currency - Currency code for the token (e.g., "OADA", "sOADA")
 * @property value - Numeric value used for calculating segment size in the chart
 * @property amount - Actual token amount (may differ from value if normalized)
 */
export type TvlChartData = {
  name: string;
  currency: string;
  value: number;
  amount: number;
}[];

/**
 * TVL Card Props
 * 
 * @property chartData - Array of data points for the TVL distribution chart
 * @property totalValueLocked - The sum total of all locked value in the protocol (in ADA)
 */
type TvlCardProps = {
  chartData: TvlChartData;
  totalValueLocked: number;
};

/**
 * TVL Card Component
 * 
 * Displays a card with TVL metrics including a donut chart visualization
 * and breakdown of individual token contributions.
 * 
 * @param chartData - Data points for the chart showing distribution of locked assets
 * @param totalValueLocked - Total sum of all assets locked in the protocol (in ADA)
 * @returns A responsive card component displaying TVL metrics and distribution
 */
export const TvlCard = ({ chartData, totalValueLocked }: TvlCardProps) => {
  /**
   * Pie Chart Configuration Notes:
   * - innerRadius: Creates the donut hole (66px)
   * - outerRadius: Determines the overall chart size (82px)
   * - dataKey: Uses the 'value' property for determining segment size
   * - paddingAngle: Creates small gaps between segments (2 degrees)
   * - Cells are colored based on the chart_colors array, cycling through colors if needed
   */
  
  return (
    <Card className="justify-items-center px-6 py-10 gap-4 grid col-span-2 grid-cols-1 sm:grid-cols-2">
      {/* Left side: Donut chart visualization */}
      <div className="lg:inline-block">
        <PieChart width={164} height={164}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={66}      
            outerRadius={82}      
            stroke="none"
            dataKey="value"       
            paddingAngle={2}      
          >
            {/* Map each data entry to a chart cell with a color */}
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chart_colors[index % chart_colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </div>
      
      {/* Right side: TVL stats and breakdown */}
      <div className="flex flex-col gap-6 items-center grow my-auto">
        {/* Total Value Locked display */}
        <div className="flex flex-col items-center gap-1">
          <Text tone="muted">Total Value Locked</Text>
          <Text size="xlarge">
            {formatNumberWithSuffix(totalValueLocked)} ₳
          </Text>
        </div>
        
        {/* Token breakdown with percentages */}
        <div className="flex items-center gap-6">
          {/* Hidden div containing the actual color classes to prevent Tailwind from purging them */}
          <div className="hidden bg-[#8B72FF] bg-[#54B471]"></div>
          
          {/* Mapping each token to its display component */}
          {chartData.map((item, index) => (
            <div className="flex flex-col items-center gap-1" key={item.name}>
              {/* Token amount row */}
              <div className="flex items-center gap-1">
                {/* Color indicator dot */}
                <div className={cn('rounded-full', 'h-2', 'w-2', `bg-[${chart_colors[index % chart_colors.length]}]`)}></div>
                {/* Formatted token amount */}
                <Text>{formatNumberWithSuffix(item.amount)}</Text>
                {/* Token currency code */}
                <Text tone="muted">{item.currency}</Text>
              </div>
              
              {/* Percentage row */}
              <div className="flex items-center gap-1">
                <Text tone="muted" className="ml-1">
                  {formatPercent(item.value / totalValueLocked)}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
