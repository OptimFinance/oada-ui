import { cn } from "src/utils/tailwind";

import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex px-4 py-[9px] border border-ui-border-sub bg-ui-background-sub text-ui-base-white rounded-[41px] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ui-surface-sub focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ui-border-hover focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
