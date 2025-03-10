import * as React from "react";
import { cn } from "src/utils/tailwind";
import { VariantProps, cva } from "class-variance-authority";

const textVariants = cva("text-sm", {
  variants: {
    size: {
      xlarge: "text-[24px] leading-[32px]",
      large: "text-[18px] leading-[24px]",
      medium: "text-[16px] leading-[24px]",
      small: "text-[14px] leading-[20px]",
      xsmall: "text-[12px] leading-[16px]",
    },
    tone: {
      muted: "text-ui-surface-sub",
      default: "text-ui-white",
    },
    weight: {
      semibold: "font-semibold",
      medium: "font-medium",
      normal: "font-normal",
    },
  },
  defaultVariants: {
    size: "small",
    tone: "default",
    weight: "normal",
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

export const Text = ({
  className,
  size,
  tone,
  weight,
  ...props
}: TextProps) => {
  return (
    <p
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
};
