import { useState } from "react";
import { X } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Select } from "../../components/common/Select";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyLeaveModal({
  isOpen,
  onClose,
}: ApplyLeaveModalProps) {
  const [formData, setFormData] = useState({
    type: "Casual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiService.applyLeave(formData);
      onClose();
      // Ideally trigger a refresh in parent, but for now simple close
      window.location.reload(); // Simple reload to refresh list
    } catch (err: any) {
      setError(err.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-bg-card rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-border">
        <div className="flex justify-between items-center p-4 border-b border-border bg-bg-main">
          <h3 className="font-semibold text-text-primary">Apply for Leave</h3>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-status-error/10 text-status-error text-sm rounded-lg flex items-center gap-2">
              <X size={14} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <Select
              label="Leave Type"
              value={formData.type}
              onChange={(value) =>
                setFormData({ ...formData, type: value as string })
              }
              options={[
                { value: "Casual", label: "Casual Leave" },
                { value: "Sick", label: "Sick Leave" },
                { value: "Paid", label: "Paid Leave" },
                { value: "Unpaid", label: "Unpaid Leave" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary uppercase">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-border rounded-lg bg-bg-card focus:outline-none focus:border-brand-primary transition-colors text-sm text-text-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary uppercase">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full p-2 border border-border rounded-lg bg-bg-card focus:outline-none focus:border-brand-primary transition-colors text-sm text-text-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary uppercase">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Please provide a reason for your leave..."
              className="w-full p-2 border border-border rounded-lg bg-bg-card focus:outline-none focus:border-brand-primary transition-colors text-sm resize-none text-text-primary"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
