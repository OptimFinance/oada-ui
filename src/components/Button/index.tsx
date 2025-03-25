/**
 * Button Component
 * 
 * A versatile button component with multiple style variations, sizes, and behaviors.
 * Supports standard buttons, icon buttons, radio button groups, and various visual styles.
 */

import React, { FC } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

/**
 * Button component props
 * 
 * @property children - Content to display inside the button
 * @property icon - If true, applies icon button styling (compact, square)
 * @property className - Optional additional CSS classes
 * @property radio - If true, renders as a radio input + label instead of a button
 * @property name - Name attribute for radio inputs (required when radio=true)
 * @property size - Size variant (sm, md, lg, xl, xxl)
 * @property clear - If true, applies transparent styling with a subtle border
 * @property onClick - Click handler function
 * @property secondary - If true, applies secondary styling (light gray background)
 * @property white - If true, applies white styling (white background, dark text)
 * @property outlined - If true, applies outlined styling (transparent with border)
 * @property fullWidth - If true, button takes full width of its container
 * @property disabled - If true, button is disabled and non-interactive
 */
type Props = {
  children: any;
  icon?: boolean;
  className?: string;
  radio?: boolean;
  name?: string;
  size?: "xl" | "xxl" | "md" | "sm" | "lg";
  clear?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  secondary?: boolean;
  white?: boolean;
  outlined?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
};

/**
 * Button Component
 * 
 * Renders either a standard button or a radio button based on props.
 * Combines multiple styling variations based on provided props.
 * 
 * Usage examples:
 * - Standard button: <Button>Click me</Button>
 * - Primary button: <Button className="primary">Submit</Button>
 * - Icon button: <Button icon><SomeIcon /></Button>
 * - White outlined button: <Button white outlined>Cancel</Button>
 * - Radio button: <Button radio name="options">Option 1</Button>
 */
export const Button: FC<Props> = ({
  children,
  icon,
  className,
  radio,
  name,
  size,
  clear,
  fullWidth,
  onClick = () => {}, // Default empty function if onClick not provided
  secondary,
  white,
  outlined,
  ...rest // Capture any additional props (like disabled) to pass to the element
}) => {
  // Special case: Radio button implementation
  // Renders a hidden radio input with a styled label
  if (radio)
    return (
      <label>
        {/* Hidden radio input for functionality */}
        <input className={styles.radio} type="radio" name={name} />
        {/* Visible styled "button" which is actually a span */}
        <span className={classNames(styles.button, className)}>{children}</span>
      </label>
    );

  // Standard button implementation
  return (
    <button
      onClick={onClick}
      className={classNames(
        styles.button,                             // Base button styles
        { [styles.icon]: icon },                   // Icon button styling if icon=true
        { [styles[size!]]: size },                 // Size variant if specified
        { [styles.clear]: clear },                 // Clear styling if clear=true
        { [styles.secondary]: secondary },         // Secondary styling if secondary=true
        { [styles.white]: white },                 // White styling if white=true
        { [styles.outlined]: outlined },           // Outlined styling if outlined=true
        { [styles.fullWidth]: fullWidth },         // Full width if fullWidth=true
        { [styles.primary]: className?.includes("primary") }, // Primary styling if className contains 'primary'
        className                                  // Any additional custom classes
      )}
      {...rest} // Spread remaining props (including disabled) to the button
    >
      {children}
    </button>
  );
};
