import React, { FC } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";

type Props = {
  children: any;
  icon?: boolean;
  className?: string;
  radio?: boolean;
  name?: string;
  size?: "xl" | "xxl" | "md" | "sm" | "lg";
  clear?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  secondary?: boolean;
  white?: boolean;
  outlined?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
};

export const Button: FC<Props> = ({
  children,
  icon,
  className,
  radio,
  name,
  size,
  clear,
  fullWidth,
  onClick = () => {},
  secondary,
  white,
  outlined,
  ...rest
}) => {
  if (radio)
    return (
      <label>
        <input className={styles.radio} type="radio" name={name} />
        <span className={classNames(styles.button, className)}>{children}</span>
      </label>
    );

  return (
    <button
      onClick={onClick}
      className={classNames(
        styles.button,
        { [styles.icon]: icon },
        { [styles[size!]]: size },
        { [styles.clear]: clear },
        { [styles.secondary]: secondary },
        { [styles.white]: white },
        { [styles.outlined]: outlined },
        { [styles.fullWidth]: fullWidth },
        { [styles.primary]: className?.includes("primary") },
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
