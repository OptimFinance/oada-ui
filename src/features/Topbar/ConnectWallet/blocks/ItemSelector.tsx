import classNames from "classnames";
import React from "react";
import { Info } from "src/components/Info";
import styles from "../index.module.scss";

interface ItemSelectorProps {
  items: string[];
  labels?: string[];
  onSelect: (item: string, index: number) => void;
  info?: string;
  title?: string;
  selectedItem: string;
  className?: string;
}

export const ItemSelector: React.FC<ItemSelectorProps> = (props) => {
  const { items, labels, onSelect, info, selectedItem, title } = props;

  return (
    <div>
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
            <p className={styles.title}>{item}</p>
            {labels && <p className={styles.label}>{labels[index]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
