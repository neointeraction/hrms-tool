import { useState } from "react";
import { Users, Shield, FileText } from "lucide-react";
import UserManagement from "./UserManagement";
import RoleManagement from "./RoleManagement";
import AuditLogs from "./AuditLogs";

type Tab = "users" | "roles" | "audit";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  const tabs = [
    { id: "users", label: "User Management", icon: Users },
    { id: "roles", label: "Role Management", icon: Shield },
    { id: "audit", label: "Audit Logs", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          System Administration
        </h1>
        <p className="text-text-secondary">
          Manage users, roles, and system configurations.
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
        {activeTab === "users" && <UserManagement />}
        {activeTab === "roles" && <RoleManagement />}
        {activeTab === "audit" && <AuditLogs />}
      </div>
    </div>
  );
}
