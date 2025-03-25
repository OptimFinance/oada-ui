/**
 * Tabs Component System
 * 
 * A set of accessible, styled tab components built on Radix UI's Tabs primitive.
 * This component provides a way to organize content into tabbed sections, allowing
 * users to switch between different views without navigating to a new page.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Animated active state with visual indicators
 * - Keyboard navigation support
 * - Rounded styling with proper focus states
 * - Customizable through className props
 */

"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "src/utils/tailwind";

/**
 * Root Tabs component
 * 
 * Controls the overall tabs state and manages which tab is currently active.
 */
const Tabs = TabsPrimitive.Root;

/**
 * TabsList Component
 * 
 * Container for tab triggers/buttons with styled appearance.
 * Renders as a horizontally aligned set of tab buttons.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param props - Other props passed to the Radix UI TabsList
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * <TabsList>
 *   <TabsTrigger value="tab1">First Tab</TabsTrigger>
 *   <TabsTrigger value="tab2">Second Tab</TabsTrigger>
 * </TabsList>
 */
const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base styling - horizontally aligned with rounded appearance
      "inline-flex h-12 items-center justify-center rounded-full",
      // Visual styling with background and border
      "bg-ui-background-sub border border-ui-border-sub p-1",
      // Text color for inactive tabs
      "text-muted-foreground",
      // Custom classes
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/**
 * TabsTrigger Component
 * 
 * The clickable tab button that activates its associated content panel.
 * Shows active state visually when its tab is selected.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param props - Other props passed to the Radix UI TabsTrigger
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * <TabsTrigger value="settings">Settings</TabsTrigger>
 */
const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styling and layout
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-2",
      // Typography
      "font-medium",
      // Focus and interaction states
      "ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      // Active state styling - changes background, text color and adds shadow
      "data-[state=active]:bg-ui-base-white data-[state=active]:text-ui-surface-dark data-[state=active]:shadow-sm",
      // Custom classes
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/**
 * TabsContent Component
 * 
 * Container for the content associated with a specific tab.
 * Only visible when its corresponding tab is active.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param props - Other props passed to the Radix UI TabsContent
 * @param ref - Forwarded ref to access the underlying element
 * 
 * @example
 * <TabsContent value="tab1">
 *   <p>Content for the first tab</p>
 * </TabsContent>
 */
const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      // Spacing and focus states
      "mt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      // Custom classes
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

/**
 * Export all tabs components for use in the application
 * 
 * Usage example:
 * 
 * ```tsx
 * <Tabs defaultValue="account">
 *   <TabsList>
 *     <TabsTrigger value="account">Account</TabsTrigger>
 *     <TabsTrigger value="password">Password</TabsTrigger>
 *     <TabsTrigger value="settings">Settings</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="account">
 *     <h2>Account Settings</h2>
 *     <p>Configure your account preferences here.</p>
 *   </TabsContent>
 *   <TabsContent value="password">
 *     <h2>Change Password</h2>
 *     <p>Update your password here.</p>
 *   </TabsContent>
 *   <TabsContent value="settings">
 *     <h2>Other Settings</h2>
 *     <p>Manage other application settings.</p>
 *   </TabsContent>
 * </Tabs>
 * ```
 */
export { Tabs, TabsList, TabsTrigger, TabsContent };
