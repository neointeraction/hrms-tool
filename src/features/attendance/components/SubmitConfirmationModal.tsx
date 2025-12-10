import { X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  weekStartDate: Date | undefined;
  totalHours: number;
}

export default function SubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  weekStartDate,
  totalHours,
}: SubmitConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-panel border border-border-dim rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary">
            Confirm Submission
          </h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div className="text-sm">
              <p className="font-semibold mb-1">Attention Required</p>
              <p>
                Once submitted, you will not be able to edit these timesheet
                entries without manager approval.
              </p>
            </div>
          </div>

          <div className="bg-bg-main p-4 rounded-lg space-y-2 border border-border-dim">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Week Starting:</span>
              <span className="font-medium text-text-primary">
                {weekStartDate ? format(weekStartDate, "MMM d, yyyy") : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Total Hours:</span>
              <span className="font-bold text-text-primary">
                {totalHours} hrs
              </span>
            </div>
          </div>

          <p className="text-text-secondary text-sm">
            Are you sure you want to submit your timesheet for this week?
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-bg-main hover:bg-bg-secondary rounded-md border border-border-dim transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-md shadow-lg shadow-brand-primary/20 transition-all hover:scale-[1.02]"
          >
            Confirm Submit
          </button>
        </div>
      </div>
    </div>
  );
}
