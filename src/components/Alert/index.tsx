import { useAppSelector } from "../../store/hooks";
import { selectAlert } from "../../store/slices/alertSlice";
import styles from './index.module.scss';

import { Item } from "./item";

export const Alert = () => {
  const alerts = useAppSelector(selectAlert);

  return <div className={styles.alertWrapper}>
    {alerts.map(alert => <Item key={alert.id} alert={alert} />)}
  </div>
}
