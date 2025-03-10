import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import classNames from "classnames";
import styles from "./index.module.scss";
import { ReactSVG } from "react-svg";
import close from "../../assets/icons/close.svg";
import { cn } from "src/utils/tailwind";

interface Props extends PropsWithChildren {
  open: boolean;
  onClose?: () => void;
  blur?: boolean;
  width?: number;
  height?: number;
  className?: string;
}
// Will use fixed to cover the whole screen,
// might need to use portal in edge cases
export const Modal: FC<Props> = ({
  blur = true,
  open = true,
  children,
  onClose,
  width,
  height,
  className,
}) => {
  const [isPopupOpen, setPopupState] = useState<boolean>(false);

  useEffect(() => {
    setPopupState(open);
  }, [open]);

  const togglePopup = () => {
    onClose && onClose();
  };
  const noop: React.EventHandler<React.MouseEvent> = (e) => {
    e.stopPropagation();
  };

  return (
    <div>
      <div
        className={classNames(
          styles.backdrop,
          { [styles.blur]: blur },
          { [styles.hidden]: !isPopupOpen },
          "bg-ui-background-sub backdrop-blur overflow-auto py-6"
        )}
        onMouseDown={togglePopup}
      >
        {/* Modal_popup__D8hy- {
    background: #15151e;
    border-radius: 12px;
    width: 600px;
    max-height: 100vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid #3c3c55;
    padding: 2.5rem;
    overflow-x: visible;
} */}
        <div
          className={cn(
            "bg-ui-base-background border border-ui-border-sub p-6 w-[480px] rounded-2xl relative my-6 max-h-[90%] overflow-auto",
            className
          )}
          onMouseDown={noop}
          style={{ width, height }}
        >
          {onClose && (
            <ReactSVG
              src={close}
              className={styles.close}
              onClick={togglePopup}
            />
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
