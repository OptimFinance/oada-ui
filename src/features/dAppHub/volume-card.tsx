import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";

export type VolumeChartData = {
  name: string;
  currency: string;
  value: number;
  amount: number;
}[];

type VolumeCardProps = {
  chartData: VolumeChartData;
  totalVolume: number;
};

export const VolumeCard = ({ chartData, totalVolume }: VolumeCardProps) => {
  return (
    <>
      <Card className="justify-items-center p-0 items-center py-10 gap-4 grid grid-cols-1 col-span-2 sm:col-span-1">
        <div>
          <div className="justify-items-center grid">
            <div className="flex flex-col gap-6 items-center grow my-auto">
              <div className="flex flex-col items-center gap-1">
                <Text tone="muted">Stake Auction Volume</Text>
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center grow my-auto">
              <div className="flex flex-col items-center m-1">
                <Text size="xlarge">
                  {formatNumberWithSuffix(totalVolume, 6)} ₳
                </Text>
                <Text tone="muted" className="ml-1">All-time</Text>
              </div>
            </div>
          </div>
          <div className="flex items-center mt-4 divide-x-2 divide-ui-background-sub">
            {chartData.map((item) => (
              <div className="flex flex-1 flex-col items-center gap-0 p-2">
                <div className="flex items-center gap-1">
                  <Text>{formatNumberWithSuffix(item.amount, 6)}</Text>
                  <Text tone="muted">{item.currency}</Text>
                </div>
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
