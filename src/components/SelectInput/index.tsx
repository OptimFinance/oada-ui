/**
 * SelectInput Component
 * 
 * A custom dropdown/select input control that displays a selected option
 * and can reveal a dropdown menu of choices when clicked.
 * 
 * This component handles the main container and trigger button, while
 * the dropdown options are passed as children for maximum flexibility.
 * The component doesn't manage state internally - the open/closed state
 * and selection logic must be handled by the parent component.
 */

import { FC, PropsWithChildren } from "react";
import classNames from "classnames";
import arrow from "../../assets/icons/chevron-down.svg";
import styles from "./index.module.scss";

/**
 * Props for the SelectInput component
 * 
 * @property text - The text to display in the select input (typically the currently selected option)
 * @property onClick - Handler function called when the select input is clicked (to toggle dropdown)
 * @property children - React nodes to render as the dropdown content (typically an options list)
 */
interface Props extends PropsWithChildren {
  text: string;
  onClick: () => void;
}

/**
 * SelectInput Component
 * 
 * Renders a custom select input with a dropdown menu.
 * The dropdown visibility is controlled by the parent component.
 * 
 * @example
 * // Basic usage with state management in parent
 * const [isOpen, setIsOpen] = useState(false);
 * const [selected, setSelected] = useState('Select an option');
 * 
 * <SelectInput 
 *   text={selected} 
 *   onClick={() => setIsOpen(!isOpen)}
 * >
 *   {isOpen && (
 *     <div className={styles.option}>
 *       <ul>
 *         <li onClick={() => { setSelected('Option 1'); setIsOpen(false); }}>
 *           Option 1
 *         </li>
 *         <li onClick={() => { setSelected('Option 2'); setIsOpen(false); }}>
 *           Option 2
 *         </li>
 *       </ul>
 *     </div>
 *   )}
 * </SelectInput>
 */
const SelectInput: FC<Props> = ({ text, children, onClick }) => {
  return (
    <div className={styles.wrapper}>
      {/* Clickable select input that displays the current selection */}
      <div
        className={classNames([styles.container])}
        onClick={onClick}
        role="presentation"
      >
        {/* Display text (selected option) */}
        <p>{text}</p>
        
        {/* Dropdown indicator arrow */}
        <img src={arrow} alt="arrow-down" />
      </div>
      
      {/* Dropdown content (conditionally rendered by parent) */}
      {children}
    </div>
  );
};

export default SelectInput;
