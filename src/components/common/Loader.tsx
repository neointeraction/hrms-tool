import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

interface LoaderProps {
  size?: number | string;
  className?: string;
  variant?: "primary" | "secondary" | "white" | "muted";
}

export function Loader({
  size = 24,
  className,
  variant = "primary",
}: LoaderProps) {
  const variantStyles = {
    primary: "text-brand-primary",
    secondary: "text-text-secondary",
    white: "text-white",
    muted: "text-text-muted",
  };

  return (
    <Loader2
      size={size}
      className={cn("animate-spin", variantStyles[variant], className)}
    />
  );
}
