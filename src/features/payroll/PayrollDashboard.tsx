import { useState } from "react";
import { IndianRupee, FileText, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import SalaryStructureManager from "./SalaryStructureManager";
import PayrollProcessor from "./PayrollProcessor";
import PayslipView from "./PayslipView";

export default function PayrollDashboard() {
  const { user } = useAuth();

  // Default tab based on role
  const getDefaultTab = () => {
    if (
      user?.role === "Employee" ||
      user?.role === "Intern" ||
      user?.role === "Consultant"
    ) {
      return "payslips";
    }
    if (user?.role === "Accountant") return "processing";
    if (user?.role === "HR") return "structure";
    return "processing"; // Admin
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  const canManageStructure = user?.role === "HR" || user?.role === "Admin";
  const canProcessPayroll =
    user?.role === "Accountant" || user?.role === "Admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Payroll & Finance
        </h1>
        <p className="text-text-secondary">
          Manage salaries, process payrolls, and view payslips.
        </p>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {canProcessPayroll && (
          <button
            onClick={() => setActiveTab("processing")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "processing"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <IndianRupee size={18} />
            Payroll Processing
          </button>
        )}

        {canManageStructure && (
          <button
            onClick={() => setActiveTab("structure")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "structure"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <Settings size={18} />
            Salary Structures
          </button>
        )}

        <button
          onClick={() => setActiveTab("payslips")}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "payslips"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          <FileText size={18} />
          My Payslips
        </button>
      </div>

      <div className="pt-4">
        {activeTab === "processing" && canProcessPayroll && (
          <PayrollProcessor />
        )}
        {activeTab === "structure" && canManageStructure && (
          <SalaryStructureManager />
        )}
        {activeTab === "payslips" && <PayslipView />}
      </div>
    </div>
  );
}
