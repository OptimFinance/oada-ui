/**
 * Card Component
 * 
 * A foundational UI component that creates a contained, bordered surface for
 * displaying related content and UI elements. This component serves as a
 * visual container in the application's design system.
 * 
 * Features:
 * - Consistent styling with rounded corners and subtle border
 * - Background that stands out from the page
 * - Standard padding for content
 * - Smooth transition effects for any state changes
 * - Ability to extend with additional classes via className prop
 * - Full support for standard HTML div attributes
 */

import * as React from "react";
import { cn } from "src/utils/tailwind";

/**
 * Card Component
 * 
 * A simple yet versatile card container component that provides consistent styling
 * while allowing full customization via props and className.
 * 
 * Uses React.forwardRef to properly handle ref forwarding to the underlying div element.
 * 
 * @example
 * // Basic usage
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here...</p>
 * </Card>
 * 
 * // With additional classes
 * <Card className="max-w-md mx-auto mt-4">
 *   <h3>Custom Card</h3>
 *   <p>This card has custom width and margin classes.</p>
 * </Card>
 */
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base card styles from the design system
      "p-6 border border-ui-border-sub rounded-xl bg-ui-background-sub transition-colors duration-200 ease-in-out",
      // Additional classes passed via props
      className
    )}
    {...props}
  />
));

// Set display name for React DevTools
Card.displayName = "Card";
