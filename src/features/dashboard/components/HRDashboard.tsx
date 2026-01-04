import { useAuth } from "../../../context/AuthContext";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import { useGreeting } from "../../../hooks/useGreeting";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";
import { Users, UserPlus, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "../../../services/api.service";
import { Skeleton } from "../../../components/common/Skeleton";

export default function HRDashboard() {
  const { user } = useAuth();
  const { text } = useGreeting();
  const [hrStats, setHrStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await apiService.getHRStats();
        setHrStats(stats);
      } catch (error) {
        console.error("Failed to fetch HR stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            {text}, {user?.name.split(" ")[0]}!{" "}
          </h1>
          <p className="text-text-secondary mt-1">HR Operations Overview</p>
        </div>
        <AppreciationWidget />
      </div>

      {/* Quick Stats: Attendance, Leave, Holiday */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("attendance")) && (
          <AttendanceWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("leave")) && (
          <LeaveWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("leave")) && (
          <UpcomingHolidayWidget />
        )}
      </div>

      {/* HR Analytics Row: Onboarding, Dept */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Onboarding Analytics */}
        <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Onboarding
              </h3>
              <p className="text-sm text-text-secondary">
                Recruitment Overview
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-md">
                  <Clock size={16} />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  Pending Requests
                </span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-lg font-bold text-text-primary">
                  {hrStats?.pendingOnboarding || 0}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-md">
                  <Users size={16} />
                </div>
                <span className="text-sm font-medium text-text-secondary">
                  New Joiners (This Month)
                </span>
              </div>
              {loading ? (
                <Skeleton className="h-6 w-8" />
              ) : (
                <span className="text-lg font-bold text-text-primary">
                  {hrStats?.newJoiners || 0}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-bg-card p-6 rounded-xl border border-border shadow-sm col-span-1 md:col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Department Headcount
              </h3>
              <p className="text-sm text-text-secondary">
                Employee distribution across departments
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {loading
              ? Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 flex-1" />
                    </div>
                  ))
              : hrStats?.departmentDist?.map((dept: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-text-primary">
                        {dept.name}
                      </span>
                      <span className="text-text-secondary">
                        {dept.value} Employees
                      </span>
                    </div>
                    <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full"
                        style={{
                          width: `${Math.min(
                            (dept.value /
                              Math.max(
                                ...hrStats.departmentDist.map(
                                  (d: any) => d.value
                                ),
                                1
                              )) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            {!loading &&
              (!hrStats?.departmentDist ||
                hrStats.departmentDist.length === 0) && (
                <p className="text-sm text-text-secondary text-center py-4">
                  No department data available.
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Other Stats: Payroll, Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("payroll")) && (
          <PayrollSummaryWidget />
        )}
        <FeedbackWidget />
      </div>
    </div>
  );
}
