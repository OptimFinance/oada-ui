import React, { useState } from "react";
import { ReactSVG } from "react-svg";
import minus from '../../assets/icons/li_minus.svg';
import plus from '../../assets/icons/li_plus.svg';
import styles from './index.module.scss';
import classNames from "classnames";

type Props = {
  step?: number
};
export const Amount = ({ step = 1 }: Props) => {
  const [value, setValue] = useState(0);
  const decrement = () => { setValue(Math.round((value - step + Number.EPSILON) * 100) / 100) };
  const increment = () => { setValue(Math.round((value + step + Number.EPSILON) * 100) / 100) };

  return <span className={styles.container}>
    <button className={classNames(styles.button, styles.decrement)} onClick={decrement}><ReactSVG src={minus} /></button>
    <span className={styles.value}>{value}</span>
    <button className={classNames(styles.button, styles.increment)} onClick={increment}><ReactSVG src={plus} /></button>
  </span>
}
