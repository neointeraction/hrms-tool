import {
  Users,
  Calendar,
  CheckSquare,
  Briefcase,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function PMDashboard() {
  const { user } = useAuth();

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
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-brand-primary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Team Status
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Present</span>
              <span className="font-bold text-status-success">12/15</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">On Leave</span>
              <span className="font-bold text-status-warning">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">WFH</span>
              <span className="font-bold text-brand-primary">4</span>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="text-status-info" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Approvals
            </h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-bg-main rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Leave Request
                </p>
                <p className="text-xs text-text-secondary">
                  Sarah Wilson • 2 days
                </p>
              </div>
              <button className="text-xs bg-brand-primary text-white px-3 py-1 rounded-full">
                Review
              </button>
            </div>
            <div className="p-3 bg-bg-main rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Timesheet
                </p>
                <p className="text-xs text-text-secondary">Mike Chen • 40h</p>
              </div>
              <button className="text-xs bg-brand-primary text-white px-3 py-1 rounded-full">
                Review
              </button>
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
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Project Phoenix
                </span>
                <span className="text-status-success text-sm">On Track</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-3/4 rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-secondary">
                <span>Burn: 75%</span>
                <span>Due: June 30</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Mobile App Redesign
                </span>
                <span className="text-status-warning text-sm">At Risk</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-status-warning w-1/2 rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-secondary">
                <span>Burn: 60%</span>
                <span>Due: July 15</span>
              </div>
            </div>
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
