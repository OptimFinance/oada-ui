/**
 * Separator Component
 * 
 * A versatile divider component built on Radix UI's Separator primitive.
 * This component provides a simple yet customizable way to create visual separations
 * between content sections, either horizontally or vertically.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Support for both horizontal and vertical orientations
 * - Consistent styling with the application's design system
 * - Option to set as decorative (non-semantic) or semantic
 * - Customizable through className prop
 */

"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "src/utils/tailwind";

/**
 * Separator Component
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param orientation - The orientation of the separator: 'horizontal' (default) or 'vertical'
 * @param decorative - Whether the separator is purely decorative (true) or has semantic meaning (false)
 *                    Decorative separators are hidden from screen readers, defaults to true
 * @param props - Other props passed to the Radix UI Separator component
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * // Basic horizontal separator
 * <Separator />
 * 
 * @example
 * // Vertical separator with custom height
 * <Separator orientation="vertical" className="h-8" />
 * 
 * @example
 * // Semantic separator (not decorative) between main sections
 * <Separator decorative={false} aria-label="Content separation" />
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        // Base styling for all separators
        "shrink-0 bg-ui-border-sub",
        // Conditional styling based on orientation
        orientation === "horizontal" 
          // Horizontal separator takes full width with minimal height
          ? "h-[1px] w-full" 
          // Vertical separator takes full height with minimal width
          : "h-full w-[1px]",
        // Additional custom classes
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
