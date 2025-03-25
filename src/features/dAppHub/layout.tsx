/**
 * DappHub Layout Component
 * 
 * This component provides the primary layout structure for all dApp Hub pages.
 * It implements a responsive two-column layout with:
 * - A sidebar navigation (AsideNavigation) on larger screens
 * - A full-width content area that adapts to screen size
 * 
 * Key features:
 * - Responsive design that collapses to single column on mobile devices
 * - Fixed sidebar width of 240px on desktop
 * - Proper content scrolling with fixed navigation
 * - Consistent borders and background styling
 * 
 * This layout ensures consistent UI across all dApp Hub pages while
 * providing appropriate viewing experiences across different devices.
 */

import { AsideNavigation } from "./AsideNavigation";

/**
 * DappHubLayout Component
 * 
 * @param props - Component properties
 * @param props.children - Child components to render in the main content area
 * @returns A responsive two-column layout with navigation and content areas
 */
export const DappHubLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="grid md:grid-cols-[240px,1fr] border-t border-ui-border-sub h-[calc(100%-66px)]">
      {/* 
        Sidebar navigation - visible only on medium screens and larger
        - Hidden on mobile (hidden class)
        - Grid display on md+ screens (md:grid)
        - Styled with subtle background and right border
      */}
      <AsideNavigation className="hidden md:grid bg-ui-background-sub border-r border-ui-border-sub " />
      
      {/* 
        Main content area
        - Scrollable on small screens and up (sm:overflow-y-auto)
        - Small margin for visual separation (m-2)
        - Automatically takes full width on mobile, remaining space on larger screens
      */}
      <div className="sm:overflow-y-auto m-2">{children}</div>
    </main>
  );
};
