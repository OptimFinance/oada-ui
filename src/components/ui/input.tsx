/**
 * Input Component
 * 
 * A reusable, styled input component with proper accessibility support.
 * This component extends the native HTML input element with consistent styling
 * that matches the application's design system.
 * 
 * Features:
 * - Consistent styling with the application's design language
 * - Proper focus states for accessibility
 * - Visual feedback for disabled states
 * - Full support for all native input attributes and behaviors
 * - Customizable through className prop with Tailwind CSS
 */

import { cn } from "src/utils/tailwind";

import * as React from "react";

/**
 * Input Props Interface
 * 
 * Extends the native HTML input element props to maintain full compatibility
 * with standard input attributes like type, placeholder, value, onChange, etc.
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input Component
 * 
 * A styled input field with consistent appearance and behavior.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param type - Input type (text, password, email, etc.)
 * @param props - All other standard HTML input attributes
 * @param ref - Forwarded ref to access the underlying input element
 * 
 * @example
 * // Basic usage
 * <Input placeholder="Enter your name" />
 * 
 * @example
 * // With type and additional props
 * <Input 
 *   type="email" 
 *   placeholder="Enter your email" 
 *   required 
 *   onChange={handleChange} 
 * />
 * 
 * @example
 * // With custom styling
 * <Input className="w-full md:w-80" placeholder="Search..." />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styling with consistent padding, border, and text color
          "flex px-4 py-[9px] border border-ui-border-sub bg-ui-background-sub text-ui-base-white rounded-[41px]",
          // File input specific styling
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // Placeholder styling
          "placeholder:text-ui-surface-sub",
          // Focus state styling for accessibility
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ui-border-hover focus-visible:ring-offset-1",
          // Disabled state styling
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Additional custom classes
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
