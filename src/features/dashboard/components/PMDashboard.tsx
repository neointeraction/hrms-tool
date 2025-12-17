import { useState, useEffect } from "react";
import {
  Users,
  CheckSquare,
  Briefcase,
  Clock,
  Coffee,
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
import { Skeleton } from "../../../components/common/Skeleton";

export default function PMDashboard() {
  const { user } = useAuth();
  const { text } = useGreeting();
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            {text}, {user?.name.split(" ")[0]}!{" "}
          </h1>
          <p className="text-text-secondary mt-1">
            Project status and team overview for today
          </p>
        </div>
        <AppreciationWidget />
      </div>

      {/* Summary Section (Standard Top Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Attendance Widget */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("attendance") &&
            user.accessibleModules?.includes("attendance"))) && (
          <AttendanceWidget />
        )}

        {/* Leave Widget */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("leave") &&
            user.accessibleModules?.includes("leave"))) && <LeaveWidget />}

        {/* Upcoming Holiday */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("leave") &&
            user.accessibleModules?.includes("leave"))) && (
          <UpcomingHolidayWidget />
        )}

        {/* Team Status Section - Spans 2 cols on large screens */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("attendance") &&
            user.accessibleModules?.includes("attendance"))) && (
          <div className="bg-bg-card rounded-xl shadow-sm border border-border md:col-span-2 lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center border border-brand-primary/20">
                  <Users className="text-brand-primary" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">
                    Live Team Status
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {teamStatus.length} Active Members
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto bg-bg-main p-1 rounded-lg border border-border">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-status-success bg-status-success/10 border border-status-success/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
                  </span>
                  {counts.clockedIn} Working
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-status-warning bg-status-warning/10 border border-status-warning/20">
                  <span className="w-2 h-2 rounded-full bg-status-warning" />
                  {counts.onBreak} On Break
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted bg-bg-card border border-border">
                  <span className="w-2 h-2 rounded-full bg-text-muted" />
                  {counts.clockedOut} Offline
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 bg-bg-main/30">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-bg-card p-4 rounded-xl border border-border h-[100px] flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="w-16 h-5 rounded-full" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="w-24 h-3" />
                        <Skeleton className="w-16 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamStatus
                      .slice(page * 3, (page + 1) * 3)
                      .map((member) => (
                        <div
                          key={member.employeeId}
                          className="group relative bg-bg-card p-4 rounded-xl border border-border hover:border-brand-primary/50 hover:shadow-md transition-all duration-300 ease-out hover:-translate-y-1"
                        >
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 rounded-full hover:bg-bg-main"
                            >
                              <ChevronRight
                                size={16}
                                className="text-brand-primary"
                              />
                            </Button>
                          </div>

                          <div className="flex items-start gap-4 mb-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors ${
                                member.status === "clocked-in"
                                  ? "border-status-success/30 bg-status-success/10 text-status-success"
                                  : member.status === "on-break"
                                  ? "border-status-warning/30 bg-status-warning/10 text-status-warning"
                                  : "border-border bg-bg-main text-text-muted"
                              }`}
                            >
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <h3
                                className="font-semibold text-text-primary truncate"
                                title={member.name}
                              >
                                {member.name}
                              </h3>
                              <p className="text-xs text-text-secondary truncate">
                                {member.role || "Team Member"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            {getStatusBadge(member.status)}
                            <span className="text-[10px] font-mono text-text-muted">
                              ID: {member.employeeId.slice(-4)}
                            </span>
                          </div>
                        </div>
                      ))}
                    {teamStatus.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-bg-card rounded-xl border border-dashed border-border">
                        <div className="w-16 h-16 bg-bg-main rounded-full flex items-center justify-center mb-4 text-text-muted">
                          <Users size={32} />
                        </div>
                        <h3 className="text-base font-medium text-text-primary">
                          No Team Members Found
                        </h3>
                        <p className="text-sm text-text-secondary mt-1">
                          Your team list is currently empty.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Pagination */}
                  {teamStatus.length > 3 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                      <p className="text-xs text-text-secondary">
                        Showing {page * 3 + 1}-
                        {Math.min((page + 1) * 3, teamStatus.length)} of{" "}
                        {teamStatus.length}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={page === 0}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-bg-card hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() =>
                            setPage((p) =>
                              Math.min(
                                Math.ceil(teamStatus.length / 3) - 1,
                                p + 1
                              )
                            )
                          }
                          disabled={
                            page >= Math.ceil(teamStatus.length / 3) - 1
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-bg-card hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-text-secondary"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Appreciation Widget (Wall of Fame) */}

        {/* Payroll Summary Widget */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("payroll") &&
            user.accessibleModules?.includes("payroll"))) && (
          <PayrollSummaryWidget />
        )}

        {/* Feedback Widget */}
        <FeedbackWidget />
      </div>

      {/* Approvals and Projects Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approvals Widget */}
        {/* We keep approvals always visible as they might be relevant for projects logic, but specific subsections depend on modules */}
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
            {pendingApprovalsCount > 0 &&
            (!user?.tenantId ||
              typeof user.tenantId === "string" ||
              !user.tenantId.limits ||
              (user.tenantId.limits.enabledModules.includes("attendance") &&
                user.accessibleModules?.includes("attendance"))) ? (
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

            {pendingLeavesCount > 0 &&
            (!user?.tenantId ||
              typeof user.tenantId === "string" ||
              !user.tenantId.limits ||
              (user.tenantId.limits.enabledModules.includes("leave") &&
                user.accessibleModules?.includes("leave"))) ? (
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
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("projects") &&
            user.accessibleModules?.includes("projects"))) && (
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
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-bg-main rounded-xl border border-border h-[100px]"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-20 h-3" />
                      </div>
                      <Skeleton className="w-16 h-5 rounded-full" />
                    </div>
                    <Skeleton className="w-full h-8" />
                  </div>
                ))
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
        )}
      </div>
    </div>
  );
}
