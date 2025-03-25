/**
 * Navigator Component
 * 
 * A navigation component that combines a chevron left icon and text into a clickable link.
 * Typically used for "back" navigation or breadcrumb-style navigation flows
 * to help users move between different sections of the application.
 * 
 * The component wraps React Router's Link component to provide client-side navigation
 * with a consistent visual styling.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import styles from './index.module.scss';

/**
 * Props for the Navigator component
 * 
 * @property redirectTo - The route path to navigate to when clicked
 * @property text - The text to display next to the chevron icon
 */
interface NavigatorProps {
  redirectTo: string
  text: string
}

/**
 * Navigator Component
 * 
 * Renders a left-pointing chevron icon followed by a text link.
 * Uses React Router's Link component for client-side navigation.
 * 
 * @example
 * // Basic back navigation
 * <Navigator 
 *   redirectTo="/dashboard" 
 *   text="Back to Dashboard" 
 * />
 */
const Navigator:React.FC<NavigatorProps> = ({
  redirectTo,
  text
}) => {
  return (
    <div className={styles.navigator}>
      {/* Left chevron icon */}
      <Icon name='chevron_left' size={20}/>
      
      {/* Link text */}
      <div className={styles.text}>
        <Link to={redirectTo}>{text}</Link>
      </div>
    </div>
  )
}

export default Navigator