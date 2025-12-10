import { useState } from "react";
import { X } from "lucide-react";
import { apiService } from "../../services/api.service";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create New Tenant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Acme Corporation"
              />
            </div>

            {/* Owner Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner Email *
              </label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@acme.com"
              />
            </div>

            {/* Subdomain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subdomain (Optional)
              </label>
              <input
                type="text"
                name="subdomain"
                value={formData.subdomain}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="acme"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                e.g., acme.yourhrms.com
              </p>
            </div>

            {/* Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subscription Plan *
              </label>
              <select
                name="plan"
                value={formData.plan}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="free">Free (10 employees)</option>
                <option value="basic">Basic (50 employees)</option>
                <option value="pro">Pro (200 employees)</option>
                <option value="enterprise">Enterprise (Unlimited)</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Tenant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTenantModal;
