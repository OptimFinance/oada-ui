import * as React from "react";
import { cn } from "src/utils/tailwind";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 border border-ui-border-sub rounded-xl bg-ui-background-sub transition-colors duration-200 ease-in-out",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";
