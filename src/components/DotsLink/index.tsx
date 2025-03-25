/**
 * DotsLink Component
 * 
 * A specialized link component that truncates long text with an ellipsis and
 * provides visual indicators for different link types (internal, external, or copyable).
 * 
 * The component has two main variants:
 * 1. DotsLink - For navigational links (internal or external)
 * 2. DotsCopy - For copyable text with a copy icon
 */

import { FC, PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { cn } from "src/utils/tailwind";
import { Text } from "../ui/typography";

/**
 * Props for the DotsLink component
 * 
 * @property path - URL or path to navigate to when clicked
 * @property className - Optional additional CSS classes
 * @property isExternal - If true, renders as an external link with icon (<a> tag with target="_blank")
 * @property onClick - Optional click handler function
 * @property children - Text content to display in the link
 */
interface Props extends PropsWithChildren {
  path: string;
  className?: string;
  isExternal?: boolean;
  onClick?: () => void;
}

/**
 * DotsLink Component
 * 
 * Renders a link that truncates text with ellipsis if it's too long.
 * Handles both internal navigation (using React Router) and external links.
 * External links include an external link icon and open in a new tab.
 * 
 * @example
 * // Internal link (React Router)
 * <DotsLink path="/dashboard">Dashboard Overview with Long Name</DotsLink>
 * 
 * // External link (opens in new tab)
 * <DotsLink path="https://example.com" isExternal>Visit External Site</DotsLink>
 */
export const DotsLink: FC<Props> = ({
  path,
  children,
  isExternal,
  className,
  onClick,
}) => {
  // For external links, use an <a> tag with target="_blank"
  return isExternal ? (
    <a
      href={path}
      rel="noreferrer"           // Security best practice for external links
      onClick={onClick}
      target="_blank"            // Open in new tab
      className={cn(
        "flex items-center cursor-pointer hover:text-ui-surface-sub",
        className
      )}
    >
      <Text className="truncate ">{children}</Text>
      {/* External link icon */}
      <FiExternalLink className="h-4 w-4 ml-1 inline-flex shrink-0" />
    </a>
  ) : (
    // For internal links, use React Router's Link component
    <Link to={path} onClick={onClick} className={cn("", className)}>
      <Text className="truncate max-w-60 inline-flex">{children}</Text>
    </Link>
  );
};

/**
 * Props for the DotsCopy component
 * 
 * @property className - Optional additional CSS classes
 * @property onClick - Handler function (typically used to copy text to clipboard)
 * @property children - Text content to display and copy
 */
interface CopyProps extends PropsWithChildren {
  className?: string;
  onClick?: () => void;
}

/**
 * DotsCopy Component
 * 
 * A variant of DotsLink that displays text with a copy icon.
 * Used for copyable content where the onClick handler typically
 * implements the copy-to-clipboard functionality.
 * 
 * @example
 * // Copy text to clipboard on click
 * <DotsCopy onClick={() => navigator.clipboard.writeText("text-to-copy")}>
 *   text-to-copy
 * </DotsCopy>
 */
export const DotsCopy: FC<CopyProps> = ({ children, className, onClick }) => {
  return (
    <a
      rel="noreferrer"
      onClick={onClick}          // Typically implements copy-to-clipboard
      className={cn(
        "flex items-center cursor-pointer hover:text-ui-surface-sub",
        className
      )}
    >
      <Text className="truncate">{children}</Text>
      {/* Copy icon */}
      <FiCopy className="h-4 w-4 ml-1 inline-flex shrink-0" />
    </a>
  );
};
