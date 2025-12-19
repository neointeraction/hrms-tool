import { useEffect, useState } from "react";
import { apiService } from "../../../services/api.service";
import {
  Users,
  CalendarDays,
  Briefcase,
  Clock,
  Building2,
  Banknote,
} from "lucide-react";
import { OutflowChart } from "./OutflowChart";
import { ProjectStatusChart } from "./ProjectStatusChart";

interface CEOStats {
  totalEmployees: number;
  onLeaveToday: number;
  pendingLeaves: number;
  activeProjects: number;
  totalHours: number;
  totalClients: number;
  paymentOutflow: number;
  payrollBreakdown: Array<{ name: string; amount: number }>;
  projectDistribution: Array<{ name: string; value: number }>;
}

export const CEODashboard = () => {
  const [stats, setStats] = useState<CEOStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getCEOStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const widgets = [
    {
      label: "Total Employees",
      value: stats?.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "On Leave Today",
      value: stats?.onLeaveToday,
      subValue: `${stats?.pendingLeaves} Pending Requests`,
      icon: CalendarDays,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Active Projects",
      value: stats?.activeProjects,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      label: "Total Hours (This Month)",
      value: stats?.totalHours,
      icon: Clock,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      label: "Total Clients",
      value: stats?.totalClients,
      icon: Building2,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
            ></div>
          ))}
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl mt-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">CEO Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg ${widget.bg}`}>
                <widget.icon size={20} className={widget.color} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary mb-1">
                {widget.label}
              </p>
              <h3 className="text-xl font-bold text-text-primary">
                {widget.value || 0}
              </h3>
              {widget.subValue && (
                <p className="text-[10px] text-text-muted mt-1">
                  {widget.subValue}
                </p>
              )}
            </div>
          </div>
        ))}
        {/* Total Outflow Summary Card */}
        <div className="p-4 bg-white dark:bg-bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Banknote size={20} className="text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary mb-1">
              Total Payment Outflow
            </p>
            <h3 className="text-xl font-bold text-text-primary">
              {stats?.paymentOutflow?.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }) || 0}
            </h3>
            <p className="text-[10px] text-text-muted mt-1">This Month</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-white dark:bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <OutflowChart data={stats?.payrollBreakdown || []} />
        </div>

        <div className="h-80 bg-white dark:bg-bg-card border border-border rounded-xl p-6 shadow-sm">
          <ProjectStatusChart data={stats?.projectDistribution || []} />
        </div>
      </div>
    </div>
  );
};
