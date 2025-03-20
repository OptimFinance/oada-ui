/**
 * Alert Component
 * 
 * This component displays alert notifications in the application.
 * It retrieves alerts from the Redux store and renders them using the Item component.
 */

// Import Redux selector hook to access store state
import { useAppSelector } from "../../store/hooks";
// Import the selector function for alerts from the alert slice
import { selectAlert } from "../../store/slices/alertSlice";
// Import component-specific styles
import styles from './index.module.scss';

// Import the individual alert item component
import { Item } from "./item";

/**
 * Alert Component
 * 
 * Renders a container with all active alerts.
 * Each alert is displayed using the Item component.
 */
export const Alert = () => {
  // Retrieve the array of alert objects from the Redux store
  const alerts = useAppSelector(selectAlert);

  return (
    <div className={styles.alertWrapper}>
      {/* Map through each alert and render an Item component */}
      {/* Each Item receives the alert data and a unique key */}
      {alerts.map(alert => <Item key={alert.id} alert={alert} />)}
    </div>
  );
}
