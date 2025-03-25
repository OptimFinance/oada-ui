/**
 * ProductCardsWrapper Component
 * 
 * A layout container specifically designed for displaying product cards in a responsive grid.
 * This component handles the arrangement of product cards with appropriate spacing and
 * responsive behavior across different screen sizes.
 * 
 * Features:
 * - Responsive grid layout that adjusts columns based on screen size:
 *   - 1 column on mobile screens (default)
 *   - 2 columns on small screens (sm breakpoint)
 *   - 3 columns on large screens (lg breakpoint)
 * - Consistent spacing between cards with the gap utility
 * - Customizable through className prop with Tailwind CSS
 * - Bottom margin to create separation from subsequent content
 */

import { cn } from "src/utils/tailwind";

/**
 * ProductCardsWrapper Component
 * 
 * @param children - The product card components to be displayed in the grid
 * @param className - Optional custom classes to extend or override default styling
 * 
 * @example
 * // Basic usage with product cards
 * <ProductCardsWrapper>
 *   <ProductCard product={product1} />
 *   <ProductCard product={product2} />
 *   <ProductCard product={product3} />
 * </ProductCardsWrapper>
 * 
 * @example
 * // With custom className to modify the layout
 * <ProductCardsWrapper className="gap-6 mb-16">
 *   <ProductCard product={product1} />
 *   <ProductCard product={product2} />
 * </ProductCardsWrapper>
 */
export const ProductCardsWrapper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        // Responsive grid layout with breakpoints
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", 
        // Consistent spacing between cards
        "gap-4",
        // Bottom margin for separation from subsequent content
        "mb-10",
        // Additional custom classes
        className
      )}
    >
      {children}
    </div>
  );
};
