import { Modal } from "./Modal";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
  showCancel?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  showCancel = true,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertTriangle size={28} className="text-status-error" />;
      case "warning":
        return <AlertCircle size={28} className="text-status-warning" />;
      case "success":
        return <CheckCircle size={28} className="text-status-success" />;
      case "info":
      default:
        return <Info size={28} className="text-brand-primary" />;
    }
  };

  const getBgColor = () => {
    switch (variant) {
      case "danger":
        return "bg-status-error/10";
      case "warning":
        return "bg-status-warning/10";
      case "success":
        return "bg-status-success/10";
      case "info":
      default:
        return "bg-brand-primary/10";
    }
  };

  const getButtonColor = () => {
    switch (variant) {
      case "danger":
        return "bg-status-error hover:bg-status-error/90";
      case "warning":
        return "bg-status-warning hover:bg-status-warning/90";
      case "success":
        return "bg-status-success hover:bg-status-success/90";
      case "info":
      default:
        return "bg-brand-primary hover:bg-brand-primary/90";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      hideHeader={true}
      padding="p-4"
      footer={
        <div className="flex justify-center gap-4 w-full">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-3 py-1.5 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${getButtonColor()}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-0">
        <div
          className={`p-3 rounded-full mb-3 ${getBgColor()} animate-in zoom-in-50 duration-300`}
        >
          {getIcon()}
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-1">{title}</h3>

        <p className="text-base text-text-secondary leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
}
