import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import {
  Save,
  Upload,
  Building2,
  Globe,
  Image as ImageIcon,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";

export default function SystemSettings() {
  const { showToast } = useNotification();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
    workHours: {
      start: "09:00",
      end: "18:00",
    },
    dateFormat: "DD/MM/YYYY",
    logo: null as File | null,
    favicon: null as File | null,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCompanySettings();
      const settings = data.company;

      setFormData({
        companyName: settings.name,
        subdomain: settings.subdomain || "",
        timezone: settings.timezone,
        currency: settings.currency,
        workHours: settings.workHours,
        dateFormat: settings.dateFormat,
        logo: null,
        favicon: null,
      });

      if (settings.logo) setLogoPreview(settings.logo);
      if (settings.favicon) setFaviconPreview(settings.favicon);
    } catch (error) {
      console.error("Failed to fetch settings", error);
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "logo" | "favicon"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, [field]: file }));

      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === "logo") setLogoPreview(reader.result as string);
        else setFaviconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = new FormData();
      data.append("companyName", formData.companyName);
      data.append("timezone", formData.timezone);
      data.append("currency", formData.currency);
      data.append("workHours", JSON.stringify(formData.workHours));
      data.append("dateFormat", formData.dateFormat);

      if (formData.logo) data.append("logo", formData.logo);
      if (formData.favicon) data.append("favicon", formData.favicon);

      await apiService.updateCompanySettings(data);
      await refreshUser(); // Refresh user context to update logo/favicon in layout
      showToast("System settings updated successfully", "success");

      // Need to refresh user context/layout to show new logo immediately?
      // Ideally context should update, or we force a reload.
      // For now, reload is safest to apply global changes like favicon.
      // window.location.reload();
      // Actually, let's just create a smooth experience, update context if possible or just notify.
    } catch (error: any) {
      console.error("Failed to update settings", error);
      showToast(error.message || "Failed to update settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          System Settings
        </h1>
        <p className="text-text-secondary">
          Manage your company branding and general configuration
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-bg-secondary overflow-hidden relative group">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-text-muted text-xs">No Logo</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-medium">Change</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "logo")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-sm text-text-secondary">
                  <p>Upload your company logo.</p>
                  <p className="mt-1 text-xs text-text-muted">
                    Recommended size: 200x200px. Max 5MB.
                  </p>
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
                  <p>Upload browser favicon.</p>
                  <p className="mt-1 text-xs text-text-muted">
                    .ico, .png, .jpg supported.
                  </p>
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

        {/* General Configuration Section */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="text-brand-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              General Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Subdomain
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={formData.subdomain}
                  disabled
                  className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-l-lg text-text-secondary cursor-not-allowed"
                />
                <span className="px-3 py-2 bg-bg-secondary border border-l-0 border-border rounded-r-lg text-text-secondary text-sm">
                  .yourhrms.com
                </span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Contact support to change subdomain.
              </p>
            </div>

            {/* Fields removed as per request */}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save size={20} />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
