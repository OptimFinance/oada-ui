import { FiAlertCircle } from "react-icons/fi";
import { Checkbox } from "src/components/ui/checkbox";
import { Separator } from "src/components/ui/separator";

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
    <div className="flex flex-col gap-2 bg-[hsla(38,80%,67%,0.1)] text-xs p-4 rounded-lg text-ui-base-yellow">
      <div className="flex gap-2">
        <FiAlertCircle className="h-5 w-5 shrink-0" />
        {children}
        {/* OSPLASH MINTING IS A ONE-WAY CONVERSION <br />
                *OSPLASH trades on the open market & is not price pegged*
                <br />
                *Liquid Max Lock Token info* */}
      </div>
      <Separator />
      <div className="flex items-center space-x-2">
        <Checkbox
          id="warning"
          className="h-7 w-7 text-ui-base-primary rounded-lg"
          checked={isChecked}
          onCheckedChange={onCheckedChange}
        />
        <label htmlFor="warning" className="text-sm text-ui-surface-sub">
          I understand the warning
        </label>
      </div>
    </div>
  );
};

// () => setIsWarningChecked(!isWarningChecked)
