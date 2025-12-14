import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  className,
  size = "md",
}: BadgeProps) {
  const variants = {
    default:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-transparent",
    primary:
      "bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 border-transparent",
    secondary:
      "bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 border-transparent",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-transparent",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-transparent",
    error:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-transparent",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-transparent",
    outline:
      "bg-transparent border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
