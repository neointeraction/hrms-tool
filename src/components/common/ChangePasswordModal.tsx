import { useState } from "react";
import { Modal } from "../../components/common/Modal";
import { PasswordInput } from "./PasswordInput";
import { Lock } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const ChangePasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
}: ChangePasswordModalProps) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Password"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-status-error/10 text-status-error p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Current Password
          </label>
          <PasswordInput
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            icon={Lock}
            placeholder="Enter current password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            New Password
          </label>
          <PasswordInput
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            icon={Lock}
            placeholder="Enter new password"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Confirm New Password
          </label>
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            icon={Lock}
            placeholder="Confirm new password"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-main border border-border rounded-lg hover:bg-bg-hover transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
