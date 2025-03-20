/**
 * FAQ Accordion Item Component
 * 
 * A reusable accordion item component used in the FAQ section. Each item represents
 * a question-answer pair that can be expanded/collapsed through user interaction.
 * 
 * Key features:
 * - Accessible keyboard navigation
 * - Toggle state management
 * - Custom styling support through class injection
 * - Support for both text and custom content
 * - Visual indicators for expanded/collapsed states
 * 
 * The component uses CSS modules for styling and supports responsive design
 * through the associated SCSS module.
 */

import styles from "./index.module.scss";
import minusIcon from "../../../assets/icons/li_minus.svg";
import plusIcon from "../../../assets/icons/li_plus.svg";
import {ReactNode} from "react";
import classNames from "classnames";

/**
 * AccordionItem Props Interface
 * 
 * @property title - The question or header text to display
 * @property text - The answer text (used when children prop is not provided)
 * @property isActive - Whether this accordion item is currently expanded
 * @property id - Unique identifier for the accordion item
 * @property onItemClick - Callback function when the header is clicked
 * @property sectionCls - Optional CSS class for the section container
 * @property itemCls - Optional CSS class for the header container
 * @property children - Optional custom content to render instead of text
 */
interface Props {
  title: string;
  text: string;
  isActive: boolean;
  id: string;
  onItemClick: (id: string) => void;
  sectionCls?: string;
  itemCls?: string;
  children?: ReactNode;
}

/**
 * Accordion Item Component
 * 
 * Renders an individual accordion item with expandable/collapsible content.
 * Supports both simple text content and custom child components.
 * 
 * @param props - Component properties (see Props interface)
 * @returns A section element containing the accordion item
 */
const AccordionItem = ({ 
  title, 
  text, 
  id, 
  isActive, 
  onItemClick, 
  sectionCls, 
  itemCls, 
  children 
}: Props) => {
  /**
   * Handles click events on the accordion header
   * Toggles the active state by either clearing the active ID (collapse)
   * or setting it to this item's ID (expand)
   */
  const onHeaderClick = () => {
    if (isActive) {
      onItemClick("");  // Collapse: clear active ID
    } else {
      onItemClick(id); // Expand: set this item as active
    }
  };

  return (
    <section
      className={classNames(styles.accordionItem, sectionCls)}
      data-testid="accordion"
    >
      {/* Interactive header area with accessibility attributes */}
      <div
        id={id}
        role="button"
        tabIndex={0}
        onClick={onHeaderClick}
        className={classNames(styles.accordionHeader, itemCls)}
      >
        <h2 className={styles.faqTitle}>{title}</h2>
        {/* Toggle indicator showing plus/minus based on active state */}
        <span className={styles.button}>
          <img src={isActive ? minusIcon : plusIcon} alt="plus" />
        </span>
      </div>

      {/* Conditional content rendering based on active state */}
      { isActive 
        ? children !== undefined
          ? <div className={styles.accordionBody}>{children}</div>  // Render custom content if provided
          : <div className={styles.accordionBody}>{text}</div>      // Otherwise render text content
        : <></>  // Render nothing when collapsed
      }
    </section>
  );
};

export default AccordionItem;
