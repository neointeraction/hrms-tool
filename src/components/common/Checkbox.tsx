import React, { type InputHTMLAttributes, forwardRef } from "react";

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
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`
            w-4 h-4 rounded border-gray-300 text-brand-primary 
            focus:ring-brand-primary focus:ring-2
            disabled:opacity-50
            ${className}
          `}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-2 text-sm">
            <label
              htmlFor={checkboxId}
              className="font-medium text-gray-700 select-none"
            >
              {label}
            </label>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
