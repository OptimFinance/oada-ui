import { FC, PropsWithChildren } from "react";
import classNames from "classnames";
import arrow from "../../assets/icons/chevron-down.svg";
import styles from "./index.module.scss";

interface Props extends PropsWithChildren {
  text: string;
  onClick: () => void;
}

const SelectInput: FC<Props> = ({ text, children, onClick }) => {
  return (
    <div className={styles.wrapper}>
      <div
        className={classNames([styles.container])}
        onClick={onClick}
        role="presentation"
      >
        <p>{text}</p>
        <img src={arrow} alt="arrow-down" />
      </div>
      {children}
    </div>
  );
};

export default SelectInput;
