import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckSquare,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  MessageSquare,
  Clock,
  Coffee,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";

export default function PMDashboard() {
  const { user } = useAuth();
  const [teamStatus, setTeamStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);

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
      console.error("Failed to fetch team status:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const data = await apiService.getPendingTimesheetApprovals();
      setPendingApprovalsCount(data.timesheets?.length || 0);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome back, {user?.name.split(" ")[0]}! 🚀
        </h1>
        <p className="text-text-secondary mt-1">
          Project status and team overview for today
        </p>
      </div>

      {/* Team Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Status Card - Live Data */}
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="text-brand-primary" size={24} />
              <h2 className="text-lg font-semibold text-text-primary">
                Team Status
              </h2>
            </div>
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
            )}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Working</span>
              <span className="font-bold text-status-success">
                {counts.clockedIn}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">On Break</span>
              <span className="font-bold text-status-warning">
                {counts.onBreak}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Off Duty</span>
              <span className="font-bold text-text-muted">
                {counts.clockedOut}
              </span>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">
                  Total Team
                </span>
                <span className="text-lg font-bold text-brand-primary">
                  {counts.total}
                </span>
              </div>
            </div>
          </div>

          {/* Team Member List */}
          <div className="mt-4 pt-4 border-t border-border max-h-48 overflow-y-auto">
            <h3 className="text-sm font-medium text-text-secondary mb-2">
              Live Team View
            </h3>
            {loading ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary mx-auto" />
              </div>
            ) : (
              <div className="space-y-2">
                {teamStatus.map((member) => (
                  <div
                    key={member.employeeId}
                    className="flex justify-between items-center text-sm p-2 bg-bg-main rounded"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {member.name}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {member.role}
                      </p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="text-status-info" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Approvals
            </h2>
            {pendingApprovalsCount > 0 && (
              <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {pendingApprovalsCount > 0 ? (
              <div
                onClick={() => (window.location.href = "/attendance")}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex justify-between items-center cursor-pointer hover:bg-yellow-100 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Timesheet Approvals
                  </p>
                  <p className="text-xs text-text-secondary">
                    {pendingApprovalsCount} pending submission
                    {pendingApprovalsCount > 1 ? "s" : ""}
                  </p>
                </div>
                <button className="text-xs bg-brand-primary text-white px-3 py-1 rounded-full">
                  Review
                </button>
              </div>
            ) : (
              <div className="p-3 bg-bg-main rounded-lg text-center">
                <p className="text-sm text-text-secondary">
                  No pending approvals
                </p>
              </div>
            )}
            <div className="p-3 bg-bg-main rounded-lg flex justify-between items-center opacity-50">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Leave Request
                </p>
                <p className="text-xs text-text-secondary">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-status-error" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Attention
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-status-error/10 rounded-lg">
              <AlertTriangle size={16} className="text-status-error" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Overtime Flag
                </p>
                <p className="text-xs text-text-secondary">
                  John Doe logged 11h
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-status-warning/10 rounded-lg">
              <Calendar size={16} className="text-status-warning" />
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Deadline Risk
                </p>
                <p className="text-xs text-text-secondary">Project Phoenix</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="text-brand-secondary" size={20} />
              <h2 className="text-lg font-semibold text-text-primary">
                Active Projects
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/projects")}
              className="text-brand-primary font-medium hover:underline hover:bg-transparent p-0"
            >
              View All
            </Button>
          </div>
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
              </div>
            ) : projects.filter((p) => p.status === "Active").length > 0 ? (
              projects
                .filter((p) => p.status === "Active")
                .slice(0, 3)
                .map((project) => (
                  <div key={project._id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-text-primary">
                        {project.name}
                      </span>
                      <span className="text-status-success text-sm">
                        {project.status}
                      </span>
                    </div>
                    <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                      {/* Placeholder progress - ideally calculate from tasks */}
                      <div className="h-full bg-brand-primary w-1/2 rounded-full" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text-secondary">
                      <span>Client: {project.client}</span>
                      <span>
                        Due: {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-text-secondary text-sm">
                No active projects found.
              </div>
            )}
          </div>
        </div>

        {/* Talent Section */}
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-status-success" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Talent Development
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-full text-brand-primary">
                  <UserPlus size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Onboarding
                  </p>
                  <p className="text-xs text-text-secondary">
                    2 New Joiners this week
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-brand-primary">View</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-status-info/10 rounded-full text-status-info">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Feedback Pending
                  </p>
                  <p className="text-xs text-text-secondary">
                    Q2 Reviews for 3 members
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-status-info">Start</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
