import classNames from "classnames";
import React, { ReactNode } from "react";
import { Info } from "../Info";
import styles from "./index.module.scss";

interface LabelItemProps {
  label?: string;
  className?: string;
  info?: string;
  children?: ReactNode;
}

const LabelItemWrapper: React.FC<LabelItemProps> = ({
  label,
  info,
  children,
  className,
}) => {
  return (
    <div className={classNames(styles.container, className)}>
      <p className={styles.label}>
        {label} {info && <Info label={info} />}
      </p>
      {children}
    </div>
  );
};

export default LabelItemWrapper;
