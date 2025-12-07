import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { Select } from "../../components/common/Select";
import { apiService } from "../../services/api.service";

export default function PayrollProcessor() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPayrollList();
    loadEmployees(); // To select for calculation
  }, [selectedMonth, selectedYear]);

  const loadPayrollList = async () => {
    try {
      const data = await apiService.getPayrollList({
        month: selectedMonth,
        year: selectedYear,
      });
      setPayrolls(data.payrolls || []);
    } catch (err) {
      console.error("Failed to load payroll list");
    }
  };

  const loadEmployees = async () => {
    try {
      const data: any = await apiService.getEmployees();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error("failed to load employees");
    }
  };

  const handleCalculate = async (employeeId: string) => {
    try {
      setLoading(true);
      await apiService.calculatePayroll({
        employeeId,
        month: selectedMonth,
        year: selectedYear,
      });
      loadPayrollList(); // Refresh list to show new draft
    } catch (err: any) {
      alert(
        err.message ||
          "Failed to calculate payroll. Ensure salary structure is defined."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await apiService.updatePayrollStatus(id, status);
      loadPayrollList();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border p-6">
      <div className="flex gap-4 mb-6 items-center bg-bg-main p-4 rounded-lg">
        <div className="w-40">
          <Select
            value={selectedMonth}
            onChange={(value) => setSelectedMonth(value as string)}
            options={[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((m) => ({ value: m, label: m }))}
          />
        </div>
        <div className="w-28">
          <Select
            value={selectedYear}
            onChange={(value) => setSelectedYear(Number(value))}
            options={[
              { value: 2024, label: "2024" },
              { value: 2025, label: "2025" },
            ]}
          />
        </div>
        <div className="ml-auto text-sm text-text-secondary">
          Process payroll for {selectedMonth} {selectedYear}
        </div>
      </div>

      {/* Main Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Employees to Process */}
        <div>
          <h3 className="font-semibold mb-4 text-text-primary">
            Run Payroll Calculation
          </h3>
          <div className="border border-border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg-main">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => {
                  const isProcessed = payrolls.some(
                    (p) => p.employee._id === emp._id
                  );
                  return (
                    <tr key={emp._id}>
                      <td className="p-3">
                        <div className="font-medium">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-xs text-text-muted">
                          {emp.employeeId}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {isProcessed ? (
                          <span className="text-xs text-status-success flex items-center justify-end gap-1">
                            <CheckCircle size={14} /> Processed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCalculate(emp._id)}
                            disabled={loading}
                            className="px-3 py-1 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 rounded-md text-xs font-medium"
                          >
                            Calculate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processed Payrolls */}
        <div>
          <h3 className="font-semibold mb-4 text-text-primary">
            Processed Records ({payrolls.length})
          </h3>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {payrolls.length === 0 && (
              <div className="text-text-muted text-sm italic">
                No records generated for this period.
              </div>
            )}
            {payrolls.map((payroll) => (
              <div
                key={payroll._id}
                className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      {payroll.employee.firstName} {payroll.employee.lastName}
                    </div>
                    <div className="text-xs text-text-muted">
                      {payroll.employee.employeeId}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold 
                                   ${
                                     payroll.status === "Paid"
                                       ? "bg-status-success/10 text-status-success"
                                       : payroll.status === "Approved"
                                       ? "bg-brand-primary/10 text-brand-primary"
                                       : "bg-status-warning/10 text-status-warning"
                                   }`}
                  >
                    {payroll.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-text-secondary block text-xs">
                      Gross Salary
                    </span>
                    <span className="font-medium">
                      ${payroll.grossSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-text-secondary block text-xs">
                      Net Payable
                    </span>
                    <span className="font-bold text-brand-primary">
                      ${payroll.netSalary.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-border pt-2">
                  {payroll.status === "Draft" && (
                    <button
                      onClick={() =>
                        handleStatusUpdate(payroll._id, "Approved")
                      }
                      className="px-3 py-1 bg-brand-primary text-white rounded text-xs hover:bg-brand-primary/90"
                    >
                      Approve
                    </button>
                  )}
                  {payroll.status === "Approved" && (
                    <button
                      onClick={() => handleStatusUpdate(payroll._id, "Paid")}
                      className="px-3 py-1 bg-status-success text-white rounded text-xs hover:bg-status-success/90"
                    >
                      Mark as Paid
                    </button>
                  )}
                  <button
                    onClick={() => handleCalculate(payroll.employee._id)}
                    className="px-3 py-1 border border-border text-text-secondary rounded text-xs hover:bg-bg-hover"
                  >
                    Recalculate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
