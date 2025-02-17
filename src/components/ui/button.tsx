import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/utils/tailwind";

const buttonVariants = cva(
  "rounded-full inline-flex gap-2 items-center justify-center whitespace-nowrap text-ui-surface-default text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:text-ui-surface-disabled",
  {
    variants: {
      variant: {
        primary:
          "bg-ui-base-primary hover:bg-[hsla(234,83%,69%,1)] disabled:bg-[hsla(234,83%,69%,0.2)]",
        secondary:
          "bg-ui-background-default border border-ui-border-sub hover:bg-[hsla(0,0%,100%,0.12)] disabled:bg-ui-background-disabled",
        white:
          "bg-ui-surface-default text-ui-base-background hover:bg-[hsla(0,0%,100%,0.76)] disabled:bg-ui-surface-disabled disabled:text-[hsla(233,100%,4%,0.4)]",
      },
      size: {
        sm: "h-9 px-4 py-2",
        default: "h-11 px-6 py-3",
        lg: "h-14 px-6 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
