import { Cell, Pie, PieChart } from "recharts";
import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix, formatPercent } from "src/utils/formatNumbers";
import {cn} from "src/utils/tailwind";

const chart_colors = ["#8B72FF", "#54B471"];

export type TvlChartData = {
  name: string;
  currency: string;
  value: number;
  amount: number;
}[];

type TvlCardProps = {
  chartData: TvlChartData;
  totalValueLocked: number;
};

export const TvlCard = ({ chartData, totalValueLocked }: TvlCardProps) => {
  return (
    <Card className="justify-items-center px-6 py-10 gap-4 grid col-span-2 grid-cols-1 sm:grid-cols-2">
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
            {chartData.map((_entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chart_colors[index % chart_colors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div className="flex flex-col gap-6 items-center grow my-auto">
        <div className="flex flex-col items-center gap-1">
          <Text tone="muted">Total Value Locked</Text>
          <Text size="xlarge">
            {formatNumberWithSuffix(totalValueLocked)} ₳
          </Text>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden bg-[#8B72FF] bg-[#54B471]"></div>
          {chartData.map((item, index) => (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <div className={cn('rounded-full', 'h-2', 'w-2', `bg-[${chart_colors[index % chart_colors.length]}]`)}></div>
                <Text>{formatNumberWithSuffix(item.amount)}</Text>
                <Text tone="muted">{item.currency}</Text>
              </div>
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
