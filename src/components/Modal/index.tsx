/**
 * Modal Component
 * 
 * A customizable overlay dialog that displays content above the main UI.
 * Features:
 * - Controlled visibility via the 'open' prop
 * - Optional blur backdrop
 * - Customizable width and height
 * - Close button with callback function
 * - Click outside to close behavior
 * 
 * Used for displaying important information, forms, or interactions
 * that require user attention before continuing with the main UI.
 */

import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";
import { ReactSVG } from "react-svg";
import close from "../../assets/icons/close.svg";
import { cn } from "src/utils/tailwind";

/**
 * Props for the Modal component
 * 
 * @property open - Controls whether the modal is displayed
 * @property onClose - Optional callback function when modal is closed
 * @property blur - Whether to apply a blur effect to the backdrop (default: true)
 * @property width - Optional custom width for the modal (in pixels)
 * @property height - Optional custom height for the modal (in pixels)
 * @property className - Optional additional CSS classes
 * @property children - Content to be displayed inside the modal
 */
interface Props extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
  blur?: boolean;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Modal Component
 * 
 * Uses fixed positioning to cover the entire screen.
 * In complex scenarios, might need to use a portal for rendering.
 * 
 * @example
 * // Basic usage
 * <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
 *   <h2>Modal Content</h2>
 *   <p>This is the modal content.</p>
 * </Modal>
 * 
 * // Custom sizing
 * <Modal 
 *   open={isModalOpen} 
 *   onClose={() => setIsModalOpen(false)} 
 *   width={800}
 *   height={600}
 * >
 *   <h2>Large Modal</h2>
 *   <p>This is a larger modal window.</p>
 * </Modal>
 */
export const Modal: FC<Props> = ({
  blur = true,
  open = true,
  children,
  onClose,
  width,
  height,
  className,
}) => {
  // Track the open state internally to handle animations if needed
  const [isPopupOpen, setPopupState] = useState<boolean>(false);

  // Sync internal state with the open prop
  useEffect(() => {
    setPopupState(open);
  }, [open]);

  /**
   * Handler to close the modal
   * Calls the onClose callback if provided
   */
  const togglePopup = () => {
    onClose && onClose();
  };
  
  /**
   * Prevents click events from propagating to parent elements
   * This allows clicking inside the modal without closing it
   */
  const noop: React.EventHandler<React.MouseEvent> = (e) => {
    e.stopPropagation();
  };

  return (
    <div>
      {/* Backdrop overlay - covers the entire viewport */}
      <div
        className={classNames(
          styles.backdrop,
          { [styles.blur]: blur },
          { [styles.hidden]: !isPopupOpen },
          "bg-ui-background-sub backdrop-blur overflow-auto py-6"
        )}
        onMouseDown={togglePopup} // Close when clicking the backdrop
      >
        {/* 
          Modal popup container
          Styled with Tailwind CSS classes for consistent design
        */}
        <div
          className={cn(
            "bg-ui-base-background border border-ui-border-sub p-6 w-[480px] rounded-2xl relative my-6 max-h-[90%] overflow-auto",
            className
          )}
          onMouseDown={noop} // Prevent clicks from closing when clicking inside
          style={{ width, height }} // Apply custom dimensions if provided
        >
          {/* Render close button if onClose handler is provided */}
          {onClose && (
            <ReactSVG
              src={close}
              className={styles.close}
              onClick={togglePopup}
            />
          )}
          {/* Render the modal content */}
          {children}
        </div>
      </div>
    </div>
  );
};
