import {
  Users,
  Shield,
  AlertTriangle,
  Activity,
  Settings,
  FileText,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      label: "Total Users",
      value: "124",
      change: "+4 this month",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Active Roles",
      value: "8",
      change: "No changes",
      icon: Shield,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Security Alerts",
      value: "2",
      change: "Requires attention",
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "System Uptime",
      value: "99.9%",
      change: "Last 30 days",
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  const quickActions = [
    {
      label: "Manage Users",
      desc: "Add, edit, or deactivate users",
      icon: Users,
      path: "/user-management",
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    },
    {
      label: "Role Configuration",
      desc: "Manage permissions and access",
      icon: Shield,
      path: "/user-management", // Ideally this should deep link to the Roles tab if possible, or just the main admin page
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
    {
      label: "Audit Logs",
      desc: "View system activity logs",
      icon: FileText,
      path: "/user-management", // Same here, links to admin module
      color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
    },
    {
      label: "System Settings",
      desc: "Global configuration",
      icon: Settings,
      path: "/settings", // Placeholder
      color: "bg-slate-50 text-slate-600 hover:bg-slate-100",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Smith (HR)",
      action: "Created new employee profile",
      target: "John Doe",
      time: "10 mins ago",
    },
    {
      id: 2,
      user: "System Admin",
      action: "Updated role permissions",
      target: "Project Manager Role",
      time: "1 hour ago",
    },
    {
      id: 3,
      user: "System",
      action: "Failed login attempt detected",
      target: "IP: 192.168.1.45",
      time: "2 hours ago",
      isAlert: true,
    },
    {
      id: 4,
      user: "Mike Johnson",
      action: "Reset password",
      target: "Self-service",
      time: "4 hours ago",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Admin Console</h1>
        <p className="text-text-secondary mt-1">
          Welcome back, {user?.name}. Here's the system overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-text-secondary text-sm font-medium">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-text-primary mt-2">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <p className="text-xs text-text-secondary mt-4 font-medium">
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-3 space-y-8">
          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-transparent transition-all hover:scale-105 ${action.color}`}
                >
                  <div className="p-2 bg-white/50 rounded-lg shadow-sm">
                    <action.icon size={24} />
                  </div>
                  <span className="font-semibold text-sm">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-text-primary">
                Recent System Activity
              </h2>
              <button className="text-sm text-brand-primary hover:underline">
                View All Logs
              </button>
            </div>
            <div className="divide-y divide-border">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`mt-1 w-2 h-2 rounded-full ${
                      activity.isAlert ? "bg-red-500" : "bg-blue-500"
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
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
