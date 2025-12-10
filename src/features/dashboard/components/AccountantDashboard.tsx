import {
  DollarSign,
  FileText,
  Download,
  TrendingUp,
  PieChart,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";

export default function AccountantDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Welcome, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-1">
          Financial Overview & Payroll Status
        </p>
      </div>

      {/* Standard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AttendanceWidget />
        <LeaveWidget />
        <UpcomingHolidayWidget />
      </div>

      {/* Financials Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-brand-primary" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Payroll Summary
            </h2>
          </div>
          <p className="text-3xl font-bold text-text-primary">$142,500</p>
          <p className="text-sm text-text-secondary mb-4">
            Total payout for June
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
            <span className="text-status-warning font-medium">Processing</span>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-status-success" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Salary Status
            </h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Disbursed</span>
              <span className="font-bold text-status-success">85%</span>
            </div>
            <div className="w-full bg-bg-main rounded-full h-2">
              <div className="bg-status-success h-2 rounded-full w-[85%]" />
            </div>
            <p className="text-xs text-text-secondary text-right">
              Remaining: 22 employees
            </p>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-status-info" size={24} />
            <h2 className="text-lg font-semibold text-text-primary">
              Expenses
            </h2>
          </div>
          <p className="text-3xl font-bold text-text-primary">$12,450</p>
          <p className="text-sm text-text-secondary mb-4">
            Reimbursements pending
          </p>
          <button className="text-sm text-brand-primary font-medium hover:underline">
            View Details
          </button>
        </div>
      </div>

      {/* Billing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FileText className="text-brand-secondary" size={20} />
              <h2 className="text-lg font-semibold text-text-primary">
                Billing Overview
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-bg-main rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Unbilled Hours (T&M)
                </span>
                <span className="text-brand-primary font-bold">450 hrs</span>
              </div>
              <p className="text-xs text-text-secondary">
                ~ $22,500 potential revenue
              </p>
            </div>
            <div className="p-4 bg-bg-main rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Retainer Utilization
                </span>
                <span className="text-status-success font-bold">92%</span>
              </div>
              <p className="text-xs text-text-secondary">Client: Acme Corp</p>
            </div>
          </div>
        </div>

        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-status-success" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Profitability
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Fixed Bid Projects
                </span>
                <span className="text-status-success text-sm">+15% Margin</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-status-success w-[65%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Resource Utilization
                </span>
                <span className="text-brand-primary text-sm">88%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-[88%] rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exports Section */}
      <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-6">
          <Download className="text-text-secondary" size={20} />
          <h2 className="text-lg font-semibold text-text-primary">
            Quick Exports
          </h2>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors">
            <FileText size={16} className="text-status-success" />
            <span className="text-sm font-medium">Payroll Report (CSV)</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors">
            <FileText size={16} className="text-status-info" />
            <span className="text-sm font-medium">Tax Deductions (Excel)</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors">
            <FileText size={16} className="text-status-warning" />
            <span className="text-sm font-medium">Expense Sheet (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
