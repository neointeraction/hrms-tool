import {
  useState,
  useRef,
  type ReactNode,
  useLayoutEffect,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click";
}

export function Tooltip({
  content,
  children,
  position = "bottom",
  trigger = "hover",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [arrowOffset, setArrowOffset] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const innerWidth = window.innerWidth;

    let top = 0;
    let left = 0;
    let offset = 0;

    switch (position) {
      case "top":
        top = rect.top + scrollY - 8;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + scrollY + 8;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case "left":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - 8;
        break;
      case "right":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + 8;
        break;
    }

    // Boundary detection and adjustment for Top/Bottom positions (Horizontal clamping)
    if ((position === "top" || position === "bottom") && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const halfWidth = tooltipRect.width / 2;
      const padding = 10;

      const viewportCenter = left - scrollX;
      let newViewportCenter = viewportCenter;

      if (viewportCenter + halfWidth > innerWidth - padding) {
        newViewportCenter = innerWidth - padding - halfWidth;
      }
      if (viewportCenter - halfWidth < padding) {
        newViewportCenter = padding + halfWidth;
      }

      const newLeft = newViewportCenter + scrollX;
      offset = left - newLeft;
      left = newLeft;
    }

    setCoords({ top, left });
    setArrowOffset(offset);
  };

  const showTooltip = () => {
    calculatePosition();
    if (trigger === "hover") {
      timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const toggleTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isVisible) {
      hideTooltip();
    } else {
      showTooltip();
    }
  };

  // Click outside to close (for click trigger)
  useEffect(() => {
    if (trigger === "click" && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          hideTooltip();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [trigger, isVisible]);

  useLayoutEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  // Recalculate on scroll/resize if visible
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("scroll", calculatePosition);
      window.addEventListener("resize", calculatePosition);
      return () => {
        window.removeEventListener("scroll", calculatePosition);
        window.removeEventListener("resize", calculatePosition);
      };
    }
  }, [isVisible]);

  const tooltipContent = (
    <div
      ref={tooltipRef}
      className={`fixed z-[9999] px-3 py-1.5 text-xs font-medium text-text-primary bg-bg-card border border-border rounded shadow-lg animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap`}
      style={{
        top: coords.top,
        left: coords.left,
        transform:
          position === "top"
            ? "translate(-50%, -100%)"
            : position === "bottom"
            ? "translate(-50%, 0)"
            : position === "left"
            ? "translate(-100%, -50%)"
            : "translate(0, -50%)",
      }}
    >
      {content}
      {/* Arrow (Simplified) */}
      <div
        className={`absolute w-2 h-2 bg-bg-card border-l border-t border-border transform rotate-45 ${
          position === "top"
            ? "bottom-[-5px] left-1/2 -translate-x-1/2 -rotate-135 border-l-0 border-t-0 border-r border-b"
            : position === "bottom"
            ? "top-[-5px] left-1/2 -translate-x-1/2 border-l border-t"
            : position === "left"
            ? "right-[-5px] top-1/2 -translate-y-1/2 rotate-135 border-l-0 border-t-0 border-r border-b"
            : "left-[-5px] top-1/2 -translate-y-1/2 -rotate-45"
        }`}
        style={{
          marginLeft: arrowOffset ? `${arrowOffset}px` : undefined,
        }}
      />
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        className="relative flex items-center justify-center cursor-pointer"
        onMouseEnter={trigger === "hover" ? showTooltip : undefined}
        onMouseLeave={trigger === "hover" ? hideTooltip : undefined}
        onClick={trigger === "click" ? toggleTooltip : undefined}
      >
        {children}
      </div>
      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
}
