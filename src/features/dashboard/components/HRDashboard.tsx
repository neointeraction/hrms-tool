import { FileCheck, TrendingUp, MessageCircle, Heart } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import { useGreeting } from "../../../hooks/useGreeting";

export default function HRDashboard() {
  const { user } = useAuth();
  const greeting = useGreeting();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {greeting}, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-1">HR Operations Overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceWidget />
        <LeaveWidget />
        <UpcomingHolidayWidget />
        <PayrollSummaryWidget />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-text-secondary mb-1">Total Headcount</p>
          <p className="text-3xl font-bold text-brand-primary">142</p>
          <p className="text-xs text-status-success mt-2 flex items-center gap-1">
            <TrendingUp size={12} /> +5 this month
          </p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-text-secondary mb-1">Open Positions</p>
          <p className="text-3xl font-bold text-status-info">8</p>
          <p className="text-xs text-text-secondary mt-2">Across 3 depts</p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-text-secondary mb-1">On Leave Today</p>
          <p className="text-3xl font-bold text-status-warning">12</p>
          <p className="text-xs text-text-secondary mt-2">8.5% of workforce</p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-sm text-text-secondary mb-1">Offer Acceptance</p>
          <p className="text-3xl font-bold text-status-success">92%</p>
          <p className="text-xs text-text-secondary mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Actions & Compliance & Events */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <FileCheck className="text-brand-primary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Pending Actions
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bg-main rounded-lg border-l-4 border-status-warning">
              <div>
                <p className="font-medium text-text-primary">Leave Approvals</p>
                <p className="text-xs text-text-secondary">
                  5 requests pending &gt; 24h
                </p>
              </div>
              <button className="text-sm text-brand-primary font-medium hover:underline">
                Review
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-bg-main rounded-lg border-l-4 border-status-error">
              <div>
                <p className="font-medium text-text-primary">Payroll Alerts</p>
                <p className="text-xs text-text-secondary">
                  3 discrepancies flagged
                </p>
              </div>
              <button className="text-sm text-brand-primary font-medium hover:underline">
                Resolve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-status-error" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Engagement
            </h2>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-2">4.2/5</p>
          <p className="text-sm text-text-secondary">
            Employee Net Promoter Score
          </p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="text-brand-secondary" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Feedback
            </h2>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-2">85%</p>
          <p className="text-sm text-text-secondary">
            Participation in Q2 Survey
          </p>
        </div>
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="text-status-info" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">Chatbot</h2>
          </div>
          <p className="text-3xl font-bold text-text-primary mb-2">12</p>
          <p className="text-sm text-text-secondary">
            Escalations needing attention
          </p>
        </div>
      </div>
    </div>
  );
}
