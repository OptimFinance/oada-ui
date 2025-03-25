/**
 * Typography Component System
 * 
 * A flexible text component built with class-variance-authority (CVA) for consistent
 * typography throughout the application. This component provides a standardized way
 * to apply text styling with configurable size, tone, and weight variants.
 * 
 * Features:
 * - Consistent text styling across the application
 * - Configurable text size, color tone, and font weight
 * - Type-safe props using VariantProps from class-variance-authority
 * - Extensible with custom className props
 */

import * as React from "react";
import { cn } from "src/utils/tailwind";
import { VariantProps, cva } from "class-variance-authority";

/**
 * Text Variant Configuration
 * 
 * Defines the available variants for the Text component using CVA.
 * Base style applies text-sm to all text elements by default.
 * 
 * Variants include:
 * - size: Controls font size and line height
 * - tone: Sets the text color
 * - weight: Determines the font weight
 */
const textVariants = cva("text-sm", {
  variants: {
    size: {
      xlarge: "text-[24px] leading-[32px]", // Large headings
      large: "text-[18px] leading-[24px]",  // Subheadings
      medium: "text-[16px] leading-[24px]", // Standard body text
      small: "text-[14px] leading-[20px]",  // Secondary text
      xsmall: "text-[12px] leading-[16px]", // Caption text
    },
    tone: {
      muted: "text-ui-surface-sub",   // Less prominent text
      default: "text-ui-white",       // Primary text color
    },
    weight: {
      semibold: "font-semibold",  // 600 weight
      medium: "font-medium",      // 500 weight
      normal: "font-normal",      // 400 weight
    },
  },
  defaultVariants: {
    size: "small",     // Default to small text (14px)
    tone: "default",   // Default to primary text color
    weight: "normal",  // Default to normal weight
  },
});

/**
 * Text Component Props Interface
 * 
 * Extends standard paragraph HTML attributes with variant props from textVariants.
 * This provides type safety for the component props while allowing all standard
 * HTML paragraph attributes.
 */
export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {}

/**
 * Text Component
 * 
 * A versatile paragraph component for displaying text with consistent styling.
 * Renders as a <p> element with styles applied based on the provided variants.
 * 
 * @param className - Optional custom classes to extend or override default styling
 * @param size - Controls the font size and line height (xlarge, large, medium, small, xsmall)
 * @param tone - Sets the text color (muted, default)
 * @param weight - Determines the font weight (semibold, medium, normal)
 * @param props - Other props passed to the underlying paragraph element
 * 
 * @example
 * // Basic usage
 * <Text>Default text</Text>
 * 
 * // With variants
 * <Text size="large" weight="semibold">Section heading</Text>
 * <Text tone="muted" size="xsmall">Small helper text</Text>
 * 
 * // With custom className
 * <Text className="mt-4">Text with margin top</Text>
 */
export const Text = ({
  className,
  size,
  tone,
  weight,
  ...props
}: TextProps) => {
  return (
    <p
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
};
