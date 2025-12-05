import { useState } from "react";
import { Users, FileText, Activity, Monitor } from "lucide-react";
import EmployeeProfiles from "./components/EmployeeProfiles";
import DocumentRepository from "./components/DocumentRepository.tsx";
import StatusTracking from "./components/StatusTracking.tsx";
import AssetManagement from "./components/AssetManagement.tsx";

type Tab = "profiles" | "documents" | "status" | "assets";

export default function TeamManagement() {
  const [activeTab, setActiveTab] = useState<Tab>("profiles");

  const tabs = [
    { id: "profiles", label: "Employee Profiles", icon: Users },
    { id: "documents", label: "Document Repository", icon: FileText },
    { id: "status", label: "Status Tracking", icon: Activity },
    { id: "assets", label: "Asset Management", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          Team Management
        </h1>
        <p className="text-text-secondary">
          Manage employees, documents, status, and assets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-border p-6">
        {activeTab === "profiles" && <EmployeeProfiles />}
        {activeTab === "documents" && <DocumentRepository />}
        {activeTab === "status" && <StatusTracking />}
        {activeTab === "assets" && <AssetManagement />}
      </div>
    </div>
  );
}
