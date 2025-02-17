import { Card } from "./card";
import { CustomIcon, CustomIconsType } from "./custom-icon";
import { Text } from "./typography";

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
        <div className="bg-ui-background-sub border-ui-border-sub rounded-full p-4 mx-auto">
          <CustomIcon icon={icon} />
        </div>
        {data.map((item) => (
          <div key={item.key} className="flex flex-col gap-1 items-center">
            <Text size="medium" tone="muted">
              {item.title}
            </Text>
            <Text className="text-xl" weight="medium">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
};
