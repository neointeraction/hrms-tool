import { useState, useEffect } from "react";
import {
  Users,
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
  const [projects, setProjects] = useState<any[]>([]);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchTeamStatus();
    fetchProjects();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTeamStatus();
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
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
            <Clock size={12} />
            Working
          </span>
        );
      case "on-break":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
            <Coffee size={12} />
            Break
          </span>
        );
      default:
        return (
          <span className="text-xs font-medium text-text-muted bg-bg-main px-2 py-1 rounded-full border border-border">
            Off
          </span>
        );
    }
  };

  const counts = getStatusCounts();

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
          <div className="bg-bg-card rounded-xl shadow-sm border border-border md:col-span-2 lg:col-span-2 overflow-hidden flex flex-col h-full">
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

                          <div className="flex items-center justify-between pt-3 border-t border-border">
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

        {/* Projects Widget - Moved here */}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("projects") &&
            user.accessibleModules?.includes("projects"))) && (
          <div className="bg-bg-card p-0 rounded-xl shadow-sm border border-border h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800">
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

            <div className="flex-1 p-6 flex flex-col justify-center">
              {loading ? (
                [1, 2].map((i) => (
                  <div
                    key={i}
                    className="p-4 bg-bg-main rounded-xl border border-border h-[100px] mb-4 last:mb-0"
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
                (() => {
                  const activeProjects = projects.filter(
                    (p) => p.status === "Active"
                  );

                  const nextProject = () => {
                    setCurrentProjectIndex(
                      (prev) => (prev + 1) % activeProjects.length
                    );
                  };

                  const prevProject = () => {
                    setCurrentProjectIndex(
                      (prev) =>
                        (prev - 1 + activeProjects.length) %
                        activeProjects.length
                    );
                  };

                  // Get 1 item starting from current index
                  const itemsToShow = [];
                  for (let i = 0; i < Math.min(activeProjects.length, 1); i++) {
                    const index =
                      (currentProjectIndex + i) % activeProjects.length;
                    itemsToShow.push(activeProjects[index]);
                  }

                  return (
                    <div className="flex-1 flex flex-col justify-center h-full">
                      <div className="flex-1 flex flex-col">
                        {itemsToShow.map((project, idx) => (
                          <div
                            key={`${project._id}-${idx}`}
                            className="flex-1 bg-bg-main p-5 rounded-xl border border-border hover:border-brand-primary/30 transition-all duration-300 group flex flex-col justify-center"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-semibold text-text-primary text-base group-hover:text-brand-primary transition-colors">
                                  {project.name}
                                </h4>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {project.client}
                                </p>
                              </div>
                              <span className="px-2.5 py-0.5 bg-status-success/10 text-status-success text-[10px] font-bold uppercase rounded-full tracking-wider border border-status-success/20">
                                {project.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary w-2/3 rounded-full" />
                              </div>
                              <span className="text-xs font-medium text-text-primary">
                                66%
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-text-muted">
                              <span>
                                Due{" "}
                                {new Date(project.endDate).toLocaleDateString()}
                              </span>
                              <span>Team: 4</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {activeProjects.length > 1 && (
                        <div className="flex justify-end gap-2 mt-4">
                          <button
                            onClick={prevProject}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-bg-card hover:bg-bg-hover transition-colors text-text-secondary hover:text-brand-primary hover:border-brand-primary/50"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={nextProject}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-bg-card hover:bg-bg-hover transition-colors text-text-secondary hover:text-brand-primary hover:border-brand-primary/50"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-text-secondary text-sm">
                  No active projects found.
                </div>
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
      {/* Pending Approvals Widget Removed */}
    </div>
  );
}
