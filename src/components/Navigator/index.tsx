import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import styles from './index.module.scss';

interface NavigatorProps {
  redirectTo: string
  text: string
}

const Navigator:React.FC<NavigatorProps> = ({
  redirectTo,
  text
}) => {
  return (
    <div className={styles.navigator}>
      <Icon name='chevron_left' size={20}/>
      <div className={styles.text}>
        <Link to={redirectTo}>{text}</Link>
      </div>
    </div>
  )
}

export default Navigator