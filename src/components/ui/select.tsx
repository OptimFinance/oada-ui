/**
 * Select Component System
 * 
 * A comprehensive dropdown select system built on Radix UI's Select primitive.
 * This component provides an accessible, customizable dropdown menu for selecting
 * options from a list, with support for grouping, labeling, and custom styling.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Customizable trigger button and dropdown menu
 * - Support for option groups and labels
 * - Visual indication of selected items
 * - Scrollable content for large option lists
 * - Keyboard navigation support
 * - Animated transitions for opening and closing
 */

"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "src/utils/tailwind";

/**
 * Root Select component
 * Controls the overall select state and manages the value
 */
const Select = SelectPrimitive.Root;

/**
 * Select Group component
 * Used to group related select options with an optional label
 */
const SelectGroup = SelectPrimitive.Group;

/**
 * Select Value component
 * Displays the currently selected value in the trigger
 */
const SelectValue = SelectPrimitive.Value;

/**
 * Select Trigger component
 * The button that opens the select dropdown
 * 
 * @param className - Optional custom classes for styling
 * @param children - Content to display in the trigger (typically SelectValue)
 * @param props - Other props passed to the trigger
 * @param ref - Forwarded ref
 */
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styling for the trigger button
      "flex px-4 py-[9px] border border-ui-border-sub bg-ui-background-sub text-ui-base-white rounded-[41px]",
      // Layout and spacing
      "w-full items-center justify-between",
      // Background and focus states
      "bg-background ring-offset-background",
      // Placeholder and text truncation
      "placeholder:text-muted-foreground [&>span]:line-clamp-1",
      // Focus and disabled states
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Custom classes
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/**
 * Select Scroll Up Button
 * Button that appears at the top of the dropdown when content is scrollable upward
 * 
 * @param className - Optional custom classes
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

/**
 * Select Scroll Down Button
 * Button that appears at the bottom of the dropdown when content is scrollable downward
 * 
 * @param className - Optional custom classes
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

/**
 * Select Content component
 * The dropdown content that contains the select options
 * 
 * @param className - Optional custom classes
 * @param children - The select options and groups
 * @param position - Position strategy for the dropdown ('popper' or 'item-aligned')
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        // Base styling and layout
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden",
        // Appearance
        "bg-ui-base-background rounded-xl border border-ui-border-sub shadow-md",
        // Animation states
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        // Slide animations based on position
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        // Position adjustments when using popper positioning
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        // Custom classes
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          // Sizing adjustments for popper positioning
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

/**
 * Select Label component
 * Used to label a group of select options
 * 
 * @param className - Optional custom classes
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

/**
 * Select Item component
 * Individual selectable option in the dropdown
 * 
 * @param className - Optional custom classes
 * @param children - The content of the option (typically text)
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      // Base styling and layout
      "relative flex w-full cursor-default select-none items-center",
      // Spacing and text styling
      "rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      // Interactive states
      "hover:bg-ui-background-hover focus:bg-accent focus:text-accent-foreground",
      // Disabled state
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      // Custom classes
      className
    )}
    {...props}
  >
    {/* Check icon container for selected item */}
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

/**
 * Select Separator component
 * Horizontal line used to separate groups of options
 * 
 * @param className - Optional custom classes
 * @param props - Other props
 * @param ref - Forwarded ref
 */
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/**
 * Export all select components for use in the application
 * 
 * Usage example:
 * 
 * ```tsx
 * <Select>
 *   <SelectTrigger className="w-[200px]">
 *     <SelectValue placeholder="Select an option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Fruits</SelectLabel>
 *       <SelectItem value="apple">Apple</SelectItem>
 *       <SelectItem value="banana">Banana</SelectItem>
 *       <SelectItem value="orange">Orange</SelectItem>
 *     </SelectGroup>
 *     <SelectSeparator />
 *     <SelectGroup>
 *       <SelectLabel>Vegetables</SelectLabel>
 *       <SelectItem value="carrot">Carrot</SelectItem>
 *       <SelectItem value="broccoli">Broccoli</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 * </Select>
 * ```
 */
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
