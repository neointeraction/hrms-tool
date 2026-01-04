import { useState, useEffect } from "react";
import {
  Shield,
  FileText,
  Bot,
  Activity,
  Database,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import RoleManagement from "./RoleManagement";
import AuditLogs from "./AuditLogs";
import QAConfig from "./QAConfig";
import { apiService } from "../../services/api.service";

type Tab = "roles" | "audit" | "ai-config";

import { useAuth } from "../../context/AuthContext";
import { Clock } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>(
    (searchParams.get("tab") as Tab) || "roles"
  );
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      console.log("Fetching system health...");
      const data = await apiService.getSystemHealth();
      console.log("System health data:", data);
      setSystemHealth(data);
    } catch (error) {
      console.error("Failed to load system health", error);
      // Optional: set error state to show in UI
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    return parts.join(" ") || "< 1m";
  };

  // Calculate Trial Days Remaining
  const getTrialDaysRemaining = () => {
    if (
      user?.tenantId &&
      typeof user.tenantId === "object" &&
      user.tenantId.status === "trial" &&
      user.tenantId.subscriptionEnd
    ) {
      const end = new Date(user.tenantId.subscriptionEnd);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return null;
  };

  const daysRemaining = getTrialDaysRemaining();

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
      {daysRemaining !== null && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            daysRemaining <= 3
              ? "bg-red-500/10 border-red-500/20 text-red-500"
              : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
          }`}
        >
          <Clock className="w-5 h-5" />
          <div className="font-medium">
            Trial Account:{" "}
            <span className="font-bold">{daysRemaining} days remaining</span>{" "}
            until expiration.
            {daysRemaining <= 0 && " (Expires Today)"}
          </div>
        </div>
      )}

      {/* ... header ... */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-text-primary">
          System Administration
        </h1>
        <p className="text-text-secondary">
          Manage users, roles, employees, and system configurations.
        </p>
      </div>

      {/* System Health Widgets */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-card p-4 rounded-xl border border-border flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Server Uptime
              </p>
              <p className="text-xl font-bold text-text-primary">
                {formatUptime(systemHealth.uptime)}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border flex items-center gap-4">
            <div
              className={`p-3 rounded-lg ${
                systemHealth.dbStatus === "Connected"
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Database Status
              </p>
              <p className="text-xl font-bold text-text-primary">
                {systemHealth.dbStatus}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-orange-500/10 text-orange-500`}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Recent Failed Actions
              </p>
              <p className="text-xl font-bold text-text-primary">
                {systemHealth.errorCount}
              </p>
            </div>
          </div>
        </div>
      )}

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
