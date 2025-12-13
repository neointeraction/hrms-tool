import { useState, useEffect } from "react";
import { CalendarDays, Plane, Pill, Users, User } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Avatar } from "../../../components/common/Avatar";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../../store/useAppStore";
import { Skeleton } from "../../../components/common/Skeleton";

export default function LeaveWidget() {
  const navigate = useNavigate();
  const [view, setView] = useState<"my-leaves" | "colleagues">("my-leaves");
  const [leaveStats, setLeaveStats] = useState<any[]>([]);
  const [employeesOnLeave, setEmployeesOnLeave] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { widgetAnimationPlayed } = useAppStore(); // Set by HolidayWidget or whichever finishes last, simpler to just read here as they sync up

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, employeesData] = await Promise.all([
          apiService.getLeaveStats(),
          apiService.getEmployeesOnLeave(),
        ]);
        setLeaveStats(statsData.stats || []);
        setEmployeesOnLeave(employeesData || []);
      } catch (error) {
        console.error("Failed to fetch leave widget data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto Toggle Animation (Once per session)
    if (!widgetAnimationPlayed) {
      // Switch to colleagues after 5s
      const timer1 = setTimeout(() => {
        setView("colleagues");
      }, 5000);

      // Switch back to my-leaves after 10s
      const timer2 = setTimeout(() => {
        setView("my-leaves");
        // No need to set setWidgetAnimationPlayed here as UpcomingHolidayWidget handles it,
        // or we can set it redundantly.
      }, 10000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, []);

  const visibleEmployees = employeesOnLeave.slice(0, 4);
  const remainingCount = employeesOnLeave.length - visibleEmployees.length;

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("casual"))
      return <Plane className="text-blue-600" size={14} />;
    if (t.includes("sick") || t.includes("medical"))
      return <Pill className="text-red-600" size={14} />;
    if (t.includes("floating"))
      return <CalendarDays className="text-purple-600" size={14} />;
    if (t.includes("maternity") || t.includes("paternity"))
      return <Users className="text-pink-600" size={14} />;
    return <CalendarDays className="text-gray-600" size={14} />;
  };

  return (
    <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border flex flex-col h-full min-h-[200px] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-status-warning/10 rounded-lg">
            <CalendarDays className="text-status-warning" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Leave Status
          </h2>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() =>
            setView(view === "my-leaves" ? "colleagues" : "my-leaves")
          }
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-brand-primary"
          title={
            view === "my-leaves"
              ? "View Colleagues on Leave"
              : "View My Leave Balance"
          }
        >
          {view === "my-leaves" ? <Users size={20} /> : <User size={20} />}
        </button>
      </div>

      {view === "my-leaves" ? (
        <div key="my-leaves" className="animate-slide-in-right">
          <p className="text-xs font-medium text-text-secondary mb-3">
            Your Pending Leaves:
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {loading ? (
              <>
                <div className="flex flex-col items-center justify-center p-3 pb-0 bg-bg-main rounded-lg text-center h-[72px]">
                  <Skeleton className="h-4 w-4 rounded mb-2" />
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="flex flex-col items-center justify-center p-3 pb-0 bg-bg-main rounded-lg text-center h-[72px]">
                  <Skeleton className="h-4 w-4 rounded mb-2" />
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
                <div className="flex flex-col items-center justify-center p-3 pb-0 bg-bg-main rounded-lg text-center h-[72px]">
                  <Skeleton className="h-4 w-4 rounded mb-2" />
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </>
            ) : leaveStats.length > 0 ? (
              leaveStats.map((stat) => (
                <div
                  key={stat.type}
                  className="flex flex-col items-center justify-center p-3 pb-0 bg-bg-main rounded-lg text-center"
                >
                  <div className="mb-2">{getIcon(stat.type)}</div>
                  <div>
                    <p className="text-xs text-text-secondary truncate w-full">
                      {stat.type}
                    </p>
                    <p className="text-xl font-bold text-text-primary">
                      {stat.pending}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-sm text-text-secondary">
                No stats
              </div>
            )}
          </div>

          <div className="p-3 bg-bg-main rounded-lg flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary">
              Total leaves taken this year:
            </p>
            <p className="text-xl font-bold text-text-primary">
              {leaveStats.reduce((acc, curr) => acc + (curr.used || 0), 0)}
            </p>
          </div>
        </div>
      ) : (
        <div
          key="colleagues"
          className="animate-slide-in-left h-full flex flex-col "
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-text-secondary">
              Colleague's On Leave Today:
            </p>
            {employeesOnLeave.length === 0 && (
              <span className="text-xs text-text-muted">No one</span>
            )}
          </div>

          {employeesOnLeave.length > 0 ? (
            <div className="flex items-center  py-2">
              <div className="flex -space-x-3">
                {visibleEmployees.map((leave) => (
                  <div
                    key={leave._id}
                    className="relative group cursor-pointer"
                    title={`${leave.employee.firstName} ${leave.employee.lastName} (${leave.type})`}
                  >
                    <Avatar
                      src={
                        leave.employee.profilePicture
                          ? `${ASSET_BASE_URL}${leave.employee.profilePicture}`
                          : undefined
                      }
                      name={`${leave.employee.firstName} ${leave.employee.lastName}`}
                      alt={leave.employee.firstName}
                      className="w-10 h-10 border-2 border-white hover:z-10 relative transition-transform hover:scale-110"
                      size="md"
                    />

                    {/* Custom Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </div>
                  </div>
                ))}
                {remainingCount > 0 && (
                  <div
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 hover:bg-gray-200 cursor-pointer z-0"
                    title={`${remainingCount} more on leave`}
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-text-secondary">
              Everyone is present today!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
