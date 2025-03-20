/**
 * LabelItemContainer Component
 * 
 * A reusable wrapper component that provides a consistent layout for labeled UI elements.
 * Features:
 * - Displays a label with optional tooltip info
 * - Wraps any children components
 * - Consistent styling with the application design system
 * 
 * This component is useful for form fields, settings items, or any UI element
 * that requires a descriptive label with consistent spacing.
 */

import classNames from "classnames";
import React, { ReactNode } from "react";
import { Info } from "../Info";
import styles from "./index.module.scss";

/**
 * Props for the LabelItemWrapper component
 * 
 * @property label - Optional text to display as the label
 * @property className - Optional additional CSS classes for customization
 * @property info - Optional tooltip text to display via an Info component
 * @property children - Child components to render below the label
 */
interface LabelItemProps {
  label?: string;
  className?: string;
  info?: string;
  children?: ReactNode;
}

/**
 * LabelItemWrapper Component
 * 
 * Wraps content with a consistently styled label and optional info tooltip.
 * 
 * @example
 * // Basic usage with a label
 * <LabelItemWrapper label="Settings">
 *   <SomeComponent />
 * </LabelItemWrapper>
 * 
 * // With tooltip info
 * <LabelItemWrapper label="API Key" info="Your secret API key for authentication">
 *   <InputBox value={apiKey} onChange={handleChange} />
 * </LabelItemWrapper>
 */
const LabelItemWrapper: React.FC<LabelItemProps> = ({
  label,
  info,
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.container, className)}>
      {/* Label row with optional Info tooltip */}
      <p className={styles.label}>
        {label} {info && <Info label={info} />}
      </p>
      {/* Child components rendered below the label */}
      {children}
    </div>
  );
};

export default LabelItemWrapper;
