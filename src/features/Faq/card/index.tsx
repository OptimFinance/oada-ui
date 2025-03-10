import React from "react";
import { ReactSVG } from "react-svg";
import { FaqCardType } from "./types";
import { resize } from "../../../utils";
import { Card } from "src/components/ui/card";
import { Text } from "src/components/ui/typography";

const FaqCard: React.FC<FaqCardType> = ({ id, image, title, onClick }) => {
  return (
    <a href={`#${id}`} onClick={onClick}>
      <Card className="flex flex-col items-center gap-10">
        <ReactSVG beforeInjection={resize(100, 100)} src={image} />
        <Text size="large" weight="semibold">
          {title}
        </Text>
      </Card>
    </a>
  );
};

export default FaqCard;
