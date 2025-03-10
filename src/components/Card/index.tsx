import React, { useState } from 'react';
import styles from './index.module.scss';
import { Info } from '../Info';
import { v4 as uuidv4 } from 'uuid';
import { UITypes } from '../../types';
import classNames from "classnames";
import { Button } from '../Button';
import { ReactSVG } from 'react-svg';
import iconArrowRight from '../../assets/icons/li_arrow-right.svg'

interface Props extends UITypes.Card.CardData {
  children?: React.ReactNode
  onDetailsButtonClick?: () => void
}

export const Card: React.FC<Props> = ({
  children,
  header,
  details,
  onDetailsButtonClick,
  danger,
}: Props) => {
  const [isHover, setHover] = useState(false);

  header.iconType = header.iconType || 'cardano';


  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  }


  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid="card"
    >
      <section className={classNames(styles.cardWrapper, styles.cardBorder, {[styles.dangerBorder]: danger})}>
        <>
          <header className={classNames(styles.cardHeader, styles[header.iconType])}>
            <div className={styles.cardHeaderCol}>
              {header.left.name}
              {header.left.value}
            </div>
            <div className={styles.cardHeaderCol}>
              <>
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
        <ul className={styles.detailsList}>
          {
            !!details?.length && details.map(item => (
              <li className={styles.detailsListItem} key={uuidv4()}>
                <span className={styles.detailName}>
                  {item.name}
                  {!!item?.tooltip && <Info label={item.tooltip} />}
                </span>
                {
                  item?.copyId ?
                    <span className={styles.detailCopy} onClick={() => copyToClipboard(item.value)}>
                      Copy ID
                    </span> :
                    <span className={classNames(styles.detailValue, { [styles.green]: item.isGreen, [styles.red]: item.isRed })}>
                      {item.value}
                    </span>
                }
              </li>
            ))
          }
        </ul>
        {children && <footer className={styles.buttonsWrapper}>
          {children}
        </footer>}
      </section>
    </div>
  )
}
