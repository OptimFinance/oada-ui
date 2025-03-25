/**
 * AlertWithCheckbox Component
 * 
 * This component displays an important warning or notice to users with a checkbox
 * that they must check to acknowledge understanding the information. It's commonly 
 * used for critical financial operations, important disclaimers, or irreversible actions.
 * 
 * Key features:
 * - Yellow warning/alert styling to draw attention
 * - Alert icon for visual emphasis
 * - Customizable content through children prop
 * - Checkbox with confirmation label for user acknowledgment
 * - Controlled checkbox state passed from parent component
 * 
 * Usage example:
 * ```tsx
 * const [isWarningChecked, setIsWarningChecked] = useState(false);
 * 
 * <AlertWithCheckbox 
 *   isChecked={isWarningChecked}
 *   onCheckedChange={() => setIsWarningChecked(!isWarningChecked)}
 * >
 *   This action cannot be undone. Please ensure you understand the consequences.
 * </AlertWithCheckbox>
 * ```
 * 
 * The parent component can use the checkbox state to enable/disable action buttons
 * to ensure users have acknowledged important information before proceeding.
 */

import { FiAlertCircle } from "react-icons/fi";
import { Checkbox } from "src/components/ui/checkbox";
import { Separator } from "src/components/ui/separator";

/**
 * AlertWithCheckbox Component
 * 
 * @param props - Component properties
 * @param props.isChecked - Boolean indicating if the checkbox is checked
 * @param props.onCheckedChange - Callback function triggered when checkbox state changes
 * @param props.children - Content to display in the alert (warning text, instructions, etc.)
 * @returns A warning alert component with acknowledgment checkbox
 */
export const AlertWithCheckbox = ({
  isChecked,
  onCheckedChange,
  children,
}: {
  isChecked: boolean;
  onCheckedChange: () => void;
  children: React.ReactNode;
}) => {
  return (
    // Main container with yellow warning styling
    <div className="flex flex-col gap-2 bg-[hsla(38,80%,67%,0.1)] text-xs p-4 rounded-lg text-ui-base-yellow">
      {/* Alert content section with icon */}
      <div className="flex gap-2">
        <FiAlertCircle className="h-5 w-5 shrink-0" />
        {children}
        {/* Example of potential content that was commented out in the original:
        
            OSPLASH MINTING IS A ONE-WAY CONVERSION <br />
            *OSPLASH trades on the open market & is not price pegged*
            <br />
            *Liquid Max Lock Token info*
        */}
      </div>
      
      {/* Visual separator between warning content and checkbox */}
      <Separator />
      
      {/* Acknowledgment checkbox section */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="warning"  // ID for associating with label
          className="h-7 w-7 text-ui-base-primary rounded-lg"
          checked={isChecked}  // Controlled state from parent
          onCheckedChange={onCheckedChange}  // Handler from parent
        />
        <label htmlFor="warning" className="text-sm text-ui-surface-sub">
          I understand the warning
        </label>
      </div>
    </div>
  );
};

// Example of how to use the onCheckedChange callback in a parent component:
// () => setIsWarningChecked(!isWarningChecked)
