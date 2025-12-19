import { useState, useEffect } from "react";
import {
  DollarSign,
  FileText,
  Download,
  TrendingUp,
  PieChart,
  CreditCard,
  Users,
  Briefcase,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { apiService } from "../../../services/api.service";
import { useGreeting } from "../../../hooks/useGreeting";

export default function AccountantDashboard() {
  const { user } = useAuth();
  const { text } = useGreeting();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    employeeCount: 0,
    timesheetCount: 0,
    projectCount: 0,
    payrollTotal: 0,
    assetValue: 0,
    unbilledHours: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employees, timesheets, projects, payroll, assets] =
        await Promise.all([
          apiService.getAllEmployees().catch(() => ({ employees: [] })),
          apiService
            .getPendingTimesheetApprovals()
            .catch(() => ({ timesheets: [] })),
          apiService.getProjects().catch(() => ({ projects: [] })),
          apiService.getPayrollStats().catch(() => ({ totalNetSalary: 0 })),
          apiService.getAssetStats().catch(() => ({ totalValue: 0 })),
        ]);

      // Calculate unbilled hours from pending timesheets (assuming avg 8h per sheet if not detailed)
      // Ideally backend aggregates this, but for now we sum it up if available or estimate
      const unbilledHrs =
        timesheets.timesheets?.reduce(
          (acc: number, t: any) => acc + (t.hours || 0),
          0
        ) || 0;

      setStats({
        employeeCount: employees.employees?.length || 0,
        timesheetCount: timesheets.timesheets?.length || 0,
        projectCount:
          projects.projects?.filter((p: any) => p.status === "Active").length ||
          0,
        payrollTotal: payroll.totalNetSalary || 0,
        assetValue: assets.totalValue || 0,
        unbilledHours: unbilledHrs,
      });
    } catch (error) {
      console.error("Failed to fetch accountant dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            {text}, {user?.name.split(" ")[0]}!{" "}
          </h1>
          <p className="text-text-secondary mt-1">
            Financial Overview & Payroll Status
          </p>
        </div>
      </div>

      {/* Live Metrics Widgets */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-bg-card p-6 rounded-lg shadow-sm border border-border h-[130px] animate-pulse"
            >
              <div className="h-4 w-8 bg-bg-main rounded mb-4"></div>
              <div className="h-4 w-32 bg-bg-main rounded mb-4"></div>
              <div className="h-8 w-16 bg-bg-main rounded mb-2"></div>
              <div className="h-3 w-24 bg-bg-main rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                <Users size={20} />
              </div>
              <h2 className="text-base font-semibold text-text-primary">
                Employees on Payroll
              </h2>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {stats.employeeCount}
            </p>
            <p className="text-xs text-text-secondary mt-1">Active headcount</p>
          </div>

          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                <Clock size={20} />
              </div>
              <h2 className="text-base font-semibold text-text-primary">
                Pending Timesheets
              </h2>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {stats.timesheetCount}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              To be reviewed for payout
            </p>
          </div>

          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
                <Briefcase size={20} />
              </div>
              <h2 className="text-base font-semibold text-text-primary">
                Active Projects
              </h2>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              {stats.projectCount}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              Billable engagements
            </p>
          </div>
        </div>
      )}

      {/* Financials Section */}
      {(!user?.tenantId ||
        typeof user.tenantId === "string" ||
        !user.tenantId.limits ||
        user.tenantId.limits.enabledModules.includes("payroll")) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-brand-primary" size={24} />
              <h2 className="text-lg font-semibold text-text-primary">
                Payroll Summary
              </h2>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              ${stats.payrollTotal.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Est. monthly cost
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span className="text-status-success font-medium">Active</span>
            </div>
          </div>

          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="text-status-success" size={24} />
              <h2 className="text-lg font-semibold text-text-primary">
                Salary Structure
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Defined</span>
                <span className="font-bold text-status-success">100%</span>
              </div>
              <div className="w-full bg-bg-main rounded-full h-2">
                <div className="bg-status-success h-2 rounded-full w-[100%]" />
              </div>
              <p className="text-xs text-text-secondary text-right">
                {stats.employeeCount} active employees
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="text-status-info" size={24} />
              <h2 className="text-lg font-semibold text-text-primary">
                Asset Value
              </h2>
            </div>
            <p className="text-3xl font-bold text-text-primary">
              ${stats.assetValue.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary mb-4">
              Total inventory value
            </p>
            <button className="text-sm text-brand-primary font-medium hover:underline">
              View Inventory
            </button>
          </div>
        </div>
      )}

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
                  Unbilled Hours (Pending)
                </span>
                <span className="text-brand-primary font-bold">
                  {stats.unbilledHours} hrs
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                ~ ${(stats.unbilledHours * 50).toLocaleString()} potential
                revenue (Est. $50/hr)
              </p>
            </div>
            <div className="p-4 bg-bg-main rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-text-primary">
                  Active Projects
                </span>
                <span className="text-status-success font-bold">
                  {stats.projectCount}
                </span>
              </div>
              <p className="text-xs text-text-secondary">Across all accounts</p>
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
