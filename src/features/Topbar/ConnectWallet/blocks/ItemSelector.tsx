import classNames from "classnames";
import React from "react";
import { Info } from "src/components/Info";
import styles from "../index.module.scss";

/**
 * Interface for the ItemSelector component props
 * 
 * @interface ItemSelectorProps
 * @property {string[]} items - Array of items to be displayed as selectable options
 * @property {string[]} [labels] - Optional array of secondary labels for each item, displayed below the main text
 * @property {(item: string, index: number) => void} onSelect - Callback function triggered when an item is selected
 * @property {string} [info] - Optional tooltip text providing additional information about the selector
 * @property {string} [title] - Optional header text displayed above the selector
 * @property {string} selectedItem - Currently selected item value
 * @property {string} [className] - Optional CSS class name for additional styling
 */
interface ItemSelectorProps {
  items: string[];
  labels?: string[];
  onSelect: (item: string, index: number) => void;
  info?: string;
  title?: string;
  selectedItem: string;
  className?: string;
}

/**
 * ItemSelector Component
 * 
 * A reusable selection component that displays a list of items in a grid layout.
 * Each item can be clicked to trigger a selection, and items can optionally include
 * secondary labels and tooltip information.
 * 
 * Features:
 * - Grid layout for item display
 * - Optional title with information tooltip
 * - Visual indication of selected item
 * - Optional secondary labels for each item
 * - Flexible styling through CSS modules
 * 
 * Usage:
 * ```tsx
 * <ItemSelector
 *   items={['Option 1', 'Option 2']}
 *   labels={['Label 1', 'Label 2']}
 *   selectedItem="Option 1"
 *   onSelect={(item, index) => handleSelection(item, index)}
 *   title="Select an Option"
 *   info="Additional information about these options"
 * />
 * ```
 */
export const ItemSelector: React.FC<ItemSelectorProps> = (props) => {
  const { items, labels, onSelect, info, selectedItem, title } = props;

  return (
    <div>
      {/* Title section with optional info tooltip */}
      <div className="flex">
        {title && (
          <p className={styles.title}>
            {title}
            {info && (
              <label className={styles.ml_10}>
                <Info label={info} />
              </label>
            )}
          </p>
        )}
      </div>

      {/* Grid container for selectable items */}
      <div className={styles.itemsContainer}>
        {items.map((item: string, index: number) => (
          <div
            key={index}
            className={classNames(
              styles.box,
              selectedItem === item && styles.active
            )}
            onClick={() => onSelect(item, index)}
          >
            {/* Primary item text */}
            <p className={styles.title}>{item}</p>
            {/* Optional secondary label */}
            {labels && <p className={styles.label}>{labels[index]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
