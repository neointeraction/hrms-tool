import { X } from "lucide-react";
import HolidayManagement from "./HolidayManagement";

interface HolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HolidayModal({ isOpen, onClose }: HolidayModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-bg-card rounded-lg shadow-xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-border flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-bg-main shrink-0">
          <h3 className="font-semibold text-text-primary text-lg">
            Holiday Calendar
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 overflow-y-auto">
          <HolidayManagement isModal={true} />
        </div>
      </div>
    </div>
  );
}
