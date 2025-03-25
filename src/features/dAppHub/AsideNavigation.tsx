/**
 * AsideNavigation Component
 * 
 * This file implements the sidebar navigation menu for the dApp Hub, consisting of:
 * - Main navigation links (asideLinks)
 * - Footer links for additional resources (asideFooterLinks)
 * - Social media links (socialLinks)
 * 
 * The sidebar provides a hierarchical navigation structure with visual indicators
 * for active routes, new features, upcoming features, and external links.
 * 
 * Key features:
 * - Active link highlighting
 * - "New" and "Coming Soon" badges for feature discoverability
 * - External link indicators
 * - Responsive design with different padding for mobile/desktop
 * - Mobile-only top links display when a section is active
 */

import { Link, useLocation } from "react-router-dom";
import { ReactSVG } from "react-svg";
import { cn } from "src/utils/tailwind";
import arrowUpRightIcon from "../../assets/icons/arrow-up-right.svg";
import {
  AsideLink,
  asideFooterLinks,
  asideLinks,
  socialLinks,
} from "./content";
import {TopLinks} from "../TopLinks";

/**
 * AsideNavigation Component
 * 
 * Main sidebar navigation component that renders navigation links, footer links,
 * and social media links.
 * 
 * @param props - Component properties
 * @param props.className - Optional additional CSS classes to apply to the aside element
 * @returns A sidebar navigation component
 */
export const AsideNavigation = ({ className }: { className?: string }) => {
  return (
    <aside className={cn("grid h-full", className)}>
      {/* Main navigation links */}
      <ul className="mt-3">
        {asideLinks.map((link) => {
          return <AsideNavigationLink key={link.title} link={link} />;
        })}
      </ul>
      
      {/* Footer section with additional links and social media */}
      <footer className="mt-auto">
        {/* Secondary navigation links */}
        <ul className="px-6 py-4 grid gap-3">
          {asideFooterLinks.map((link) => (
            <li key={link.title}>
              <Link
                className="text-sm uppercase text-ui-surface-sub hover:text-white"
                to={link.href}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Social media links */}
        <ul className="px-6 py-4 flex gap-6">
          {socialLinks.map((link) => (
            <li key={link.title}>
              <Link className="text-ui-base-white" to={link.href} target="_blank">
                <ReactSVG src={link.icon} width={16} height={16} />
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </aside>
  );
};

/**
 * AsideNavigationLink Component
 * 
 * Renders an individual navigation link with various states and indicators:
 * - Active state highlighting (based on current route)
 * - Icon display
 * - "Soon" indicator for upcoming features
 * - "New" indicator for recently added features
 * - External link indicator for links that navigate outside the app
 * - Mobile-only top links that display when a section is active
 * 
 * @param props - Component properties
 * @param props.link - The link data object containing href, title, icon, etc.
 * @param props.className - Optional additional CSS classes to apply to the list item
 * @returns A navigation link list item
 */
export const AsideNavigationLink = ({
  link,
  className,
}: {
  link: AsideLink;
  className?: string;
}) => {
  // Get current location to determine if this link is active
  const location = useLocation();
  
  // A link is active if the current path starts with either the link's parent or its direct href
  const isActive = location.pathname.startsWith(link.parent) || location.pathname.startsWith(link.href);
  
  return (
    <li key={link.title} className={cn("list-none", className)}>
      {/* Navigation link with conditional active styling */}
      <Link
        to={link.href}
        className={cn(
          "flex items-center px-2 md:px-6 py-4 w-full h-full text-ui-surface-sub text-sm font-medium focus:text-ui-base-purple",
          isActive && "text-ui-base-purple bg-ui-background-sub"
        )}
      >
        {/* Icon for the navigation item */}
        <ReactSVG
          className="mr-3"
          fill="#FA8072"
          color="#FA8072"
          src={link.icon}
        />
        
        {/* Link title */}
        {link.title}
        
        {/* "Coming Soon" badge - yellow dot with text */}
        {link.soon && (
          <div className="px-2 py-1 rounded-2xl text-xs text-ui-warning-default bg-ui-warning-default/15 leading-[12px] ml-3 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-ui-warning-default mr-1"></div>
            Soon
          </div>
        )}
        
        {/* "New" badge - green dot with text */}
        {link.new && (
          <div className="px-2 py-1 rounded-2xl text-xs text-ui-success-default bg-ui-success-default/15 leading-[12px] ml-3 flex items-center">
            <div className="h-1.5 w-1.5 rounded-full bg-ui-success-default mr-1"></div>
            New
          </div>
        )}
        
        {/* External link indicator - arrow icon */}
        {link.outsideLink && (
          <ReactSVG className="ml-3" src={arrowUpRightIcon} />
        )}
      </Link>
      
      {/* Show TopLinks component on mobile only when this section is active */}
      {isActive && <TopLinks className="flex sm:!hidden flex-col items-start mx-10 my-4" />}
    </li>
  );
};
