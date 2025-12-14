import { type InputHTMLAttributes, forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../../utils/cn";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const checkboxId =
      id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div className={cn("flex items-start group", className)}>
        <label
          htmlFor={checkboxId}
          className="flex items-center h-5 relative cursor-pointer"
        >
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "w-5 h-5 rounded-md border border-border bg-bg-card transition-all duration-200 ease-in-out",
              "peer-focus:ring-2 peer-focus:ring-brand-primary peer-focus:ring-offset-1 peer-focus:ring-offset-bg-main",
              "peer-checked:bg-brand-primary peer-checked:border-brand-primary peer-checked:text-white",
              "peer-checked:[&_svg]:opacity-100 peer-checked:[&_svg]:scale-100",
              "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
              "flex items-center justify-center shadow-sm"
            )}
          >
            <Check
              size={12}
              strokeWidth={3}
              className="opacity-0 scale-50 transition-all duration-200"
            />
          </div>
        </label>
        {label && (
          <div className="ml-2.5 text-sm select-none">
            <label
              htmlFor={checkboxId}
              className="font-medium text-text-primary cursor-pointer group-hover:text-brand-primary transition-colors"
            >
              {label}
            </label>
            {error && <p className="text-xs text-status-error mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
