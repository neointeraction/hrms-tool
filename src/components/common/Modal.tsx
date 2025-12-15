import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
  hideHeader?: boolean;
  padding?: string;
}

import { createPortal } from "react-dom";

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-md",
  hideHeader = false,
  padding = "p-6",
}: ModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div
        className={`bg-bg-card rounded-xl shadow-2xl w-full ${maxWidth} mx-4 animate-in fade-in zoom-in-95 duration-300 ease-out border border-border flex flex-col max-h-[90vh]`}
      >
        {!hideHeader && (
          <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-hover transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className={`${padding} space-y-4 overflow-y-auto`}>{children}</div>

        {footer && (
          <div className="p-3 bg-bg-main/50 rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
