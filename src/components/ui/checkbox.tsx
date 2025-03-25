/**
 * Checkbox Component
 * 
 * An accessible checkbox component built with Radix UI's Checkbox primitive.
 * This component provides a customized checkbox that follows the application's
 * design system while maintaining full accessibility and keyboard navigation.
 * 
 * Features:
 * - Accessible keyboard navigation and screen reader support
 * - Custom styling consistent with the design system
 * - Visual feedback for different states (checked, unchecked, disabled, focused)
 * - Smooth transitions between states
 * - Support for form integration
 */

"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "src/utils/tailwind";

/**
 * Checkbox Component
 * 
 * A customized checkbox that wraps Radix UI's Checkbox primitive.
 * Implements design system styling while preserving all accessibility features.
 * 
 * Uses React.forwardRef to properly handle ref forwarding to the underlying Radix component.
 * 
 * @example
 * // Basic usage
 * <Checkbox />
 * 
 * // With label (using external label)
 * <div className="flex items-center space-x-2">
 *   <Checkbox id="terms" />
 *   <label htmlFor="terms">Accept terms and conditions</label>
 * </div>
 * 
 * // Controlled component
 * const [checked, setChecked] = useState(false);
 * <Checkbox checked={checked} onCheckedChange={setChecked} />
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base checkbox styles with state variations
      "peer h-4 w-4 shrink-0 rounded-sm border border-ui-border-sub bg-ui-background-sub ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      // Additional classes passed via props
      className
    )}
    {...props}
  >
    {/* Indicator element that shows the check mark when checked */}
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {/* Check icon from lucide-react */}
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

// Preserve the display name from the Radix UI component for better debugging
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
