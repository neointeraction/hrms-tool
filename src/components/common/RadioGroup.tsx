import React from "react";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  direction?: "row" | "col";
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  direction = "col",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <div
        className={`flex ${direction === "row" ? "gap-6" : "flex-col gap-2"}`}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 text-brand-primary border-border bg-bg-card focus:ring-brand-primary"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-2 block text-sm text-text-primary cursor-pointer select-none"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
    </div>
  );
};
