/**
 * Breadcrumbs Component
 * 
 * A navigation component that displays the user's current location in the application hierarchy.
 * Renders a series of links that allow users to navigate back through parent pages/sections.
 * Each breadcrumb is displayed with a left-pointing chevron icon and the crumb name.
 */

import { FiChevronLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
// Generate unique keys for list rendering
import { v4 as uuidv4 } from "uuid";
// Typography component for consistent text styling
import { Text } from "../ui/typography";
// Type definitions
import { UITypes } from "./../../types/index";

/**
 * Props for the Breadcrumbs component
 * 
 * @property items - Array of breadcrumb objects, each containing a path and display name
 */
interface Props {
  items: UITypes.Breadcrumb[];
}

/**
 * Breadcrumbs Component
 * 
 * Renders a horizontal navigation bar showing the current location hierarchy.
 * Each breadcrumb is a clickable link that navigates to its corresponding path.
 * 
 * @param props.items - Array of breadcrumb objects to display
 */
export const Breadcrumbs = ({ items }: Props) => (
  <nav className="flex items-center gap-2 mb-6">
    {items?.map((item) => (
      // Each breadcrumb is a Link component that navigates to the specified path
      <Link key={uuidv4()} to={item.path} className="flex items-center">
        {/* Left-pointing chevron icon for visual hierarchy */}
        <FiChevronLeft className="h-5 w-5 text-ui-surface-sub" />
        {/* Breadcrumb text with muted styling */}
        <Text tone="muted" size="medium">
          {item.crumbName}
        </Text>
      </Link>
    ))}
  </nav>
);
