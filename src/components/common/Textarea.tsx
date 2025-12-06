import React, { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, className = "", id, rows = 3, ...props },
    ref
  ) => {
    const textareaId =
      id || props.name || Math.random().toString(36).substr(2, 9);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
          w-full rounded-lg border bg-white px-3 py-2 text-sm
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-brand-primary"
          }
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${className}
        `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
