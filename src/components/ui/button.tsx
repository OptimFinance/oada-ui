/**
 * Button Component
 * 
 * A versatile, accessible button component built with Radix UI Slot primitive
 * and class-variance-authority for variant management. 
 * 
 * This component is part of the design system and provides:
 * - Multiple visual variants (primary, secondary, white)
 * - Different size options
 * - Support for icons and text
 * - Accessible focus states
 * - Support for being replaced with other elements via asChild prop
 * - Consistent styling with the application's design language
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "src/utils/tailwind";

/**
 * Button variants configuration using class-variance-authority
 * 
 * This defines all the possible visual variations of the button:
 * - Variants: Controls the visual style (primary, secondary, white)
 * - Sizes: Controls the dimensions (sm, default, lg, icon)
 * - Default settings for when no variants are specified
 * 
 * Each variant has specific styles for default, hover, and disabled states.
 */
const buttonVariants = cva(
  // Base styles applied to all buttons
  "rounded-full inline-flex gap-2 items-center justify-center whitespace-nowrap text-ui-surface-default text-base font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:text-ui-surface-disabled",
  {
    variants: {
      variant: {
        // Primary button - Main call to action, high emphasis
        primary:
          "bg-ui-base-primary hover:bg-[hsla(234,83%,69%,1)] disabled:bg-[hsla(234,83%,69%,0.2)]",
        // Secondary button - Medium emphasis actions
        secondary:
          "bg-ui-background-default border border-ui-border-sub hover:bg-[hsla(0,0%,100%,0.12)] disabled:bg-ui-background-disabled",
        // White button - Used for high contrast situations
        white:
          "bg-ui-surface-default text-ui-base-background hover:bg-[hsla(0,0%,100%,0.76)] disabled:bg-ui-surface-disabled disabled:text-[hsla(233,100%,4%,0.4)]",
      },
      size: {
        sm: "h-9 px-4 py-2",      // Small button
        default: "h-11 px-6 py-3", // Default/medium button
        lg: "h-14 px-6 py-4",     // Large button
        icon: "h-10 w-10",        // Icon-only button (square)
      },
    },
    // Default variants applied when not specified
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

/**
 * Button component props
 * 
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement> - Inherits all standard button attributes
 * @extends VariantProps<typeof buttonVariants> - Adds the variant and size props from cva
 * 
 * @property asChild - If true, the component will render its children directly using Radix UI Slot
 *                    This allows the button's functionality and styles to be applied to any element
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button Component
 * 
 * A customizable button component that follows the design system.
 * Uses React.forwardRef to properly handle ref forwarding to the underlying DOM element.
 * 
 * @example
 * // Primary button (default)
 * <Button>Click me</Button>
 * 
 * // Secondary button with small size
 * <Button variant="secondary" size="sm">Cancel</Button>
 * 
 * // Icon button
 * <Button variant="primary" size="icon">
 *   <Icon name="plus" />
 * </Button>
 * 
 * // Button as a link (using asChild)
 * <Button asChild>
 *   <a href="/dashboard">Go to Dashboard</a>
 * </Button>
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // Use Slot from Radix UI if asChild is true, otherwise use a regular button element
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        // Combine variant styles with any additional className passed
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
// Set display name for dev tools
Button.displayName = "Button";

export { Button, buttonVariants };
