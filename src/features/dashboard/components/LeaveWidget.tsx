import { useState, useEffect } from "react";
import {
  CalendarDays,
  Plane,
  Pill,
  Users,
  User,
  TrendingUp,
  Calendar,
} from "lucide-react";
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
  const { widgetAnimationPlayed } = useAppStore();

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
      const timer1 = setTimeout(() => {
        setView("colleagues");
      }, 5000);

      const timer2 = setTimeout(() => {
        setView("my-leaves");
      }, 10000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, []);

  const visibleEmployees = employeesOnLeave.slice(0, 5);
  const remainingCount = employeesOnLeave.length - visibleEmployees.length;

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("casual"))
      return <Plane className="text-blue-600" size={16} />;
    if (t.includes("sick") || t.includes("medical"))
      return <Pill className="text-red-600" size={16} />;
    if (t.includes("floating"))
      return <CalendarDays className="text-purple-600" size={16} />;
    if (t.includes("maternity") || t.includes("paternity"))
      return <Users className="text-pink-600" size={16} />;
    return <CalendarDays className="text-gray-600" size={16} />;
  };

  const getTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes("casual"))
      return "from-blue-500/10 to-blue-600/10 border-blue-200";
    if (t.includes("sick") || t.includes("medical"))
      return "from-red-500/10 to-red-600/10 border-red-200";
    if (t.includes("floating"))
      return "from-purple-500/10 to-purple-600/10 border-purple-200";
    if (t.includes("maternity") || t.includes("paternity"))
      return "from-pink-500/10 to-pink-600/10 border-pink-200";
    return "from-gray-500/10 to-gray-600/10 border-gray-200";
  };

  return (
    <div className="bg-bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/10 to-yellow-500/10 flex items-center justify-center border border-orange-200">
              <CalendarDays className="text-orange-600" size={20} />
            </div>
            Leave Status
          </h2>

          {/* Toggle Button */}
          <button
            onClick={() =>
              setView(view === "my-leaves" ? "colleagues" : "my-leaves")
            }
            className="flex items-center gap-2 px-3 py-2 bg-bg-hover hover:bg-bg-main rounded-lg transition-all text-text-secondary hover:text-brand-primary border border-transparent hover:border-brand-primary/20"
            title={
              view === "my-leaves"
                ? "View Colleagues on Leave"
                : "View My Leave Balance"
            }
          >
            {view === "my-leaves" ? <Users size={18} /> : <User size={18} />}
            <span className="text-xs font-medium">
              {view === "my-leaves" ? "Team" : "Me"}
            </span>
          </button>
        </div>

        {view === "my-leaves" ? (
          <div
            key="my-leaves"
            className="space-y-3 animate-in fade-in duration-300"
          >
            {/* Leave Type Cards - Grid */}
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : leaveStats.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {leaveStats.map((stat) => (
                  <div
                    key={stat.type}
                    className={`bg-gradient-to-br ${getTypeColor(
                      stat.type
                    )} rounded-xl p-3 border-2 transition-all hover:shadow-lg hover:scale-105 cursor-pointer relative overflow-hidden group`}
                  >
                    {/* Background decoration */}
                    <div className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform mb-2">
                        {getIcon(stat.type)}
                      </div>
                      <p className="text-xs font-bold text-text-primary mb-2 line-clamp-1">
                        {stat.type}
                      </p>
                      <div>
                        <p className="text-1.5xl font-black text-text-primary leading-none">
                          {stat.pending}
                        </p>
                        <p className="text-[10px] text-text-secondary font-semibold">
                          days left
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-text-secondary">
                <CalendarDays
                  className="mx-auto mb-2 text-text-muted"
                  size={32}
                />
                <p className="text-xs">No leave data</p>
              </div>
            )}

            {/* Total Summary */}
            {leaveStats.length > 0 && (
              <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-lg p-3 border border-brand-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-brand-primary" size={16} />
                    <p className="text-xs font-medium text-text-primary">
                      Total Used
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-bold text-brand-primary">
                      {leaveStats.reduce(
                        (acc, curr) => acc + (curr.used || 0),
                        0
                      )}
                    </p>
                    <p className="text-[10px] text-text-secondary">days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            key="colleagues"
            className="space-y-2.5 animate-in fade-in duration-300"
          >
            <div className="flex items-center gap-2">
              <Calendar className="text-text-secondary" size={14} />
              <p className="text-xs font-medium text-text-secondary">
                On Leave Today
              </p>
            </div>

            {employeesOnLeave.length > 0 ? (
              <div className="space-y-2.5">
                {/* Avatar Group */}
                <div className="flex items-center justify-center py-3">
                  <div className="flex -space-x-4">
                    {visibleEmployees.map((leave) => (
                      <div
                        key={leave._id}
                        className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-10"
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
                          className="w-11 h-11 border-3 border-bg-card ring-2 ring-white"
                          size="lg"
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-lg">
                          <div className="font-medium text-[11px]">
                            {leave.employee.firstName} {leave.employee.lastName}
                          </div>
                          <div className="text-gray-300 text-[10px]">
                            {leave.type}
                          </div>
                        </div>
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div
                        className="w-11 h-11 rounded-full border-3 border-bg-card ring-2 ring-white bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-xs font-bold text-white hover:scale-110 cursor-pointer transition-transform z-0 shadow-md"
                        title={`${remainingCount} more on leave`}
                        onClick={() => navigate("/leave")}
                      >
                        +{remainingCount}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-bg-hover rounded-lg p-2.5 text-center">
                  <p className="text-sm text-text-primary">
                    <span className="font-bold text-brand-primary">
                      {employeesOnLeave.length}
                    </span>{" "}
                    {employeesOnLeave.length === 1 ? "person" : "people"} out
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="text-green-600" size={28} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    All present!
                  </p>
                  <p className="text-xs text-text-secondary">
                    Everyone is here today
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
