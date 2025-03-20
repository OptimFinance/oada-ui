/**
 * Alert Item Component
 * 
 * This component renders an individual alert notification with appropriate styling based on type.
 * Features include:
 * - Auto-dismiss after 10 seconds (paused on hover)
 * - Visual styling based on alert type (success, error, warning)
 * - Optional transaction hash linking to blockchain explorer
 * - Optional navigation link
 * - Manual close button
 */

import React, { useEffect, useRef, useState } from 'react';
import styles from './index.module.scss';
import classNames from "classnames";
import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { useAppDispatch } from "../../store/hooks";
import { unsetAlert } from "../../store/slices/alertSlice";
import { UITypes } from "../../types";
import { v4 as uuidv4 } from 'uuid';

/**
 * Splits a string by newlines and renders each line as a paragraph
 * Used to format multi-line alert messages
 * 
 * @param s - The string to split and render
 * @returns An array of paragraph elements
 */
const renderAsLines = (s: string) => {
  return s.split('\n').map(line => {
    return <p key={uuidv4()}>{line}</p>
  })
}

type Props = {
  alert: UITypes.AlertType
};

/**
 * Alert Item Component
 * 
 * Renders an individual alert with appropriate styling and behavior
 * 
 * @param props.alert - The alert object containing id, message, type, and optional link/txHash
 */
export const Item = ({ alert: {id, link, message, type, txHash} }: Props) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  // Reference to store the timeout for auto-dismissal
  const timeout = useRef(null);
  // Track whether user is hovering over alert to pause auto-dismissal
  const [isHovering, setIsHovering] = useState(false);

  /**
   * Effect to handle auto-dismissal of alerts after 10 seconds
   * Auto-dismissal is paused when user hovers over the alert
   */
  useEffect(() => {
    const callback = () => {
      dispatch(unsetAlert(id!));
    };
    
    if (!isHovering){
      // @ts-ignore
      timeout.current = setTimeout(callback, 10000);
    }

    // Cleanup function to clear timeout when component unmounts or dependencies change
    return function () {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [isHovering, dispatch, id]);

  /**
   * Handles the manual closing of an alert
   */
  const handleClose = () => {
    dispatch(unsetAlert(id!));
  };

  /**
   * Handles click on the View button to navigate to the provided link
   */
  const onViewClick = () => {
    !!link && navigate(link)
    dispatch(unsetAlert(id!));
  }

  /**
   * Called when mouse enters the alert
   * Pauses the auto-dismissal by setting isHovering to true and clearing timeout
   */
  const handleEnter = () => {
    setIsHovering(true);
    // clear any existing timeout functions
    if (timeout.current){
        clearTimeout(timeout.current);
    }
  }

  /**
   * Called when mouse leaves the alert
   * Resumes the auto-dismissal by setting isHovering to false
   */
  const handleLeave = () => {
    setIsHovering(false);
  }

  /**
   * Generates a link to the Cardano blockchain explorer for a transaction
   * 
   * @param txHash - The transaction hash to link to
   * @returns The complete URL to the transaction on CardanoScan
   */
  const getHref = (txHash: string) => {
    return `https://cardanoscan.io/transaction/${txHash}`
  }

  return (
    <div className={styles.alert} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {/* Close button */}
      <span className={styles.cross} onClick={handleClose} />
      
      {/* Alert header with icon and title based on alert type */}
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

      {/* Alert message body */}
      <div className={styles.message}>
        {/* Render message, splitting by newlines */}
        {renderAsLines(message)}
        
        {/* Conditionally show transaction hash with link if provided */}
        { txHash === undefined 
          ? <></> 
          : <p>TxId: <a className={styles.alertAnchor} href={getHref(txHash)} target="_blank" rel="noreferrer">{txHash}</a></p>
        }
      </div>

      {/* Action buttons */}
      <div className={styles.buttonsWrapper}>
        <Button
          size='xl'
          outlined
          onClick={handleClose}
          className={styles.button}>
          Close
        </Button>
        
        {/* Conditionally show View button if link is provided */}
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
  );
}
