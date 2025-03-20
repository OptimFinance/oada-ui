/**
 * Card Component
 * 
 * A versatile UI component for displaying structured content with a consistent visual style.
 * Features include:
 * - Header with icon and title/value pairs
 * - Details list with name/value pairs
 * - Optional tooltips for detail items
 * - Copy-to-clipboard functionality
 * - Details button that appears on hover
 * - Optional danger/error state
 * - Support for custom footer content via children
 */

import React, { useState } from 'react';
import styles from './index.module.scss';
import { Info } from '../Info';
import { v4 as uuidv4 } from 'uuid';
import { UITypes } from '../../types';
import classNames from "classnames";
import { Button } from '../Button';
import { ReactSVG } from 'react-svg';
import iconArrowRight from '../../assets/icons/li_arrow-right.svg'

/**
 * Props for Card component
 * Extends the CardData interface from UITypes with additional properties
 * 
 * @property children - Optional content to render in the card footer
 * @property onDetailsButtonClick - Handler for the Details button click
 * @property header - Header configuration with left/right content and icon type
 * @property details - Array of detail items to display in the card body
 * @property danger - If true, applies danger/error styling (red border)
 */
interface Props extends UITypes.Card.CardData {
  children?: React.ReactNode
  onDetailsButtonClick?: () => void
}

/**
 * Card Component
 * 
 * Renders a card with header, details list, and optional footer content.
 * Features hover interactions and supports different icon types.
 */
export const Card: React.FC<Props> = ({
  children,
  header,
  details,
  onDetailsButtonClick,
  danger,
}: Props) => {
  // Track hover state to show/hide the Details button
  const [isHover, setHover] = useState(false);

  // Set default icon type if not provided
  header.iconType = header.iconType || 'cardano';

  /**
   * Copies the provided value to the clipboard
   * Used for detail items with copyId flag
   * 
   * @param value - The text value to copy to clipboard
   */
  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid="card"
    >
      <section className={classNames(
        styles.cardWrapper, 
        styles.cardBorder, 
        {[styles.dangerBorder]: danger} // Apply danger styling if specified
      )}>
        <>
          {/* Card header with icon and left/right content */}
          <header className={classNames(styles.cardHeader, styles[header.iconType])}>
            {/* Left column - typically contains title/identifier */}
            <div className={styles.cardHeaderCol}>
              {header.left.name}
              {header.left.value}
            </div>
            
            {/* Right column - typically contains status/actions */}
            <div className={styles.cardHeaderCol}>
              <>
                {/* Details button that appears on hover */}
                <Button
                  className={classNames(styles.detailsButton, isHover ? styles.isHover : '')}
                  size='xl'
                  white
                  onClick={onDetailsButtonClick}
                >
                  Details
                  <ReactSVG src={iconArrowRight} className={styles.buttonArrowIcon} />
                </Button>
                {header.right.name}
                {header.right.value}
              </>
            </div>
          </header>
        </>
        
        {/* Details list section */}
        <ul className={styles.detailsList}>
          {
            /* Render detail items if present */
            !!details?.length && details.map(item => (
              <li className={styles.detailsListItem} key={uuidv4()}>
                {/* Detail name/label with optional tooltip */}
                <span className={styles.detailName}>
                  {item.name}
                  {!!item?.tooltip && <Info label={item.tooltip} />}
                </span>
                
                {/* Detail value - either copyable or display-only */}
                {
                  item?.copyId ?
                    /* Copyable item - shows "Copy ID" text that copies value on click */
                    <span className={styles.detailCopy} onClick={() => copyToClipboard(item.value)}>
                      Copy ID
                    </span> :
                    /* Regular value display with optional color styling */
                    <span className={classNames(
                      styles.detailValue, 
                      { 
                        [styles.green]: item.isGreen, // Green styling for positive values 
                        [styles.red]: item.isRed      // Red styling for negative values
                      }
                    )}>
                      {item.value}
                    </span>
                }
              </li>
            ))
          }
        </ul>
        
        {/* Optional footer with action buttons */}
        {children && <footer className={styles.buttonsWrapper}>
          {children}
        </footer>}
      </section>
    </div>
  )
}
