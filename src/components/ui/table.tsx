/**
 * Table Component System
 * 
 * A comprehensive set of components for building accessible, responsive tables.
 * This system provides all the necessary parts to create well-structured tables
 * with proper semantics, styling, and responsive behavior.
 * 
 * Features:
 * - Proper HTML table semantics for accessibility
 * - Responsive design with breakpoint-based column visibility
 * - Consistent styling that matches the application's design system
 * - Support for all standard table elements (header, body, footer, caption)
 * - Customizable through className props
 */

import * as React from "react";
import { cn } from "src/utils/tailwind";

/**
 * Breakpoint mapping for responsive cell visibility
 * 
 * Defines Tailwind classes that control when table cells become visible
 * based on screen size breakpoints. Used by TableHead and TableCell components
 * to implement responsive tables where columns can be hidden on smaller screens.
 */
const breakpointCell = {
  'sm': 'sm:table-cell',    // Visible at small screens and up
  'md': 'md:table-cell',    // Visible at medium screens and up
  'fold': 'fold:table-cell', // Visible at fold breakpoint and up (custom breakpoint)
  'lg': 'lg:table-cell',    // Visible at large screens and up
  'xl': 'xl:table-cell',    // Visible at extra large screens and up
  'xl2': 'xl2:table-cell'   // Visible at 2xl screens and up
}

/**
 * Table Component
 * 
 * The root table component that wraps the HTML table element with a scrollable container.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param props - Standard HTML table attributes
 * @param ref - Forwarded ref to access the underlying table element
 * 
 * @example
 * <Table>
 *   <TableHeader>...</TableHeader>
 *   <TableBody>...</TableBody>
 * </Table>
 */
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

/**
 * TableHeader Component
 * 
 * Container for table header rows and cells.
 * 
 * @param className - Optional custom classes
 * @param props - Standard HTML thead attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * <TableHeader>
 *   <TableRow>
 *     <TableHead>Name</TableHead>
 *     <TableHead>Status</TableHead>
 *   </TableRow>
 * </TableHeader>
 */
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn("border-b border-ui-border-default", className)}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

/**
 * TableBody Component
 * 
 * Container for table rows and data cells.
 * 
 * @param className - Optional custom classes
 * @param props - Standard HTML tbody attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * <TableBody>
 *   <TableRow>
 *     <TableCell>Example Data</TableCell>
 *     <TableCell>Active</TableCell>
 *   </TableRow>
 * </TableBody>
 */
const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

/**
 * TableFooter Component
 * 
 * Container for table footer rows and cells.
 * 
 * @param className - Optional custom classes
 * @param props - Standard HTML tfoot attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * <TableFooter>
 *   <TableRow>
 *     <TableCell colSpan={2}>Totals</TableCell>
 *   </TableRow>
 * </TableFooter>
 */
const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

/**
 * TableRow Component
 * 
 * A table row container.
 * 
 * @param className - Optional custom classes
 * @param props - Standard HTML tr attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * <TableRow>
 *   <TableCell>Data 1</TableCell>
 *   <TableCell>Data 2</TableCell>
 * </TableRow>
 */
const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors data-[state=selected]:bg-ui-background-active",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

/**
 * TableHead Component
 * 
 * A table header cell with responsive visibility options.
 * 
 * @param className - Optional custom classes
 * @param minBreakpoint - Minimum breakpoint at which this column becomes visible
 *                      (hidden below this breakpoint)
 * @param props - Standard HTML th attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * // Always visible header cell
 * <TableHead>Name</TableHead>
 * 
 * @example
 * // Header cell only visible on md screens and up
 * <TableHead minBreakpoint="md">Details</TableHead>
 */
const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { minBreakpoint?: keyof typeof breakpointCell }
>(({ className, minBreakpoint, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Base styling for all header cells
      "h-12 px-4 text-left align-middle font-medium text-ui-surface-sub [&:has([role=checkbox])]:pr-0",
      // Conditional responsive visibility based on minBreakpoint
      minBreakpoint && `hidden ${breakpointCell[minBreakpoint]}`,
      // Custom classes
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

/**
 * TableCell Component
 * 
 * A standard table data cell with responsive visibility options.
 * 
 * @param className - Optional custom classes
 * @param minBreakpoint - Minimum breakpoint at which this cell becomes visible
 *                      (hidden below this breakpoint)
 * @param props - Standard HTML td attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * // Always visible cell
 * <TableCell>John Smith</TableCell>
 * 
 * @example
 * // Cell only visible on lg screens and up
 * <TableCell minBreakpoint="lg">Additional information</TableCell>
 */
const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { minBreakpoint?: keyof typeof breakpointCell  }
>(({ className, minBreakpoint, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // Base styling for all cells
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      // Conditional responsive visibility based on minBreakpoint
      minBreakpoint && `hidden ${breakpointCell[minBreakpoint]}`,
      // Custom classes
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

/**
 * TableCaption Component
 * 
 * A caption for the table, providing a title or description.
 * 
 * @param className - Optional custom classes
 * @param props - Standard HTML caption attributes
 * @param ref - Forwarded ref
 * 
 * @example
 * <Table>
 *   <TableCaption>List of users and their status</TableCaption>
 *   ...
 * </Table>
 */
const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-ui-surface-sub", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

/**
 * Export all table components
 * 
 * Usage example:
 * 
 * ```tsx
 * <Table>
 *   <TableCaption>List of recent transactions</TableCaption>
 *   <TableHeader>
 *     <TableRow>
 *       <TableHead>Date</TableHead>
 *       <TableHead>Description</TableHead>
 *       <TableHead minBreakpoint="md">Category</TableHead>
 *       <TableHead>Amount</TableHead>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>2023-07-12</TableCell>
 *       <TableCell>Coffee Shop</TableCell>
 *       <TableCell minBreakpoint="md">Food & Drink</TableCell>
 *       <TableCell>$4.98</TableCell>
 *     </TableRow>
 *     Add more rows as needed 
 *   </TableBody>
 *   <TableFooter>
 *     <TableRow>
 *       <TableCell colSpan={3}>Total</TableCell>
 *       <TableCell>$142.65</TableCell>
 *     </TableRow>
 *   </TableFooter>
 * </Table>
 * ```
 */
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
