import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { cn } from "../../utils/cn";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackColor?: string;
}

export default function Avatar({
  src,
  alt,
  name,
  className,
  size = "md",
  fallbackColor = "bg-brand-secondary",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "w-8 h-8 text-xs";
      case "md":
        return "w-10 h-10 text-sm";
      case "lg":
        return "w-16 h-16 text-lg";
      case "xl":
        return "w-24 h-24 text-2xl";
      default:
        return "w-10 h-10 text-sm";
    }
  };

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center text-white font-bold overflow-hidden",
          fallbackColor,
          getSizeClasses(),
          className
        )}
      >
        {name ? getInitials(name) : <User size={16} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden",
        getSizeClasses(),
        className
      )}
    >
      <img
        src={src}
        alt={alt || name || "Avatar"}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
