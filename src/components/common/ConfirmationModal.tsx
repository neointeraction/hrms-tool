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
        return <AlertTriangle size={32} className="text-status-error" />;
      case "warning":
        return <AlertCircle size={32} className="text-status-warning" />;
      case "success":
        return <CheckCircle size={32} className="text-status-success" />;
      case "info":
      default:
        return <Info size={32} className="text-brand-primary" />;
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
      footer={
        <div className="flex justify-end gap-3 w-full">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${getButtonColor()}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-3 rounded-full mb-4 ${getBgColor()}`}>
          {getIcon()}
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>

        <p className="text-sm text-text-secondary mb-4">{message}</p>
      </div>
    </Modal>
  );
}
