import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className={`bg-bg-card rounded-xl shadow-2xl w-full ${maxWidth} mx-4 animate-in fade-in zoom-in-95 duration-300 ease-out border border-border`}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">{children}</div>

        {footer && (
          <div className="p-6 border-t border-border bg-bg-main/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
