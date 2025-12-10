import React, { forwardRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

interface DatePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      id,
      value,
      onChange,
      name,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    // Silence unused ref warning
    void ref;

    const inputId = id || name || Math.random().toString(36).substr(2, 9);

    // Parse the string value (YYYY-MM-DD) to Date object
    const selectedDate =
      value && typeof value === "string" && isValid(parseISO(value))
        ? parseISO(value)
        : null;

    const handleDateChange = (date: Date | null) => {
      if (onChange) {
        // Create a synthetic event to maintain compatibility with existing handlers
        const dateString = date ? format(date, "yyyy-MM-dd") : "";
        const syntheticEvent = {
          target: {
            value: dateString,
            name: name,
            type: "date",
          },
          currentTarget: {
            value: dateString,
            name: name,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onChange(syntheticEvent);
      }
    };

    // Custom header for the date picker
    const CustomHeader = ({
      date,
      decreaseMonth,
      increaseMonth,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }: any) => (
      <div className="flex items-center justify-between px-2 py-2">
        <button
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
          type="button"
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <span className="text-sm font-semibold text-gray-900">
          {format(date, "MMMM yyyy")}
        </span>
        <button
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
          type="button"
          className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50 transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>
    );

    // Custom input component to behave like a Popover trigger
    const ButtonInput = forwardRef(
      (
        {
          value,
          onClick,
          className,
          id,
          disabled,
          required,
          name,
          ...props
        }: any,
        ref: any
      ) => (
        <button
          type="button"
          onClick={onClick}
          ref={ref}
          id={id}
          name={name}
          disabled={disabled}
          className={`${className} text-left flex items-center w-full`} // Ensure text-left and flex for alignment
          {...props}
        >
          {value ? (
            <span className="text-text-primary">{value}</span>
          ) : (
            <span className="text-text-muted">Select date</span>
          )}
        </button>
      )
    );
    ButtonInput.displayName = "ButtonInput";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted z-10">
            <CalendarIcon size={16} />
          </div>
          <ReactDatePicker
            {...(props as any)}
            name={name}
            id={inputId}
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="MMM d, yyyy"
            placeholderText="Select date"
            disabled={disabled}
            required={required}
            customInput={<ButtonInput />}
            portalId="root"
            className={`
              w-full rounded-lg border bg-bg-card
              ${
                error
                  ? "border-status-error focus:ring-status-error"
                  : "border-border focus:ring-brand-primary"
              }
              pl-10 pr-3
              py-2 text-sm text-text-primary
              focus:outline-none focus:ring-2 focus:border-transparent
              disabled:bg-bg-main disabled:text-text-muted disabled:cursor-not-allowed
              ${className || ""}
            `}
            wrapperClassName="w-full"
            renderCustomHeader={CustomHeader}
            showPopperArrow={false}
            popperProps={{ strategy: "fixed" }}
            formatWeekDay={(nameOfDay) => nameOfDay.substr(0, 3)}
            dayClassName={() =>
              "text-sm text-gray-700 hover:bg-brand-primary hover:text-white rounded-full"
            }
            calendarClassName="!border-border !font-sans shadow-lg !rounded-lg !bg-white"
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-status-error">{error}</p>}
        {!error && helperText && (
          <p className="mt-1 text-xs text-text-muted">{helperText}</p>
        )}
        <style>{`
          .react-datepicker-wrapper {
            width: 100%;
          }
          .react-datepicker {
            font-family: inherit;
            border-color: #e5e7eb;
          }
          .react-datepicker__header {
            background-color: white;
            border-bottom: 1px solid #e5e7eb;
            border-top-left-radius: 0.5rem !important;
            border-top-right-radius: 0.5rem !important;
            padding-top: 0.5rem;
          }
          .react-datepicker__day-name {
            color: #6b7280;
            font-weight: 500;
            margin: 0.2rem;
            width: 2rem;
          }
          .react-datepicker__day {
            margin: 0.2rem;
            width: 2rem;
            line-height: 2rem;
            border-radius: 9999px;
          }
          .react-datepicker__day--selected {
            background-color: #4f46e5 !important;
            color: white !important;
          }
          .react-datepicker__day--keyboard-selected {
            background-color: #e0e7ff !important;
            color: #4f46e5 !important;
          }
          .react-datepicker__day--today {
            font-weight: bold;
            color: #4f46e5;
          }
          .react-datepicker__day:hover:not(.react-datepicker__day--disabled):not(.react-datepicker__day--selected) {
            background-color: #f3f4f6 !important;
            color: #1f2937 !important;
          }
          .react-datepicker-popper {
            z-index: 10050 !important;
          }
        `}</style>
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
