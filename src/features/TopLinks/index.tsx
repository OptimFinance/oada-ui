/**
 * TopLinks Component
 * 
 * A dynamic navigation component that renders contextual links based on the current route.
 * Supports both internal and external links with appropriate visual indicators.
 * 
 * Features:
 * - Route-based link context switching
 * - Active link highlighting
 * - External link indicators
 * - Responsive design integration
 * - Consistent typography and styling
 */

import { FC } from "react";
import { Link, useLocation } from "react-router-dom";
import { Text } from "src/components/ui/typography";
import { topNavLinks } from "../dAppHub/content";
import { cn } from "src/utils/tailwind";
import { FiArrowUpRight } from "react-icons/fi";

/**
 * Props interface for the TopLinks component
 * @interface Props
 * @property {string} [className] - Optional CSS classes for styling and layout
 */
interface Props {
  className?: string
}

/**
 * TopLinks Component
 * 
 * Renders a set of navigation links that change based on the current route.
 * Links can be either internal routes or external URLs, with external links
 * showing an arrow indicator.
 * 
 * @component
 * @param {Props} props - Component props
 * @returns {JSX.Element} Navigation links container
 */
export const TopLinks: FC<Props> = ({ className }) => {
  const location = useLocation();

  /**
   * Determines the current navigation context based on route
   * Falls back to 'oada' links if no matching context is found
   */
  const topNavLinkKey = Object.keys(topNavLinks).find((key) =>
    location.pathname.includes(key)
  ) as keyof typeof topNavLinks;
  const links = topNavLinkKey ? topNavLinks[topNavLinkKey] : topNavLinks['oada'];

  return (
    <div className={cn("gap-8", className)}>
      {links.map((link) => {
        // Check if the current route matches this link
        const isActive = location.pathname.startsWith(link.href);

        return (
          <Link 
            key={link.title} 
            to={link.href} 
            target={link.isExternal ? "_blank" : "_self"}
          >
            <Text
              weight="medium"
              size="medium"
              tone="muted"
              className={cn(
                "flex items-center whitespace-nowrap",
                // Highlight active link with different text color
                isActive && "text-ui-surface-default",
              )}
            >
              {link.title}
              {/* External link indicator */}
              {link.isExternal && (
                <FiArrowUpRight className="h-4 w-4 ml-0.5" />
              )}
            </Text>
          </Link>
        );
      })}
    </div>
  );
};
