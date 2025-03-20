/**
 * Dropdown Component
 * 
 * A simple, flexible dropdown menu container that can be shown or hidden based on the 'open' prop.
 * This component handles only the dropdown container itself - it should be paired with a trigger
 * element (button, icon, etc.) that controls the 'open' state.
 * 
 * The component is absolutely positioned, so it should be placed within a relatively
 * positioned parent element to control its placement.
 */

import React, { FC, PropsWithChildren, useRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";
import { useOutsideClick } from "src/utils/outsideHook";

/**
 * Props for the Dropdown component
 * 
 * @property open - Boolean flag that controls whether the dropdown is visible
 * @property children - Content to be rendered inside the dropdown
 */
interface Props extends PropsWithChildren {
  open: boolean;
}

/**
 * Dropdown Component
 * 
 * Renders a dropdown container with the provided children when the 'open' prop is true.
 * 
 * Note: This component only handles the dropdown itself, not the trigger element.
 * The parent component should manage the open/close state and provide a trigger element.
 * 
 * @example
 * // Basic usage with a button trigger
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * return (
 *   <div style={{ position: 'relative' }}>
 *     <button onClick={() => setIsOpen(!isOpen)}>Open Menu</button>
 *     <Dropdown open={isOpen}>
 *       <ul>
 *         <li>Option 1</li>
 *         <li>Option 2</li>
 *       </ul>
 *     </Dropdown>
 *   </div>
 * );
 */
export const Dropdown: FC<Props> = ({ children, open }) => {
  // Reference to the dropdown container for potential outside click handling
  // Note: useOutsideClick is imported but not currently used
  const containerRef = useRef(null);

  return (
    <>
      {/* Render dropdown only when 'open' is true */}
      {open && (
        <div className={classNames(styles.dropdown, { [styles.open]: open })}>
          {children}
        </div>
      )}
    </>
  );
};
