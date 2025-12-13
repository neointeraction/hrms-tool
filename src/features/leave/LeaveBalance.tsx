import { useState, useEffect } from "react";
import { Plane, Pill, CalendarDays, Users } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Skeleton } from "../../components/common/Skeleton";

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

  const getStyle = (type: string) => {
    const normalize = (s: string) => s.toLowerCase();
    const t = normalize(type);

    if (t.includes("casual")) {
      return {
        icon: <Plane size={24} className="text-blue-600" />,
        color:
          "bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800",
      };
    } else if (t.includes("sick") || t.includes("medical")) {
      return {
        icon: <Pill size={24} className="text-red-600" />,
        color:
          "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-800",
      };
    } else if (
      t.includes("annual") ||
      t.includes("earned") ||
      t.includes("privilege")
    ) {
      return {
        icon: <CalendarDays size={24} className="text-purple-600" />,
        color:
          "bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-800",
      };
    } else if (
      t.includes("maternity") ||
      t.includes("paternity") ||
      t.includes("parental")
    ) {
      return {
        icon: <Users size={24} className="text-pink-600" />,
        color:
          "bg-pink-50/50 border-pink-100 dark:bg-pink-900/10 dark:border-pink-800",
      };
    } else if (t.includes("unpaid") || t.includes("lop")) {
      return {
        icon: <CalendarDays size={24} className="text-orange-600" />,
        color:
          "bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800",
      };
    } else {
      // Default / Floating / Custom
      return {
        icon: <CalendarDays size={24} className="text-teal-600" />,
        color:
          "bg-teal-50/50 border-teal-100 dark:bg-teal-900/10 dark:border-teal-800",
      };
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-border bg-bg-card"
          >
            <div className="flex justify-between items-start mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="mt-4 pt-3 border-t border-border flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => {
        const style = getStyle(stat.type);
        return (
          <div
            key={stat.type}
            className={`p-4 rounded-xl border transition-colors ${style.color}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white dark:bg-bg-card rounded-lg shadow-sm border border-border">
                {style.icon}
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
        );
      })}
    </div>
  );
}
