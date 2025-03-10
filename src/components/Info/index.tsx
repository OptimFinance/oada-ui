import { useState } from 'react'
import { ReactSVG } from "react-svg";
import icon from '../../assets/icons/li_info.svg';
import styles from './index.module.scss';
import classNames from "classnames";

type Props = {
  label?: string
  position?: "right" | "top"
  className?: string
};

export const Info = ({ label, className, position = "right" }: Props) => {
  const [isVisible, setVisible] = useState(false);
  let timerId = 0;

  const onShow = () => {
    timerId = setTimeout(() => {
      setVisible(true)
    }, 200) as any
  }

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
        !!label && !!isVisible &&
        <span className={classNames(styles.popup, styles[position])}>
          {label}
        </span>
      }
      <ReactSVG className={styles.icon} src={icon} />
    </span>
  )
}
