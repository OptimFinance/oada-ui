/**
 * Container Component
 * 
 * A layout component that provides consistent horizontal padding and maximum width
 * for content across the application. This component helps maintain a consistent
 * layout and proper content width across different screen sizes.
 * 
 * Features:
 * - Maximum width constraint to prevent overly wide content on large screens
 * - Responsive horizontal padding that adjusts based on screen size
 * - Consistent vertical padding
 * - Automatic horizontal centering with mx-auto
 * - Renders as a semantic <main> element for proper document structure
 * - Customizable with additional classes
 */

import { cn } from "src/utils/tailwind";

/**
 * Container Component Props
 * 
 * @property className - Optional additional CSS classes to apply to the container
 * @property children - React nodes to be rendered inside the container
 */
export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <main 
      className={cn(
        // Base container styles with responsive adjustments
        "max-w-5xl px-4 lg:px-0 py-12 mx-auto", 
        // Additional classes passed via props
        className
      )}
    >
      {children}
    </main>
  );
};
