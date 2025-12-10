import { useState, useEffect } from "react";
import { Shield, FileText, Bot } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import RoleManagement from "./RoleManagement";
import AuditLogs from "./AuditLogs";
import QAConfig from "./QAConfig";

type Tab = "roles" | "audit" | "ai-config";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "roles"
  );

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: "roles", label: "Role Management", icon: Shield },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "ai-config", label: "AI Configuration", icon: Bot },
  ];

  return (
    <div className="space-y-6">
      {/* ... header ... */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          System Administration
        </h1>
        <p className="text-text-secondary">
          Manage users, roles, employees, and system configurations.
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
      <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6">
        {activeTab === "roles" && <RoleManagement />}
        {activeTab === "audit" && <AuditLogs />}
        {activeTab === "ai-config" && <QAConfig />}
      </div>
    </div>
  );
}
