import { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { Select } from "../../components/common/Select";
import { apiService } from "../../services/api.service";
import { Checkbox } from "../../components/common/Checkbox";
import { MODULES, MODULE_KEYS } from "../../constants/modules";

interface CreateTenantModalProps {
  onClose: () => void;
  onCreate: () => void;
}

const CreateTenantModal = ({ onClose, onCreate }: CreateTenantModalProps) => {
  const [formData, setFormData] = useState({
    companyName: "",
    ownerEmail: "",
    plan: "free",
    subdomain: "",
    limits: {
      enabledModules: MODULE_KEYS,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiService.createTenant(formData);
      setSuccess({
        email: response.admin.email,
        password: response.admin.tempPassword,
      });
      onCreate();
    } catch (err: any) {
      setError(err.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
              <svg
                className="h-6 w-6 text-green-600 dark:text-green-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Tenant Created Successfully!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The company admin account has been created. Please save these
              credentials:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left mb-4">
              <div className="mb-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </label>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {success.email}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Temporary Password
                </label>
                <p className="text-sm font-mono font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {success.password}
                </p>
              </div>
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
              ⚠️ The admin should change this password on first login
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Tenant"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-status-error/10 text-status-error p-4 rounded-lg flex items-center gap-2 text-sm">
            <X size={16} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Company Name <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Owner Email <span className="text-status-error">*</span>
              </label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                required
                placeholder="admin@company.com"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Plan
              </label>
              <Select
                name="plan"
                value={formData.plan}
                onChange={(value) =>
                  setFormData({ ...formData, plan: value as string })
                }
                options={[
                  { value: "free", label: "Free" },
                  { value: "basic", label: "Basic" },
                  { value: "pro", label: "Pro" },
                  { value: "enterprise", label: "Enterprise" },
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Subdomain (Optional)
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-border rounded-l-lg bg-bg-main text-text-primary focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                  placeholder="company"
                />
                <span className="px-3 py-2 bg-bg-secondary border-y border-r border-border rounded-r-lg text-text-secondary text-sm">
                  .hrms.com
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                e.g., acme.yourhrms.com
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-base font-semibold text-text-primary">
              Enabled Modules
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      enabledModules: MODULE_KEYS,
                    },
                  })
                }
                className="text-xs font-medium text-brand-primary hover:text-brand-primary/80 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      enabledModules: [],
                    },
                  })
                }
                className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-bg-secondary/50 rounded-lg border border-border">
            {MODULES.map((module) => (
              <Checkbox
                key={module.key}
                label={module.shortLabel || module.label}
                checked={formData.limits.enabledModules.includes(module.key)}
                onChange={(checked) => {
                  const currentModules = formData.limits.enabledModules;
                  setFormData({
                    ...formData,
                    limits: {
                      ...formData.limits,
                      enabledModules: checked
                        ? [...currentModules, module.key]
                        : currentModules.filter((m) => m !== module.key),
                    },
                  });
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary bg-bg-main border border-border rounded-lg hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 focus:ring-4 focus:ring-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Creating..." : "Create Tenant"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTenantModal;
