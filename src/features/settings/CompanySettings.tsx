import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { Save, Building, Globe, DollarSign, Clock } from "lucide-react";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";

interface CompanySettings {
  name: string;
  subdomain: string;
  timezone: string;
  currency: string;
  workHours: {
    start: string;
    end: string;
  };
  logo?: string;
  dateFormat: string;
  ownerEmail: string;
}

const CompanySettings = () => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    timezone: "America/New_York",
    currency: "USD",
    workHours: {
      start: "09:00",
      end: "18:00",
    },
    dateFormat: "MM/DD/YYYY",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCompanySettings();
      setSettings(response.company);
      setFormData({
        companyName: response.company.name,
        timezone: response.company.timezone,
        currency: response.company.currency,
        workHours: response.company.workHours,
        dateFormat: response.company.dateFormat,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      await apiService.updateCompanySettings(formData);
      setSuccess(true);
      loadSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("workHours.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        workHours: {
          ...formData.workHours,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Company Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your organization's configuration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
            Settings saved successfully!
          </div>
        )}

        {/* Company Name */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subdomain
              </label>
              <Input
                value={settings?.subdomain || ""}
                disabled
                className="bg-gray-100 dark:bg-gray-900 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Subdomain cannot be changed
              </p>
            </div>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Regional Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timezone
              </label>
              <Select
                value={formData.timezone}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    timezone: value as string,
                  }))
                }
                options={[
                  { value: "America/New_York", label: "Eastern Time (ET)" },
                  { value: "America/Chicago", label: "Central Time (CT)" },
                  { value: "America/Denver", label: "Mountain Time (MT)" },
                  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
                  { value: "Europe/London", label: "London (GMT)" },
                  { value: "Asia/Kolkata", label: "India (IST)" },
                  { value: "Asia/Singapore", label: "Singapore (SGT)" },
                ]}
                className="bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="inline mr-1" size={16} />
                Currency
              </label>
              <Select
                value={formData.currency}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: value as string,
                  }))
                }
                options={[
                  { value: "USD", label: "USD - US Dollar" },
                  { value: "EUR", label: "EUR - Euro" },
                  { value: "GBP", label: "GBP - British Pound" },
                  { value: "INR", label: "INR - Indian Rupee" },
                  { value: "SGD", label: "SGD - Singapore Dollar" },
                ]}
                className="bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Format
              </label>
              <Select
                value={formData.dateFormat}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    dateFormat: value as string,
                  }))
                }
                options={[
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
                ]}
                className="bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Work Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Work Hours
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <Input
                type="time"
                name="workHours.start"
                value={formData.workHours.start}
                onChange={handleChange}
                className="bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <Input
                type="time"
                name="workHours.end"
                value={formData.workHours.end}
                onChange={handleChange}
                className="bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanySettings;
