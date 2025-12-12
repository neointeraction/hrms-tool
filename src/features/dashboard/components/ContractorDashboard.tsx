import { Briefcase, Clock, FileText, Monitor, CheckCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";

export default function ContractorDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Hi {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-1">Contractor Portal</p>
      </div>

      {/* Standard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceWidget />
        <LeaveWidget />
        <UpcomingHolidayWidget />
        <PayrollSummaryWidget />
        <FeedbackWidget />
        <AppreciationWidget />
      </div>

      {/* Work Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-brand-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Current Assignment
            </h2>
          </div>
          <div className="p-4 bg-bg-main rounded-lg mb-4">
            <h3 className="font-bold text-text-primary text-lg mb-1">
              Project Phoenix
            </h3>
            <p className="text-sm text-text-secondary">
              Frontend Development • React/TypeScript
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <Clock size={14} />
              <span>Contract ends: Dec 31, 2025</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-medium">
              Active
            </span>
            <span className="px-3 py-1 bg-bg-main text-text-secondary rounded-full text-xs font-medium">
              Remote
            </span>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-status-info" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Timesheet Entry
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Today's Log
                </p>
                <p className="text-xs text-text-secondary">6h 30m recorded</p>
              </div>
              <button className="text-xs bg-brand-primary text-white px-3 py-1 rounded-lg">
                Add Time
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Submission Status
                </p>
                <p className="text-xs text-status-success flex items-center gap-1">
                  <CheckCircle size={12} /> Last week approved
                </p>
              </div>
              <button className="text-xs text-text-secondary hover:underline">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:bg-bg-hover transition-colors">
          <div className="p-3 bg-status-success/10 rounded-lg text-status-success">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Invoices</p>
            <p className="text-xs text-text-secondary">Upload or download</p>
          </div>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:bg-bg-hover transition-colors">
          <div className="p-3 bg-brand-secondary/10 rounded-lg text-brand-secondary">
            <FileText size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Payslips</p>
            <p className="text-xs text-text-secondary">View generated slips</p>
          </div>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border flex items-center gap-4">
          <div className="p-3 bg-text-muted/10 rounded-lg text-text-muted">
            <Monitor size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Asset Status</p>
            <p className="text-xs text-text-secondary">
              MacBook Pro (Assigned)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
