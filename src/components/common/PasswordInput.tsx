import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "../../utils/cn";

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ElementType;
}

export function PasswordInput({
  className,
  icon: Icon = Lock, // Default to Lock if not provided, pass null to disable
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          size={18}
        />
      )}
      <input
        type={showPassword ? "text" : "password"}
        className={cn(
          "w-full rounded-lg border border-border bg-bg-card text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:border-transparent focus:ring-brand-primary h-[38px]",
          Icon ? "pl-10" : "px-3",
          "pr-10 py-2 text-sm",
          className
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors focus:outline-none"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
