/**
 * Progress Component
 * 
 * A customizable progress bar component built on Radix UI's Progress primitive.
 * This component visualizes progress or completion status with a horizontal bar
 * that fills based on the provided value.
 * 
 * Features:
 * - Accessible (WAI-ARIA compliant) through Radix UI
 * - Visual indication of progress with smooth animations
 * - Color changes when value reaches 100% (completion state)
 * - Customizable through className prop with Tailwind CSS
 * - Rounded ends for a modern appearance
 * - Smooth transition animation when value changes
 */

"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "src/utils/tailwind";

/**
 * Progress Component
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param value - The current progress value (0-100)
 * @param props - Other props passed to the Radix UI Progress component
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * // Basic usage with a specific value
 * <Progress value={65} />
 * 
 * @example
 * // With custom styling and width
 * <Progress value={30} className="w-64 h-3" />
 * 
 * @example
 * // Completed state (note the color change)
 * <Progress value={100} />
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      // Base styling for the progress bar container
      "relative h-2 w-full overflow-hidden rounded-full bg-ui-background-active",
      // Additional custom classes
      className
    )}
    {...props}
  >
    {/* 
      Progress indicator that visually represents the current value
      - Transforms to show the appropriate filled amount
      - Changes color when progress reaches 100%
      - Smooth transition animation
    */}
    <ProgressPrimitive.Indicator
      className={cn(
        // Base styling for the indicator
        "h-full w-full flex-1 bg-ui-base-green transition-all",
        // Conditional styling: changes to yellow at 100% completion
        value === 100 && "bg-ui-base-yellow"
      )}
      // Dynamic styling: translates based on the current value
      // The transform creates the filling effect by shifting the indicator
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
