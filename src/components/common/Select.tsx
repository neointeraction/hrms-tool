import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  name?: string;
}

export const Select = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  className = "",
  placeholder = "Select an option",
  disabled = false,
  required = false,
  id,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("w-full", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-text-secondary mb-1"
        >
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <div className="relative">
        <div
          onClick={toggleOpen}
          className={cn(
            "w-full rounded-lg border bg-bg-card px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors",
            error
              ? "border-status-error focus:ring-status-error"
              : "border-border hover:border-text-muted focus:ring-brand-primary",
            isOpen && "ring-2 ring-brand-primary/20 border-brand-primary",
            disabled &&
              "bg-bg-main text-text-muted cursor-not-allowed opacity-70"
          )}
        >
          <span
            className={cn(
              "block truncate text-text-primary",
              !selectedOption && "text-text-muted"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-text-muted transition-transform duration-200",
              isOpen && "transform rotate-180"
            )}
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted text-center">
                No options available
              </div>
            ) : (
              <ul className="py-1">
                {options.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-bg-hover transition-colors text-text-primary",
                      option.value === value &&
                        "bg-brand-primary/5 text-brand-primary font-medium"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check size={14} />}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      )}
    </div>
  );
};
