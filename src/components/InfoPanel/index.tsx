import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { chunk } from "../../utils";
import { UITypes } from "../../types";
import { Info } from "../Info";
import { CustomIcon } from "../ui/custom-icon";
import { Text } from "../ui/typography";
export { infoPanelMock } from "./mock";

interface Props {
  details: UITypes.Card.Detail[];
  duration: string;
  cost: string;
  header?: ReactNode;
}

export const InfoPanel = ({ details, duration, cost, header }: Props) => {
  const pairs = chunk(details, 2);

  return (
    <div className="rounded-[20px] border-2 border-ui-base-primary flex flex-col p-8 gap-8 h-fit">
      {/* {header} */}
      <div className="flex flex-col items-center mx-auto">
        <CustomIcon icon="diamond" className="h-32 w-32 mb-5" />
        <h2 className="text-4xl uppercase font-semibold mb-2">Optim Bond</h2>
        <Text size="medium" className="text-ui-base-purple uppercase mb-8">
          {duration}
        </Text>
        <div className="border border-ui-border-sub p-3 rounded-[20px]">
          <Text size="large" weight="semibold">
            {cost}
          </Text>
        </div>
      </div>
      <ul className="border border-ui-border-sub rounded-xl divide-y divide-ui-border-sub">
        {pairs.map((pair) =>
          pair.map((item) => (
            <li
              key={uuidv4()}
              className="flex justify-between items-center py-2 px-4"
            >
              <Text tone="muted" className="flex items-center">
                {item.name}
                {item.tooltip !== undefined && <Info label={item.tooltip} />}
              </Text>
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
