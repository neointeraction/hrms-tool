import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Globe } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { apiService } from "../../services/api.service";
import { Checkbox } from "../../components/common/Checkbox";
import { Select } from "../../components/common/Select";
import { Input } from "../../components/common/Input";
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

  // Branding State
  const [logo, setLogo] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "favicon"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (field === "logo") {
        setLogo(file);
      } else {
        setFavicon(file);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "logo") setLogoPreview(reader.result as string);
        else setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (tenant) {
      setFormData({
        companyName: tenant.companyName || "",
        ownerEmail: tenant.ownerEmail || "",
        plan: tenant.plan || "free",
        subdomain: tenant.subdomain || "",
        limits: tenant.limits || { enabledModules: [] },
      });
      const logoUrl = tenant.settings?.logo || tenant.logo;
      const faviconUrl = tenant.settings?.favicon || tenant.favicon;

      if (logoUrl) setLogoPreview(logoUrl);
      if (faviconUrl) setFaviconPreview(faviconUrl);
    }
  }, [tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("companyName", formData.companyName);
      data.append("plan", formData.plan);
      data.append("subdomain", formData.subdomain);
      data.append("limits", JSON.stringify(formData.limits));

      if (logo) data.append("logo", logo);
      if (favicon) data.append("favicon", favicon);

      await apiService.updateTenant(tenant._id, data);
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
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="bg-bg-main"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Owner Email
              </label>
              <Input
                type="email"
                name="ownerEmail"
                value={formData.ownerEmail}
                onChange={handleChange}
                className="bg-bg-main opacity-70 cursor-not-allowed"
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
                <div className="flex-1">
                  <Input
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    className="bg-bg-main rounded-r-none"
                    placeholder="company"
                  />
                </div>
                <span className="px-3 py-2 bg-bg-secondary border-y border-r border-border rounded-r-lg text-text-secondary text-sm">
                  .hrms.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="text-brand-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Branding
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Company Logo
              </label>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-bg-secondary overflow-hidden relative group">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-text-muted text-[10px]">No Logo</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-[10px] font-medium">Change</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-sm text-text-secondary">
                  <p className="text-xs">Upload company logo.</p>
                  <div className="mt-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-bg-hover transition-colors text-xs font-medium">
                      <Upload size={14} />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Favicon
              </label>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-bg-secondary overflow-hidden relative group">
                  {faviconPreview ? (
                    <img
                      src={faviconPreview}
                      alt="Favicon preview"
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Globe className="text-text-muted" size={24} />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-[10px] font-medium">Change</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "favicon")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-sm text-text-secondary">
                  <p className="text-xs">Upload favicon.</p>
                  <div className="mt-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg hover:bg-bg-hover transition-colors text-xs font-medium">
                      <Upload size={14} />
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "favicon")}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
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
                onChange={(e) => {
                  const checked = e.target.checked;
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
