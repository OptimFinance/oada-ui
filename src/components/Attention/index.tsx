/**
 * Attention Component
 * 
 * A customizable alert/notification component that displays messages with different 
 * styling variations (alert, success, info) to draw user attention.
 * Can be used to display warnings, errors, success messages, or informational content.
 */

import { FC, PropsWithChildren, ReactElement } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { cn } from "src/utils/tailwind";

/**
 * Props for the Attention component
 * 
 * @property className - Optional custom CSS class
 * @property alert - If true, applies error/alert styling (red)
 * @property success - If true, applies success styling (green)
 * @property info - If true, applies informational styling (neutral)
 * @property icon - Optional custom icon element to replace the default alert circle
 * @property children - The content to display inside the notification
 */
interface Props extends PropsWithChildren {
  className?: string;
  alert?: boolean;
  success?: boolean;
  info?: boolean;

  icon?: ReactElement<any, any>;
}

/**
 * Attention Component
 * 
 * A versatile notification component that can be styled in different ways
 * to convey various types of messages (warning, error, success, info).
 * 
 * Default styling is a yellow warning. Use the boolean props to change styling:
 * - alert: Red styling for errors or critical warnings
 * - success: Green styling for success messages
 * - info: Neutral styling for informational content
 * 
 * Can include a custom icon or uses a default alert circle icon.
 */
export const Attention: FC<Props> = (props) => {
  const { children, className, alert, success, info, icon } = props;
  return (
    <div
      className={cn(
        // Base styling (default warning/attention yellow)
        "flex gap-1 bg-[hsla(38,80%,67%,0.1)] text-sm p-4 rounded-xl text-ui-base-yellow",
        // Conditional styling based on props
        alert && "text-ui-error-light bg-[hsla(3,81%,58%,0.1)]", // Red for errors/alerts
        success && "text-ui-base-green bg-ui-base-green/15",     // Green for success
        info && "text-ui-surface-default bg-ui-background-default", // Neutral for info
        className // Allow custom class overrides
      )}
    >
      {/* Use custom icon if provided, otherwise use default alert circle */}
      {icon ?? <FiAlertCircle className="h-5 w-5 shrink-0" />}

      {/* Content of the notification */}
      {children}
    </div>
  );
};
