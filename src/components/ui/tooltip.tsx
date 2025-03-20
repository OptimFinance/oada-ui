/**
 * Tooltip Component System
 * 
 * A set of accessible, animated tooltip components built on Radix UI's Tooltip primitive.
 * This component system provides a way to display additional information when users hover
 * over or focus on an element, enhancing the user experience without cluttering the UI.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Animated entry and exit transitions
 * - Positioning that adapts to available space
 * - Consistent styling that matches the application's design system
 * - Customizable appearance and offset
 */

"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "src/utils/tailwind";

/**
 * TooltipProvider Component
 * 
 * Provider component that must wrap all tooltip instances.
 * Controls global configuration for all tooltips in its scope.
 * 
 * @example
 * // Wrap your app or a section with TooltipProvider
 * <TooltipProvider>
 *   // Your app content with tooltips
 * </TooltipProvider>
 */
const TooltipProvider = TooltipPrimitive.Provider;

/**
 * Tooltip Component
 * 
 * Root component that manages the open state of the tooltip.
 * Coordinates between the trigger and content components.
 */
const Tooltip = TooltipPrimitive.Root;

/**
 * TooltipTrigger Component
 * 
 * The element that will trigger the tooltip when hovered or focused.
 * Typically wraps a button, icon, or other interactive element.
 * 
 * @example
 * <TooltipTrigger>
 *   <Button>Hover Me</Button>
 * </TooltipTrigger>
 */
const TooltipTrigger = TooltipPrimitive.Trigger;

/**
 * TooltipContent Component
 * 
 * The actual tooltip content that appears when the trigger is activated.
 * Contains the information to be displayed in the tooltip.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param sideOffset - Distance between the tooltip and the trigger element (default: 4px)
 * @param props - Other props passed to the Radix UI TooltipContent
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * <TooltipContent>
 *   This is additional information
 * </TooltipContent>
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      // Positioning and base styling
      "z-50 overflow-hidden rounded-md border bg-ui-base-white px-4 py-2",
      // Typography
      "text-sm text-ui-surface-dark",
      // Shadow for depth
      "shadow-md",
      // Animation for entering
      "animate-in fade-in-0 zoom-in-95",
      // Animation for exiting
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      // Position-specific slide animations
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      // Custom classes
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

/**
 * Export all tooltip components for use in the application
 * 
 * Usage example:
 * 
 * ```tsx
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger asChild>
 *       <Button variant="outline" size="icon">
 *         <InfoIcon className="h-4 w-4" />
 *       </Button>
 *     </TooltipTrigger>
 *     <TooltipContent>
 *       This action will submit your form data
 *     </TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 * ```
 */
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
