import {
  Activity,
  Shield,
  Server,
  Database,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          System Overview 🛡️
        </h1>
        <p className="text-text-secondary mt-1">
          Monitoring {user?.name}'s admin console
        </p>
      </div>

      {/* Health Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-status-success" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              System Uptime
            </h2>
          </div>
          <p className="text-3xl font-bold text-text-primary">99.98%</p>
          <p className="text-sm text-text-secondary mb-4">Last 30 days</p>
          <div className="flex items-center gap-2 text-sm text-status-success">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            All Systems Operational
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Server className="text-brand-primary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Server Load
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-text-secondary">CPU Usage</span>
                <span className="text-text-primary">45%</span>
              </div>
              <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[45%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span className="text-text-secondary">Memory</span>
                <span className="text-text-primary">62%</span>
              </div>
              <div className="h-1.5 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[62%] rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Database className="text-status-info" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">Backups</h2>
          </div>
          <p className="text-lg font-medium text-text-primary">
            Last Backup: 2h ago
          </p>
          <p className="text-sm text-text-secondary mb-4">Size: 4.2 GB</p>
          <button className="text-sm text-brand-primary hover:underline">
            View Logs
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-status-warning" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Security Alerts
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-bg-main rounded-lg border-l-4 border-status-warning">
              <AlertTriangle size={16} className="text-status-warning" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Failed Login Attempts
                </p>
                <p className="text-xs text-text-secondary">
                  5 attempts from IP 192.168.1.1
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg-main rounded-lg border-l-4 border-status-success">
              <Shield size={16} className="text-status-success" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Patch Update
                </p>
                <p className="text-xs text-text-secondary">
                  Security patch v2.4 applied successfully
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-brand-secondary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Role Audit
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-2 hover:bg-bg-main rounded transition-colors">
              <span className="text-sm text-text-primary">Admin Users</span>
              <span className="font-mono text-sm font-bold">3</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-bg-main rounded transition-colors">
              <span className="text-sm text-text-primary">HR Executives</span>
              <span className="font-mono text-sm font-bold">5</span>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-bg-main rounded transition-colors">
              <span className="text-sm text-text-primary">Managers</span>
              <span className="font-mono text-sm font-bold">12</span>
            </div>
            <button className="w-full mt-2 py-2 border border-border rounded-lg text-sm hover:bg-bg-hover">
              Generate Audit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
