import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Shield, Box, Building2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/api.service";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";
import { Skeleton } from "../../../components/common/Skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
        const [employeesData, rolesData, assetsData, logsData] =
          await Promise.all([
            apiService.getAllEmployees().catch(() => []),
            apiService.getRoles().catch(() => []),
            apiService.getAssetStats().catch(() => ({ totalAssets: 0 })),
            apiService.getAuditLogs({ limit: 5 }).catch(() => ({ logs: [] })),
          ]);

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

          return {
            id: log._id,
            user: log.performedBy ? log.performedBy.name : "System",
            action: formatAction(log.action),
            target: `${log.entityType}${
              log.metadata?.name ? `: ${log.metadata.name}` : ""
            }`,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Recent Activity */}
          <section className="bg-bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">
                Recent System Activity
              </h2>
              <button
                onClick={() => navigate("/audit")}
                className="text-sm text-brand-primary hover:underline"
              >
                View All Logs
              </button>
            </div>
            <div className="divide-y divide-border">
              {loading ? (
                // Skeleton rows for activity
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 flex items-start gap-4">
                    <Skeleton className="mt-1 w-2 h-2 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 flex items-start gap-4 hover:bg-bg-hover transition-colors"
                  >
                    <div
                      className={`mt-1 w-2 h-2 rounded-full ${
                        activity.isAlert
                          ? "bg-status-error"
                          : "bg-brand-primary"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Target: {activity.target} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-text-secondary">
                  No recent activity found
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
