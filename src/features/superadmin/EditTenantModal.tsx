import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { apiService } from "../../services/api.service";
import { Checkbox } from "../../components/common/Checkbox";
import { Select } from "../../components/common/Select";
import { MODULES, MODULE_KEYS } from "../../constants/modules";

interface EditTenantModalProps {
  tenant: any;
  onClose: () => void;
  onUpdate: () => void;
}

interface TenantFormData {
  companyName: string;
  ownerEmail: string;
  plan: string;
  subdomain: string;
  limits: {
    enabledModules: string[];
  };
}

const EditTenantModal = ({
  tenant,
  onClose,
  onUpdate,
}: EditTenantModalProps) => {
  const [formData, setFormData] = useState<TenantFormData>({
    companyName: "",
    ownerEmail: "",
    plan: "free",
    subdomain: "",
    limits: { enabledModules: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.companyName || "",
        ownerEmail: tenant.ownerEmail || "",
        plan: tenant.plan || "free",
        subdomain: tenant.subdomain || "",
        limits: tenant.limits || { enabledModules: [] },
      });
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiService.updateTenant(tenant._id, formData);
      onUpdate();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update tenant");
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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Tenant"
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
                Company Name
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
                Owner Email
              </label>
              <input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main text-text-secondary cursor-not-allowed focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all opacity-70"
                required
                disabled
              />
              <p className="mt-1 text-xs text-text-secondary">
                Cannot be changed after creation
              </p>
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
                checked={
                  formData.limits?.enabledModules?.includes(module.key) || false
                }
                onChange={(checked) => {
                  const currentModules = formData.limits?.enabledModules || [];
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTenantModal;
