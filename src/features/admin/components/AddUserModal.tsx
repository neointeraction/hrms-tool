import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Modal } from "../../../components/common/Modal";
import { Select } from "../../../components/common/Select";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          const data = await apiService.getRoles();
          setRoles(data);
        } catch (err) {
          console.error("Failed to fetch roles", err);
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Using registerUser for now, can be swapped for a specific admin create user endpoint
      await apiService.registerUser({
        ...formData,
        employeeId: `EMP${Math.floor(Math.random() * 10000)}`, // Auto-generate ID for now
        department: "General", // Default department
      });

      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        status: "active",
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create User"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
            User created successfully!
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors text-text-primary"
            placeholder="e.g. John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors text-text-primary"
            placeholder="john@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2.5 bg-bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors pr-10 text-text-primary"
              placeholder="Min. 6 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Role"
              required
              value={formData.role}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as string }))
              }
              options={roles.map((role) => ({
                value: role.name,
                label: role.name,
              }))}
            />
          </div>

          <div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as string }))
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
