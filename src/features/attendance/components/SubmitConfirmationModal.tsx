import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";

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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Submission"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm Submit</Button>
        </div>
      }
    >
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
    </Modal>
  );
}
