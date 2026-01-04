import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Shield,
  Box,
  Building2,
  Activity,
  UserPlus,
  LogIn,
  FileText,
  AlertCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/api.service";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";
import { Skeleton } from "../../../components/common/Skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  const [systemHealth, setSystemHealth] = useState<any>(null);

  const [statsData, setStatsData] = useState({
    users: 0,
    roles: 0,
    assets: 0,
    departments: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employeesData, rolesData, assetsData, logsData, healthData] =
          await Promise.all([
            apiService.getAllEmployees().catch(() => []),
            apiService.getRoles().catch(() => []),
            apiService.getAssetStats().catch(() => ({ totalAssets: 0 })),
            apiService.getAuditLogs({ limit: 5 }).catch(() => ({ logs: [] })),
            apiService.getSystemHealth().catch(() => null),
          ]);

        if (healthData) {
          setSystemHealth(healthData);
        }

        // Handle both array (actual API) and object (type definition) responses
        const employeesList = Array.isArray(employeesData)
          ? employeesData
          : (employeesData as any).employees || [];

        const empCount = employeesList.length;

        // Calculate unique departments
        const uniqueDepartments = new Set(
          employeesList
            .map((emp: any) => emp.department)
            .filter((dept: any) => dept)
        ).size;

        setStatsData({
          users: empCount,
          roles: rolesData.length || 0,
          assets: assetsData.totalAssets || 0,
          departments: uniqueDepartments,
        });

        // Map logs to activity format
        const mappedLogs = (logsData.logs || []).map((log: any) => {
          const timeAgo = new Date(log.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }); // Simplified for now, or use a helper

          // Calculate relative time
          const now = new Date();
          const created = new Date(log.createdAt);
          const diffInSeconds = Math.floor(
            (now.getTime() - created.getTime()) / 1000
          );
          let relativeTime = timeAgo;

          if (diffInSeconds < 60) relativeTime = "Just now";
          else if (diffInSeconds < 3600)
            relativeTime = `${Math.floor(diffInSeconds / 60)} mins ago`;
          else if (diffInSeconds < 86400)
            relativeTime = `${Math.floor(diffInSeconds / 3600)} hours ago`;
          else relativeTime = `${Math.floor(diffInSeconds / 86400)} days ago`;

          let details = log.metadata?.name ? `: ${log.metadata.name}` : "";

          // Add change details if available
          if (log.action === "update" && log.changes) {
            const changedFields = Object.keys(log.changes);
            if (changedFields.length > 0) {
              const firstField = changedFields[0];
              const change = log.changes[firstField];
              // Check if it's a simple from/to object
              if (change && typeof change === "object" && "to" in change) {
                details += ` (${firstField} -> ${change.to})`;
              } else {
                details += ` (Updated ${changedFields.join(", ")})`;
              }

              if (changedFields.length > 1) {
                details += ` +${changedFields.length - 1} more`;
              }
            }
          }

          return {
            id: log._id,
            user: log.performedBy ? log.performedBy.name : "System",
            action: formatAction(log.action),
            target: `${log.entityType}${details}`,
            time: relativeTime,
            isAlert: log.action === "delete" || log.action === "reject",
          };
        });
        setRecentActivity(mappedLogs);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, " ");
  };

  const stats = [
    {
      label: "Total Employees",
      value: statsData.users.toString(),
      change: "Active employees",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Roles",
      value: statsData.roles.toString(),
      change: "Configured roles",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Total Assets",
      value: statsData.assets.toString(),
      change: "Tracked inventory",
      icon: Box,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Departments",
      value: statsData.departments.toString(),
      change: "Active departments",
      icon: Building2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Admin Console
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back, {user?.name}.
            {user?.tenantId && typeof user.tenantId === "object" && (
              <span className="ml-1 text-brand-primary font-medium">
                @ {(user.tenantId as any).companyName}
              </span>
            )}
          </p>
        </div>
        <AppreciationWidget />
      </div>

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm font-medium">
                  {stat.label}
                </p>
                <div className="mt-2">
                  {loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <h3 className="text-2xl font-bold text-text-primary">
                      {stat.value}
                    </h3>
                  )}
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${stat.bg.replace(
                  "bg-",
                  "bg-"
                )}/10 ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-4">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <p className="text-xs text-text-secondary font-medium">
                  {stat.change}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Takes 2 cols */}
        <div className="lg:col-span-2">
          <section className="bg-bg-card rounded-xl border border-border shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-main/30">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-brand-primary" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Recent System Activity
                </h2>
              </div>
              <button
                onClick={() => navigate("/audit")}
                className="text-sm font-medium text-brand-primary hover:text-brand-secondary transition-colors"
              >
                View All Logs
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        {i !== 4 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivity.length > 0 ? (
                <div className="space-y-0">
                  {recentActivity.map((activity, index) => {
                    const isLast = index === recentActivity.length - 1;
                    const getIcon = (action: string) => {
                      const lower = action.toLowerCase();
                      if (lower.includes("create") || lower.includes("add"))
                        return UserPlus;
                      if (lower.includes("login")) return LogIn;
                      if (lower.includes("update") || lower.includes("edit"))
                        return FileText;
                      if (lower.includes("delete") || lower.includes("remove"))
                        return AlertCircle;
                      return Activity;
                    };

                    const Icon = getIcon(activity.action);

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-4 group"
                      >
                        {/* Timeline Line */}
                        {!isLast && (
                          <div className="absolute left-[15px] top-8 bottom-[-8px] w-0.5 bg-border group-hover:bg-brand-primary/30 transition-colors" />
                        )}

                        {/* Icon Bubble */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                            activity.isAlert
                              ? "bg-status-error/10 border-status-error/20 text-status-error"
                              : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
                          }`}
                        >
                          <Icon size={14} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                            <p className="text-sm font-medium text-text-primary">
                              <span className="font-bold hover:text-brand-primary transition-colors cursor-pointer">
                                {activity.user}
                              </span>{" "}
                              <span className="text-text-secondary font-normal">
                                {activity.action.toLowerCase()}
                              </span>{" "}
                              <span className="font-semibold text-text-primary">
                                {activity.target}
                              </span>
                            </p>
                            <span className="text-xs text-text-secondary whitespace-nowrap flex items-center gap-1 bg-bg-main px-2 py-0.5 rounded-full border border-border/50">
                              <Clock size={10} />
                              {activity.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                  <div className="w-12 h-12 bg-bg-main rounded-full flex items-center justify-center mb-3">
                    <Activity size={24} className="opacity-50" />
                  </div>
                  <p>No recent activity found</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Plan Usage Widget - Takes 1 col */}
        <div className="lg:col-span-1">
          {systemHealth?.planStats && (
            <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-text-secondary text-sm font-medium">
                    Current Plan
                  </p>
                  <h3 className="text-2xl font-bold text-text-primary capitalize">
                    {systemHealth.planStats.plan}
                  </h3>
                </div>
                <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <CreditCard size={20} />
                </div>
              </div>

              <div className="space-y-6">
                {/* Employee Limit */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Employees</span>
                    <span className="font-medium text-text-primary">
                      {systemHealth.planStats.usage.employeeCount} /{" "}
                      {systemHealth.planStats.limits.maxEmployees}
                    </span>
                  </div>
                  <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (systemHealth.planStats.usage.employeeCount /
                            systemHealth.planStats.limits.maxEmployees) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Storage Limit */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">Storage</span>
                    <span className="font-medium text-text-primary">
                      {systemHealth.planStats.usage.storageUsed} MB /{" "}
                      {systemHealth.planStats.limits.maxStorage} MB
                    </span>
                  </div>
                  <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (systemHealth.planStats.usage.storageUsed /
                            systemHealth.planStats.limits.maxStorage) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
