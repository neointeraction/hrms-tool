import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Select } from "../../components/common/Select";
import { DatePicker } from "../../components/common/DatePicker";
import { Modal } from "../../components/common/Modal";

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplyLeaveModal({
  isOpen,
  onClose,
}: ApplyLeaveModalProps) {
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
    isHalfDay: false,
  });
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    // Handle Checkbox
    if (type === "checkbox") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: isChecked,
        // If checking half day, sync end date to start date automatically
        endDate:
          name === "isHalfDay" && isChecked ? prev.startDate : prev.endDate,
      }));
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        // If half day is checked, keep endDate synced with startDate
        if (prev.isHalfDay && name === "startDate") {
          newData.endDate = value;
        }
        return newData;
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log("DEBUG: Fetching leave stats...");
      apiService.getLeaveStats().then((data) => {
        console.log("DEBUG: getLeaveStats response:", data);
        // Correctly handling backend response which returns { stats: [{ type: '...' }] }
        if (data && data.stats) {
          const types = data.stats.map((s: any) => s.type);
          console.log("DEBUG: Extracted Leave Types:", types);
          setLeaveTypes(types);
          // Set default type if not already set or invalid
          if (types.length > 0 && !types.includes(formData.type)) {
            setFormData((prev) => ({ ...prev, type: types[0] }));
          }
        } else if (data && data.leavePolicy) {
          // Fallback for older backend format if any
          const types = Object.keys(data.leavePolicy);
          setLeaveTypes(types);
          if (types.length > 0 && !types.includes(formData.type)) {
            setFormData((prev) => ({ ...prev, type: types[0] }));
          }
        } else {
          console.log("DEBUG: No stats or leavePolicy in data", data);
        }
      });
    }
  }, [isOpen]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply for Leave"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            disabled={loading}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            options={leaveTypes.map((type) => ({
              value: type,
              label: type,
            }))}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isHalfDay"
            name="isHalfDay"
            checked={formData.isHalfDay}
            onChange={handleChange}
            className="w-4 h-4 text-brand-primary border-border rounded focus:ring-brand-primary"
          />
          <label
            htmlFor="isHalfDay"
            className="text-sm font-medium text-text-primary"
          >
            Half Day Leave
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <DatePicker
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <DatePicker
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              disabled={formData.isHalfDay}
              className={
                formData.isHalfDay ? "opacity-50 cursor-not-allowed" : ""
              }
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
      </form>
    </Modal>
  );
}
