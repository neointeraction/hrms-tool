import { useState, useRef, type ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  position = "bottom",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-100 px-3 py-1.5 text-xs font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg whitespace-nowrap animate-in fade-in zoom-in-95 duration-200 ${positionClasses[position]}`}
          style={{ zIndex: 100 }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45 ${
              position === "top"
                ? "bottom-[-5px] left-1/2 -translate-x-1/2 -rotate-135 border-l-0 border-t-0 border-r border-b"
                : position === "bottom"
                ? "top-[-5px] left-1/2 -translate-x-1/2 border-l border-t"
                : position === "left"
                ? "right-[-5px] top-1/2 -translate-y-1/2 rotate-135 border-l-0 border-t-0 border-r border-b"
                : "left-[-5px] top-1/2 -translate-y-1/2 -rotate-45"
            }`}
          />
        </div>
      )}
    </div>
  );
}
