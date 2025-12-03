import { BookOpen, CheckSquare, Clock, Coffee } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function InternDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome, {user?.name.split(" ")[0]}! 🎓
        </h1>
        <p className="text-text-secondary mt-1">Learning & Development Track</p>
      </div>

      {/* Learning Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <CheckSquare className="text-brand-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Onboarding Checklist
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-status-success">
                <CheckSquare size={18} />
              </div>
              <span className="text-text-primary line-through text-text-muted">
                Setup Development Environment
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-status-success">
                <CheckSquare size={18} />
              </div>
              <span className="text-text-primary line-through text-text-muted">
                Company Policy Review
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-brand-primary rounded-sm" />
              <span className="text-text-primary">
                Complete React Fundamentals
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-text-muted rounded-sm" />
              <span className="text-text-secondary">
                Submit First Pull Request
              </span>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-status-info" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Training Modules
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Frontend Basics
                </span>
                <span className="text-status-success text-sm">Completed</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-status-success w-full rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Advanced React
                </span>
                <span className="text-brand-primary text-sm">45%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[45%] rounded-full" />
              </div>
            </div>
            <button className="text-sm text-brand-primary font-medium hover:underline mt-2">
              View All Modules
            </button>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-brand-secondary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Timesheet
            </h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-bg-main rounded-lg">
            <div>
              <p className="text-sm font-medium text-text-primary">This Week</p>
              <p className="text-2xl font-bold text-text-primary">32h</p>
            </div>
            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm hover:bg-brand-secondary">
              Log Time
            </button>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Coffee className="text-status-warning" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Leave Balance
            </h2>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-3 bg-bg-main rounded-lg text-center">
              <p className="text-2xl font-bold text-text-primary">2</p>
              <p className="text-xs text-text-secondary">Casual</p>
            </div>
            <div className="flex-1 p-3 bg-bg-main rounded-lg text-center">
              <p className="text-2xl font-bold text-text-primary">1</p>
              <p className="text-xs text-text-secondary">Sick</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
