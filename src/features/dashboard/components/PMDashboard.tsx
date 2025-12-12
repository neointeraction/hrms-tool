import { useState, useEffect } from "react";
import {
  Users,
  CheckSquare,
  Briefcase,
  Clock,
  Coffee,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import { useGreeting } from "../../../hooks/useGreeting";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";

export default function PMDashboard() {
  const { user } = useAuth();
  const greeting = useGreeting();
  const [teamStatus, setTeamStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchTeamStatus();
    fetchPendingApprovals();
    fetchProjects();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTeamStatus();
      fetchPendingApprovals();
      fetchProjects();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamStatus = async () => {
    try {
      const data = await apiService.getTeamStatus();
      setTeamStatus(data.teamStatus || []);
    } catch (error) {
      // console.error("Failed to fetch team status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const [timesheets, leaves] = await Promise.all([
        apiService
          .getPendingTimesheetApprovals()
          .catch(() => ({ timesheets: [] })),
        apiService
          .getPendingLeaveApprovals()
          .catch(() => ({ leaveRequests: [] })),
      ]);

      setPendingApprovalsCount(timesheets.timesheets?.length || 0);
      setPendingLeavesCount(leaves.leaveRequests?.length || 0);
    } catch (error) {
      // console.error("Failed to fetch pending approvals:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      // console.error("Failed to fetch projects:", error);
    }
  };

  const getStatusCounts = () => {
    const clockedIn = teamStatus.filter(
      (t) => t.status === "clocked-in"
    ).length;
    const onBreak = teamStatus.filter((t) => t.status === "on-break").length;
    const clockedOut = teamStatus.filter(
      (t) => t.status === "clocked-out"
    ).length;
    return { clockedIn, onBreak, clockedOut, total: teamStatus.length };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "clocked-in":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
            <Clock size={12} />
            Working
          </span>
        );
      case "on-break":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
            <Coffee size={12} />
            Break
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Off
          </span>
        );
    }
  };

  const counts = getStatusCounts();
  const totalPending = pendingApprovalsCount + pendingLeavesCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {greeting}, {user?.name.split(" ")[0]}! 🚀
        </h1>
        <p className="text-text-secondary mt-1">
          Project status and team overview for today
        </p>
      </div>

      {/* Summary Section (Standard Top Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        <AttendanceWidget />

        {/* Leave Widget */}
        <LeaveWidget />

        {/* Upcoming Holiday */}
        <UpcomingHolidayWidget />

        {/* Team Status Section - Spans 2 cols on large screens */}
        <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border md:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                <Users size={24} />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Live Team Status
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-xs sm:text-sm hidden xl:flex">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-main rounded-full border border-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
                  <span className="text-text-primary font-bold">
                    {counts.clockedIn}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-main rounded-full border border-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-warning" />
                  <span className="text-text-primary font-bold">
                    {counts.onBreak}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-bg-main rounded-full border border-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="text-text-primary font-bold">
                    {counts.clockedOut}
                  </span>
                </div>
              </div>

              {/* Pagination Controls */}
              {teamStatus.length > 3 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} className="text-text-secondary" />
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) =>
                        Math.min(Math.ceil(teamStatus.length / 3) - 1, p + 1)
                      )
                    }
                    disabled={page >= Math.ceil(teamStatus.length / 3) - 1}
                    className="p-1 rounded-full hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} className="text-text-secondary" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[90px]">
              {teamStatus.slice(page * 3, (page + 1) * 3).map((member) => (
                <div
                  key={member.employeeId}
                  className="bg-bg-main p-3 rounded-lg border border-border hover:border-brand-primary/30 transition-all group animate-in fade-in duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold text-xs">
                      {member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)}
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary truncate text-xs">
                      {member.name}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      {member.role || "Member"}
                    </p>
                  </div>
                </div>
              ))}
              {teamStatus.length === 0 && (
                <div className="col-span-full text-center py-8 text-xs text-text-secondary border border-border border-dashed rounded-lg bg-bg-main/50">
                  No team members found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Appreciation Widget (Wall of Fame) */}
        <AppreciationWidget />

        {/* Payroll Summary Widget */}
        <PayrollSummaryWidget />

        {/* Feedback Widget */}
        <FeedbackWidget />
      </div>

      {/* Approvals and Projects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Widget */}
        <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border h-full">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
              <CheckSquare size={20} />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Pending Approvals
            </h2>
            {totalPending > 0 && (
              <span className="ml-auto px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                {totalPending} New
              </span>
            )}
          </div>

          <div className="space-y-4">
            {pendingApprovalsCount > 0 ? (
              <div
                onClick={() => (window.location.href = "/attendance")}
                className="p-4 bg-bg-main hover:bg-bg-hover border border-border rounded-xl flex justify-between items-center cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary group-hover:text-brand-primary transition-colors">
                      Timesheets
                    </p>
                    <p className="text-xs text-text-secondary">
                      {pendingApprovalsCount} submission
                      {pendingApprovalsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Review
                </Button>
              </div>
            ) : null}

            {pendingLeavesCount > 0 ? (
              <div
                onClick={() => (window.location.href = "/leave")}
                className="p-4 bg-bg-main hover:bg-bg-hover border border-border rounded-xl flex justify-between items-center cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary group-hover:text-brand-primary transition-colors">
                      Leave Requests
                    </p>
                    <p className="text-xs text-text-secondary">
                      {pendingLeavesCount} request
                      {pendingLeavesCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  Review
                </Button>
              </div>
            ) : null}

            {totalPending === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                  <CheckSquare size={24} />
                </div>
                <p className="text-text-primary font-medium">All caught up!</p>
                <p className="text-sm text-text-secondary">
                  No pending approvals at the moment.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Projects Widget */}
        <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Briefcase size={20} />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                Active Projects
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/projects")}
              className="text-brand-primary hover:bg-brand-primary/10"
            >
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              </div>
            ) : projects.filter((p) => p.status === "Active").length > 0 ? (
              projects
                .filter((p) => p.status === "Active")
                .slice(0, 3)
                .map((project) => (
                  <div
                    key={project._id}
                    className="p-4 bg-bg-main rounded-xl border border-border hover:border-brand-primary/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">
                          {project.name}
                        </h4>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {project.client}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-status-success/10 text-status-success text-[10px] font-bold uppercase rounded-full tracking-wider">
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary w-2/3 rounded-full" />
                      </div>
                      <span className="text-xs font-medium text-text-primary">
                        66%
                      </span>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-text-muted">
                      <span>
                        Due {new Date(project.endDate).toLocaleDateString()}
                      </span>
                      <span>Team: 4</span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-text-secondary text-sm">
                No active projects found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
