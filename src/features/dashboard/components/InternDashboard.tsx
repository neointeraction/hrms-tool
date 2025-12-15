import { BookOpen, CheckSquare } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";

export default function InternDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome, {user?.name.split(" ")[0]}! 🎓
          </h1>
          <p className="text-text-secondary mt-1">
            Learning & Development Track
          </p>
        </div>
        <AppreciationWidget />
      </div>

      {/* Standard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceWidget />
        <LeaveWidget />
        <UpcomingHolidayWidget />
        <PayrollSummaryWidget />
        <FeedbackWidget />
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
    </div>
  );
}
