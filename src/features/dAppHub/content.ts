/**
 * Navigation Content Configuration
 * 
 * This file centralizes all navigation-related content for the dApp Hub, including:
 * - Main sidebar navigation links
 * - Top navigation links for each section
 * - Footer links for additional resources
 * - Social media links
 * 
 * By keeping navigation content in a separate file, we maintain a single source of truth
 * for all navigation elements, making it easier to add, modify, or remove navigation items
 * without changing the components that render them.
 */

// Import social media icons
import discordIcon from "../../assets/icons/discord.svg";
import githubIcon from "../../assets/icons/github.svg";
import telegramIcon from "../../assets/icons/telegram.svg";
import twitterIcon from "../../assets/icons/twitter.svg";

// Import dApp-specific icons for the sidebar
import epochStakeAuction from "../../assets/icons/dapphub-menu/epoch-stake-auction.svg";
import oada from "../../assets/icons/dapphub-menu/oada.svg";

/**
 * AsideLink Type Definition
 * 
 * Defines the structure for sidebar navigation link items:
 * @property title - Display text for the navigation item
 * @property icon - Path to the SVG icon file
 * @property href - Target URL/route for the link
 * @property soon - Optional flag to show a "Coming Soon" badge
 * @property new - Optional flag to show a "New" badge
 * @property outsideLink - Optional flag to indicate the link goes outside the app (shows arrow icon)
 * @property parent - Base path used to determine if the link should be highlighted as active
 */
export type AsideLink = {
  title: string;
  icon: string;
  href: string;
  soon?: boolean;
  new?: boolean;
  outsideLink?: boolean;
  parent: string;
};

/**
 * Main Sidebar Navigation Links
 * 
 * These links appear in the primary sidebar navigation.
 * Each represents a major section of the application.
 */
const asideLinks: AsideLink[] = [
  {
    title: "OADA",
    icon: oada,
    href: "/dashboard",
    parent: "/oada",
  },
  {
    title: "Epoch Stake Auction",
    icon: epochStakeAuction,
    href: "/epoch-stake-auction/dashboard",
    parent: "/epoch-stake-auction",
  },
];

/**
 * Top Navigation Links
 * 
 * These links appear in the top navigation bar for each major section.
 * Organized as a map where keys correspond to the section identifiers (matching parent values in asideLinks),
 * and values are arrays of link objects with title, href, and optional isExternal flag.
 * 
 * Used by the TopLinks component to show section-specific navigation options.
 */
const topNavLinks: {
  [key: string]: { title: string; href: string; isExternal?: boolean }[];
} = {
  // OADA section navigation links
  oada: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Mint-Stake-Earn",
      href: "/oada/mint-stake-earn",
    },
    {
      title: "Swap",
      href: "//app.dexhunter.io/oada",
      isExternal: true, // Opens in a new tab/window
    },
  ],
  
  // Epoch Stake Auction section navigation links
  "epoch-stake-auction": [
    {
      title: "Dashboard",
      href: "/epoch-stake-auction/dashboard",
    },
  ],
};

/**
 * Footer Navigation Links
 * 
 * These links appear in the footer section of the sidebar.
 * They typically point to general resources like documentation, terms, etc.
 * All these links are external (go to a different website).
 */
const asideFooterLinks = [
  {
    title: "Home",
    href: "//www.optim.finance",
  },
  {
    title: "Docs",
    href: "//optim-finance.gitbook.io/optim-finance",
  },
  {
    title: "Terms",
    href: "//www.optim.finance/disclaimer",
  },
  {
    title: "Audits",
    href: "//optim-finance.gitbook.io/optim-finance/audits/oada-system-audit",
  },
];

/**
 * Social Media Links
 * 
 * These links appear as icons in the bottom section of the sidebar.
 * Each has an associated SVG icon, title (for accessibility), and external URL.
 */
const socialLinks = [
  {
    title: "Telegram",
    href: "//t.me/Optim_Fi",
    icon: telegramIcon,
  },
  {
    title: "Twitter",
    href: "//twitter.com/optimfi",
    icon: twitterIcon,
  },
  {
    title: "Github",
    href: "//github.com/optimfinance",
    icon: githubIcon,
  },
  {
    title: "Discord",
    href: "//discord.gg/VZ329q7x69",
    icon: discordIcon,
  },
];

// Export all navigation link collections for use in components
export { asideFooterLinks, asideLinks, socialLinks, topNavLinks };
