/**
 * Tabs Component
 * 
 * A navigation component that renders a horizontal list of tabs, with each tab
 * functioning as a NavLink from react-router-dom. The component automatically
 * highlights the active tab based on the current route.
 * 
 * Features:
 * - Route-based navigation using react-router
 * - Automatic active tab highlighting
 * - Optional tooltips for additional information
 * - Consistent styling with smooth transitions
 */

import styles from "./index.module.scss";
import { NavLink } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Info } from "../Info";

/**
 * Tab interface - defines the structure of each tab item
 * 
 * @property to - The route path that this tab navigates to
 * @property label - The text displayed on the tab
 * @property tooltip - Optional tooltip text for providing additional information
 */
export interface Tab {
  to: string;
  label: string;
  tooltip?: string;
}

/**
 * Props for the Tabs component
 * 
 * @property links - Array of Tab objects to be rendered as tabs
 */
interface Props {
  links: Tab[];
}

/**
 * Tabs Component
 * 
 * Renders a horizontal navigation bar with tabs that link to different routes.
 * 
 * @example
 * // Basic usage
 * <Tabs 
 *   links={[
 *     { to: "/dashboard", label: "Dashboard" },
 *     { to: "/settings", label: "Settings", tooltip: "User preferences and account settings" }
 *   ]} 
 * />
 */
export const Tabs = ({ links }: Props) => {
  return (
    <ul className={styles.tabsList}>
      {/* Map each tab item to a list item */}
      {links?.map((item) => (
        <li className={styles.tabsItem} key={uuidv4()}>
          {/* NavLink automatically applies the "active" class when the route matches */}
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              isActive ? styles.tabsLinkActive : styles.tabsLink
            }
          >
            {/* Tab label text */}
            {item.label}
            
            {/* Render tooltip if provided */}
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
