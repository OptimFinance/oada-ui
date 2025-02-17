import { cn } from "src/utils/tailwind";
import { CustomIcon, CustomIconsType } from "./ui/custom-icon";

export const CurrencyLogos = ({
  logos,
  className,
}: {
  logos: CustomIconsType[];
  className?: string;
}) => {
  return (
    <div className={cn("flex h-6", className)}>
      {logos.map((img, index) => (
        <CustomIcon
          icon={img}
          key={index}
          className={cn(
            "rounded-full h-full aspect-square w-auto",
            logos.length > 1 && index !== logos.length - 1 ? "-mr-2" : ""
          )}
        />
      ))}
    </div>
  );
};
