import styles from "./index.module.scss";
import { NavLink } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Info } from "../Info";

export interface Tab {
  to: string;
  label: string;
  tooltip?: string;
}

interface Props {
  links: Tab[];
}

export const Tabs = ({ links }: Props) => {
  return (
    <ul className={styles.tabsList}>
      {links?.map((item) => (
        <li className={styles.tabsItem} key={uuidv4()}>
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive ? styles.tabsLinkActive : styles.tabsLink
            }
          >
            {item.label}
            {!!item?.tooltip && (
              <Info
                className={styles.tooltip}
                label={item.tooltip}
                position="top"
              />
            )}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};
