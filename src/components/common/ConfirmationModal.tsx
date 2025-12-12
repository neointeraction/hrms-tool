import { Modal } from "./Modal";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "./Button";

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      hideHeader={true}
      footer={null}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className={`p-3 rounded-full mb-4 ${getBgColor()}`}>
          {getIcon()}
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>

        <p className="text-sm text-text-secondary mb-8">{message}</p>

        <div className="flex items-center justify-center gap-3 w-full">
          {showCancel && (
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
          )}
          <Button
            onClick={onConfirm}
            className="w-full"
            variant={variant === "info" ? "primary" : variant}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
