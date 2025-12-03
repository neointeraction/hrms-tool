import {
  User,
  Smartphone,
  FileText,
  Monitor,
  Mouse,
  Download,
} from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Profile & Assets</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="text-brand-primary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Personal Info
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Rohan G"
                className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="rohan.g@company.com"
                className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+91 98765 43210"
                className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Address
              </label>
              <textarea
                defaultValue="123, Tech Park Road, Bangalore, Karnataka - 560001"
                rows={3}
                className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              />
            </div>
            <button className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-secondary transition-colors font-medium">
              Update Details
            </button>
          </div>
        </div>

        {/* Assets */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Monitor className="text-brand-secondary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Assigned Assets
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-bg-main rounded-lg border border-border">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <Monitor size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">MacBook Pro M3</p>
                <p className="text-xs text-text-secondary">SN: C02XYZ123ABC</p>
                <p className="text-xs text-status-success mt-1">
                  Assigned: Jan 15, 2024
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-main rounded-lg border border-border">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <Mouse size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">Magic Mouse 2</p>
                <p className="text-xs text-text-secondary">SN: MM2-98765</p>
                <p className="text-xs text-status-success mt-1">
                  Assigned: Jan 15, 2024
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-bg-main rounded-lg border border-border">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <Smartphone size={20} className="text-text-secondary" />
              </div>
              <div>
                <p className="font-medium text-text-primary">
                  iPhone 15 (Test Device)
                </p>
                <p className="text-xs text-text-secondary">SN: IP15-TEST-01</p>
                <p className="text-xs text-status-warning mt-1">
                  Return by: Dec 31, 2025
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="text-brand-accent" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Documents
            </h2>
          </div>

          <div className="space-y-2">
            {[
              "Employment Contract",
              "NDA Agreement",
              "Offer Letter",
              "Tax Declaration 2024-25",
            ].map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 hover:bg-bg-main rounded-lg transition-colors group cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <FileText
                    size={18}
                    className="text-text-secondary group-hover:text-brand-primary transition-colors"
                  />
                  <span className="text-sm font-medium text-text-primary">
                    {doc}
                  </span>
                </div>
                <Download
                  size={16}
                  className="text-text-muted group-hover:text-brand-primary transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
