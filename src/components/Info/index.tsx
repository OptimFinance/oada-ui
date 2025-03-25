/**
 * Info Component
 * 
 * A tooltip component that displays additional information when users hover over an info icon.
 * Features include:
 * - Delayed appearance to prevent accidental triggering
 * - Multiple positioning options (right or top)
 * - Accessible hover interaction
 * - Consistent styling with the application design system
 */

import { useState } from 'react'
import { ReactSVG } from "react-svg";
import icon from '../../assets/icons/li_info.svg';
import styles from './index.module.scss';
import classNames from "classnames";

/**
 * Props for the Info component
 * 
 * @property label - The text content to display in the tooltip
 * @property position - Where to position the tooltip relative to the icon ("right" or "top")
 * @property className - Optional additional CSS classes for the container
 */
type Props = {
  label?: string
  position?: "right" | "top"
  className?: string
};

/**
 * Info Component
 * 
 * Renders an info icon that, when hovered, displays a tooltip with additional information.
 * The tooltip has a slight delay before appearing to prevent accidental triggers during normal page interaction.
 * 
 * @example
 * // Basic usage
 * <Info label="This is helpful information" />
 * 
 * // With custom position
 * <Info label="Appears above the icon" position="top" />
 * 
 * // With additional styling
 * <Info label="Custom styled tooltip" className="custom-tooltip" />
 */
export const Info = ({ label, className, position = "right" }: Props) => {
  // Track visibility state of the tooltip
  const [isVisible, setVisible] = useState(false);
  
  // Reference to the timeout for delayed appearance
  let timerId = 0;

  /**
   * Show the tooltip after a short delay (200ms)
   * This prevents the tooltip from appearing during casual mouse movements
   */
  const onShow = () => {
    timerId = setTimeout(() => {
      setVisible(true)
    }, 200) as any // Cast to any due to setTimeout returning different types in different environments
  }

  /**
   * Hide the tooltip immediately and clear any pending timeout
   * This ensures the tooltip disappears promptly when the user moves away
   */
  const onHide = () => {
    clearTimeout(timerId)
    setVisible(false)
  }

  return (
    <span
      className={classNames(styles.container, className)}
      onMouseEnter={onShow}
      onMouseLeave={onHide}
    >
      {
        // Only render the tooltip if we have content and should be showing it
        !!label && !!isVisible &&
        <span className={classNames(styles.popup, styles[position])}>
          {label}
        </span>
      }
      {/* The info icon that triggers the tooltip */}
      <ReactSVG className={styles.icon} src={icon} />
    </span>
  )
}
