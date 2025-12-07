import { type TextareaHTMLAttributes, forwardRef } from "react";

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
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`
          w-full rounded-lg border bg-bg-card px-3 py-2 text-sm text-text-primary placeholder-text-muted
          ${
            error
              ? "border-status-error focus:ring-status-error"
              : "border-border focus:ring-brand-primary"
          }
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:bg-bg-main disabled:text-text-muted
          ${className}
        `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
