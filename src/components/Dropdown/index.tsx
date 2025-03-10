import React, { FC, PropsWithChildren, useRef } from "react";
import styles from "./index.module.scss";
import classNames from "classnames";
import { useOutsideClick } from "src/utils/outsideHook";

interface Props extends PropsWithChildren {
  open: boolean;
}

export const Dropdown: FC<Props> = ({ children, open }) => {
  const containerRef = useRef(null);

  return (
    <>
      {open && (
        <div className={classNames(styles.dropdown, { [styles.open]: open })}>
          {children}
        </div>
      )}
    </>
  );
};
