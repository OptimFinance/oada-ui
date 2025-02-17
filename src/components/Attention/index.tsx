import { FC, PropsWithChildren, ReactElement } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { cn } from "src/utils/tailwind";

interface Props extends PropsWithChildren {
  className?: string;
  alert?: boolean;
  success?: boolean;
  info?: boolean;

  icon?: ReactElement<any, any>;
}

export const Attention: FC<Props> = (props) => {
  const { children, className, alert, success, info, icon } = props;
  return (
    <div
      className={cn(
        "flex gap-1 bg-[hsla(38,80%,67%,0.1)] text-sm p-4 rounded-xl text-ui-base-yellow",
        alert && "text-ui-error-light bg-[hsla(3,81%,58%,0.1)]",
        success && "text-ui-base-green bg-ui-base-green/15",
        info && "text-ui-surface-default bg-ui-background-default",
        className
      )}
    >
      {icon ?? <FiAlertCircle className="h-5 w-5 shrink-0" />}

      {children}
    </div>
  );
};
