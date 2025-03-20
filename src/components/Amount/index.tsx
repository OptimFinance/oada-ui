/**
 * Amount Component
 * 
 * A numeric input component with increment/decrement buttons.
 * Allows users to easily adjust a numeric value by a configurable step amount.
 */

import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import minus from '../../assets/icons/li_minus.svg';
import plus from '../../assets/icons/li_plus.svg';
import styles from './index.module.scss';
import classNames from "classnames";

type Props = {
  step?: number  // Optional prop to specify the increment/decrement step size
};

/**
 * Amount Component
 * 
 * Renders a numeric input with plus and minus buttons to increment/decrement the value.
 * 
 * @param props.step - The amount to increment/decrement by (defaults to 1)
 */
export const Amount = ({ step = 1 }: Props) => {
  // Track the current numeric value
  const [value, setValue] = useState(0);
  
  /**
   * Decreases the current value by the step amount
   * Uses Math.round with Number.EPSILON to handle floating point precision issues
   */
  const decrement = () => { 
    setValue(Math.round((value - step + Number.EPSILON) * 100) / 100) 
  };
  
  /**
   * Increases the current value by the step amount
   * Uses Math.round with Number.EPSILON to handle floating point precision issues
   */
  const increment = () => { 
    setValue(Math.round((value + step + Number.EPSILON) * 100) / 100) 
  };

  return <span className={styles.container}>
    {/* Decrement button with minus icon */}
    <button className={classNames(styles.button, styles.decrement)} onClick={decrement}><ReactSVG src={minus} /></button>
    {/* Display the current value */}
    <span className={styles.value}>{value}</span>
    {/* Increment button with plus icon */}
    <button className={classNames(styles.button, styles.increment)} onClick={increment}><ReactSVG src={plus} /></button>
  </span>
}
