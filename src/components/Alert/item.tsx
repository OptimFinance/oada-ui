import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import classNames from "classnames";
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { useAppDispatch } from "../../store/hooks";
import { unsetAlert } from "../../store/slices/alertSlice";
import { UITypes } from "../../types";
import { v4 as uuidv4 } from 'uuid';

const renderAsLines = (s: string) => {
  return s.split('\n').map(line => {
    return <p key={uuidv4()}>{line}</p>
  })
}

type Props = {
  alert: UITypes.AlertType
};
export const Item = ({ alert: {id, link, message, type, txHash} }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const timeout = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  useEffect(() => {
    const callback = () => {
      dispatch(unsetAlert(id!));
    };
    if (!isHovering){
      // @ts-ignore
      timeout.current = setTimeout(callback, 10000);
    }

    return function () {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [isHovering, dispatch, id]);

  const handleClose = () => {
    dispatch(unsetAlert(id!));
  };

  const onViewClick = () => {
    !!link && navigate(link)
    dispatch(unsetAlert(id!));
  }
  const handleEnter = () => {
    setIsHovering(true);
    // clear any existing timeout functions
    if ( timeout.current ){
        clearTimeout(timeout.current);
    }
  }
  const handleLeave = () => {
    setIsHovering(false);
  }

  const getHref = (txHash: string) => {
    return `https://cardanoscan.io/transaction/${txHash}`
  }

  return <div className={styles.alert} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <span className={styles.cross} onClick={handleClose} />
      {
        type === "success" ?
          <header className={styles.alertHeader}>
            <span className={classNames(styles.iconWrapper, styles.success)} />
            <h4 className={classNames(styles.alertTitle, styles.green)}>Success</h4>
          </header> : type === "error" ?
          <header className={styles.alertHeader}>
            <span className={classNames(styles.iconWrapper, styles.error)} />
            <h4 className={classNames(styles.alertTitle, styles.red)}>Error</h4>
          </header> : 
          <header className={styles.alertHeader}>
            <span className={classNames(styles.iconWrapper, styles.error)} />
            <h4 className={classNames(styles.alertTitle, styles.red)}>Warning</h4>
          </header>
      }
      <div className={styles.message}>
        {renderAsLines(message)}
        { txHash === undefined 
          ? <></> 
          : <p>TxId: <a className={styles.alertAnchor} href={getHref(txHash)} target="_blank" rel="noreferrer">{txHash}</a></p>
        }
      </div>
      <div className={styles.buttonsWrapper}>
        <Button
          size='xl'
          outlined
          onClick={handleClose}
          className={styles.button}>
          Close
        </Button>
        {
          !!link && <Button
            size='xl'
            white
            onClick={onViewClick}
            className={styles.button}>
            View
          </Button>
        }
      </div>
    </div>
}
