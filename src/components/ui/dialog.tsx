/**
 * Dialog Component
 * 
 * A comprehensive modal dialog system based on Radix UI's Dialog primitive.
 * This component provides an accessible, customizable dialog/modal system 
 * with animations, overlay, and proper keyboard navigation support.
 * 
 * Features:
 * - Fully accessible (WAI-ARIA compliant) through Radix UI
 * - Animated transitions for opening and closing
 * - Backdrop with blur effect
 * - Consistent styling with the application design system
 * - Customizable header, content, and footer sections
 * - Keyboard navigation and focus management
 */

"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "src/utils/tailwind";

/**
 * Base Dialog component
 * Manages the open/closed state of the dialog
 */
const Dialog = DialogPrimitive.Root;

/**
 * Dialog Trigger
 * The element that will open the dialog when clicked
 */
const DialogTrigger = DialogPrimitive.Trigger;

/**
 * Dialog Portal
 * Renders the dialog into a portal, ensuring it appears above other content
 */
const DialogPortal = DialogPrimitive.Portal;

/**
 * Dialog Close
 * Element that will close the dialog when clicked
 */
const DialogClose = DialogPrimitive.Close;

/**
 * Dialog Overlay
 * The backdrop behind the dialog that dims and blurs the content underneath
 * 
 * @param className - Additional classes to apply to the overlay
 * @param props - Other props passed to the overlay
 * @param ref - Forwarded ref
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-ui-background-sub backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/**
 * Dialog Content
 * The container for dialog content with animations and styling
 * Includes a close button in the top-right corner
 * 
 * @param className - Additional classes to apply to the content
 * @param children - Content to display inside the dialog
 * @param props - Other props passed to the content
 * @param ref - Forwarded ref
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[480px] translate-x-[-50%] translate-y-[-50%] gap-6 border border-ui-border-sub bg-[#0A0C1B] p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-5 top-[22px] rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-6 w-6" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/**
 * Dialog Header
 * A container for the dialog title and description with appropriate spacing
 * 
 * @param className - Additional classes to apply to the header
 * @param props - Other props passed to the header div
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

/**
 * Dialog Footer
 * A container for dialog action buttons with appropriate spacing and layout
 * Arranges buttons in a column on mobile and a row on larger screens
 * 
 * @param className - Additional classes to apply to the footer
 * @param props - Other props passed to the footer div
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

/**
 * Dialog Title
 * The title of the dialog, styled appropriately
 * 
 * @param className - Additional classes to apply to the title
 * @param props - Other props passed to the title
 * @param ref - Forwarded ref
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-xl font-normal leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/**
 * Dialog Description
 * A descriptive text for the dialog, styled appropriately
 * 
 * @param className - Additional classes to apply to the description
 * @param props - Other props passed to the description
 * @param ref - Forwarded ref
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-ui-surface-sub", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

/**
 * Export all dialog components for use in the application
 * 
 * Usage example:
 * 
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>This is a description of the dialog.</DialogDescription>
 *     </DialogHeader>
 *     <div>Main content goes here</div>
 *     <DialogFooter>
 *       <Button>Cancel</Button>
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
