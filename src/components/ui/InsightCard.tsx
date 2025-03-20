/**
 * InsightCard Component
 * 
 * A card component designed to display key metrics or insights with an icon and data points.
 * This component presents structured data in a visually consistent format, typically used 
 * for dashboards or summary sections.
 * 
 * Features:
 * - Consistent visual container using the Card component
 * - Prominent icon display for easy visual identification
 * - Support for multiple related data points in a vertical stack
 * - Consistent typography with title/value pairs
 * - Responsive layout that works across device sizes
 */

import { Card } from "./card";
import { CustomIcon, CustomIconsType } from "./custom-icon";
import { Text } from "./typography";

/**
 * InsightCard Component
 * 
 * @param icon - The icon key to display at the top of the card (uses CustomIcon component)
 * @param data - An array of data objects, each with:
 *   - key: Unique identifier for the data point
 *   - title: Label text for the data point
 *   - value: The metric or value to display (can be string or number)
 * 
 * @example
 * // Basic usage with a single data point
 * <InsightCard
 *   icon="bar_chart"
 *   data={[
 *     {
 *       key: "total-value",
 *       title: "Total Value",
 *       value: "$12,345"
 *     }
 *   ]}
 * />
 * 
 * @example
 * // With multiple data points
 * <InsightCard
 *   icon="shield_check"
 *   data={[
 *     {
 *       key: "conversion-rate",
 *       title: "Conversion Rate",
 *       value: "5.2%"
 *     },
 *     {
 *       key: "total-conversions",
 *       title: "Total Conversions",
 *       value: 1234
 *     }
 *   ]}
 * />
 */
export const InsightCard = ({
  icon,
  data,
}: {
  icon: CustomIconsType;
  data: {
    key: string;
    title: string;
    value: string | number;
  }[];
}) => {
  return (
    <Card>
      <div className="flex flex-col justify-center gap-4 mx-auto">
        {/* Icon container with circular background */}
        <div className="bg-ui-background-sub border-ui-border-sub rounded-full p-4 mx-auto">
          <CustomIcon icon={icon} />
        </div>
        
        {/* Map through and render each data point */}
        {data.map((item) => (
          <div key={item.key} className="flex flex-col gap-1 items-center">
            {/* Title text with muted styling */}
            <Text size="medium" tone="muted">
              {item.title}
            </Text>
            
            {/* Value text with prominent styling */}
            <Text className="text-xl" weight="medium">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
