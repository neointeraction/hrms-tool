import { useState, useEffect } from "react";
import { Plane, Pill, CalendarDays } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Loader } from "../../components/common/Loader";

interface LeaveStat {
  type: string;
  total: number;
  used: number;
  pending: number; // This is actually "Available"
}

export default function LeaveBalance() {
  const [stats, setStats] = useState<LeaveStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getLeaveStats();
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch leave stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "Casual":
        return <Plane size={24} className="text-blue-600" />;
      case "Sick":
        return <Pill size={24} className="text-red-600" />;
      case "Floating":
        return <CalendarDays size={24} className="text-purple-600" />;
      default:
        return <CalendarDays size={24} className="text-gray-600" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "Casual":
        return "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800";
      case "Sick":
        return "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800";
      case "Floating":
        return "bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800";
      default:
        return "bg-gray-50/50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader size={24} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.type}
          className={`p-4 rounded-xl border transition-colors ${getColor(
            stat.type
          )}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white dark:bg-bg-card rounded-lg shadow-sm border border-border">
              {getIcon(stat.type)}
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-white/50 dark:bg-white/10 rounded-full text-text-primary">
              {stat.type} Leave
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-text-primary">
              {stat.pending}/{stat.total}
            </h3>
            <p className="text-sm text-text-secondary font-medium">
              Available Balance
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between text-xs text-text-muted">
            <span>Used: {stat.used}</span>
            <span>Total: {stat.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
