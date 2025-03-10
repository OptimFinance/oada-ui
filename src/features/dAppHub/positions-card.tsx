import { CurrencyLogos } from "src/components/CurrencyLogos";
import { Card } from "src/components/ui/card";
import { CustomIconsType } from "src/components/ui/custom-icon";
import { Text } from "src/components/ui/typography";
import { formatNumberWithSuffix } from "src/utils/formatNumbers";

type UserPosition = {
  positionName: string;
  value: number;
  currencyLogos: string[];
};

type PositionsCardProps = {
  userPositions: UserPosition[];
};

export const UserPositionsCard = ({ userPositions }: PositionsCardProps) => {
  return (
    <Card className="p-6 grid-cols-1 col-span-2 sm:col-span-1">
      <Text tone="muted" className="mb-6">
        Your positions
      </Text>
      <div className="flex justify-center items-center flex-wrap gap-6">
        {userPositions.map((position) => (
          <div className="flex gap-2 items-center">
            <CurrencyLogos
              logos={position.currencyLogos as CustomIconsType[]}
            />
            <Text>{formatNumberWithSuffix(position.value)}</Text>
            <Text tone="muted">{position.positionName}</Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
