/**
 * Sheet Component System
 * 
 * A sliding panel/drawer system built on Radix UI's Dialog primitive.
 * This component provides an accessible, customizable side panel that slides in
 * from any edge of the screen, commonly used for navigation menus, filters, or forms.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Multiple position variants (top, right, bottom, left)
 * - Smooth slide animations with configurable durations
 * - Backdrop with blur effect
 * - Customizable header, content, and footer sections
 * - Responsive sizing with different widths on mobile and desktop
 */

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import classNames from "classnames";

/**
 * Root Sheet component
 * Controls the open/closed state of the sheet
 */
const Sheet = SheetPrimitive.Root;

/**
 * Sheet Trigger component
 * The element that opens the sheet when clicked
 */
const SheetTrigger = SheetPrimitive.Trigger;

/**
 * Sheet Close component
 * Element that closes the sheet when clicked
 */
const SheetClose = SheetPrimitive.Close;

/**
 * Sheet Portal component
 * Renders the sheet into a portal, ensuring it appears above other content
 */
const SheetPortal = SheetPrimitive.Portal;

/**
 * Sheet Overlay component
 * The backdrop behind the sheet that dims and blurs the content underneath
 * 
 * @param className - Additional classes to apply to the overlay
 * @param props - Other props passed to the overlay
 * @param ref - Forwarded ref
 */
const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={classNames(
      // Base styling for the overlay - positioned to cover the entire screen
      "fixed inset-0 z-50", 
      // Semi-transparent background with blur effect
      "bg-neutral-900/10 backdrop-blur-sm",
      // Animations for opening and closing
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      // Custom classes
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

/**
 * Sheet variants configuration using class-variance-authority
 * Defines styling for different sheet positions (top, right, bottom, left)
 * with appropriate animations for each position
 */
const sheetVariants = cva(
  // Base styles for all sheet variants
  "fixed z-50 gap-4 bg-[#15151E] p-4 md:p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        // Top sheet - slides in from the top edge
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        // Bottom sheet - slides in from the bottom edge
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        // Left sheet - slides in from the left edge
        left: "inset-y-0 left-0 h-full w-3/4 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        // Right sheet - slides in from the right edge (default)
        right:
          "inset-y-0 right-0 h-full w-3/4 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

/**
 * Sheet Content Props Interface
 * Extends the Radix UI Dialog Content props with our custom variants
 */
interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

/**
 * Sheet Content component
 * The container for the sheet content with position variants and close button
 * 
 * @param side - The side from which the sheet appears ('right' by default)
 * @param className - Additional classes to apply to the content
 * @param children - Content to display inside the sheet
 * @param props - Other props passed to the content
 * @param ref - Forwarded ref
 */
const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={classNames(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      {/* Close button in the top-right corner */}
      <SheetPrimitive.Close className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

/**
 * Sheet Header component
 * A container for the sheet title and description with appropriate spacing
 * 
 * @param className - Additional classes to apply to the header
 * @param props - Other props passed to the header div
 */
const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      // Centered on mobile, left-aligned on larger screens
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

/**
 * Sheet Footer component
 * A container for sheet action buttons with appropriate spacing and layout
 * Arranges buttons in a column on mobile and a row on larger screens
 * 
 * @param className - Additional classes to apply to the footer
 * @param props - Other props passed to the footer div
 */
const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={classNames(
      // Column layout on mobile, row layout with right alignment on larger screens
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

/**
 * Sheet Title component
 * The title of the sheet, styled appropriately
 * 
 * @param className - Additional classes to apply to the title
 * @param props - Other props passed to the title
 * @param ref - Forwarded ref
 */
const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={classNames("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

/**
 * Sheet Description component
 * A descriptive text for the sheet, styled appropriately
 * 
 * @param className - Additional classes to apply to the description
 * @param props - Other props passed to the description
 * @param ref - Forwarded ref
 */
const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={classNames("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

/**
 * Export all sheet components for use in the application
 * 
 * Usage example:
 * 
 * ```tsx
 * <Sheet>
 *   <SheetTrigger asChild>
 *     <Button variant="outline">Open Sheet</Button>
 *   </SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Sheet Title</SheetTitle>
 *       <SheetDescription>
 *         This is a description of what this sheet is for.
 *       </SheetDescription>
 *     </SheetHeader>
 *     
 *     <div className="py-4">
 *       <p>Your sheet content goes here.</p>
 *     </div>
 *     
 *     <SheetFooter>
 *       <SheetClose asChild>
 *         <Button>Save Changes</Button>
 *       </SheetClose>
 *     </SheetFooter>
 *   </SheetContent>
 * </Sheet>
 * ```
 */
export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
