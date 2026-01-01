import { useState, useEffect, useMemo } from "react";
import { Landmark, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Select } from "../../components/common/Select";
import { apiService } from "../../services/api.service";
import { Tooltip } from "../../components/common/Tooltip";
import { Table, type Column } from "../../components/common/Table";

import { ConfirmationModal } from "../../components/common/ConfirmationModal";

export default function PayrollProcessor() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [isListLoading, setIsListLoading] = useState(true);

  // Error Modal State
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsListLoading(true);
      await Promise.all([loadPayrollList(), loadEmployees()]);
      setIsListLoading(false);
    };
    fetchData();
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
      const allEmployees = Array.isArray(data) ? data : data.employees || [];

      // Filter Active employees who have completed onboarding (or legacy records)
      const activeEmployees = allEmployees.filter(
        (emp: any) =>
          emp.employeeStatus === "Active" || emp.employeeStatus === "Probation"
      );

      setEmployees(activeEmployees);
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
      setErrorMessage(
        err.message ||
          "Failed to calculate payroll. Ensure salary structure is defined."
      );
      setErrorModalOpen(true);
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

  const handleExport = () => {
    if (employees.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = employees.map((emp) => {
      const payroll = payrolls.find((p) => p.employee._id === emp._id);
      return {
        "Employee ID": emp.employeeId,
        "First Name": emp.firstName,
        "Last Name": emp.lastName,
        "Bank Name": emp.bankDetails?.bankName || "N/A",
        "Account Number": emp.bankDetails?.accountNumber || "N/A",
        "IFSC Code": emp.bankDetails?.ifscCode || "N/A",
        Status: payroll ? payroll.status : "Not Processed",
        "Gross Salary": payroll ? payroll.grossSalary : 0,
        "Net Salary": payroll ? payroll.netSalary : 0,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll");

    XLSX.writeFile(wb, `payroll_export_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const columns = useMemo<Column<any>[]>(
    () => [
      {
        header: "Employee",
        searchKey: "firstName", // Enable searching by first name
        render: (emp) => (
          <div className="flex items-start gap-2">
            <div>
              <div className="font-medium text-text-primary">
                {emp.firstName} {emp.lastName}
              </div>
              <div className="text-xs text-text-muted">{emp.employeeId}</div>
            </div>
            {emp.bankDetails && (
              <Tooltip
                trigger="click"
                position="right"
                content={
                  <div className="p-1 space-y-1">
                    <div className="font-semibold text-xs border-b border-border pb-1 mb-1">
                      Bank Details
                    </div>
                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                      <span className="text-text-secondary">Bank:</span>
                      <span className="font-medium">
                        {emp.bankDetails.bankName || "N/A"}
                      </span>
                      <span className="text-text-secondary">A/C:</span>
                      <span className="font-medium font-mono">
                        {emp.bankDetails.accountNumber || "N/A"}
                      </span>
                      <span className="text-text-secondary">IFSC:</span>
                      <span className="font-medium font-mono">
                        {emp.bankDetails.ifscCode || "N/A"}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="p-1.5 pt-0 rounded-full hover:bg-bg-active text-text-muted hover:text-brand-primary cursor-pointer transition-colors">
                  <Landmark size={18} />
                </div>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        header: "Status",
        render: (emp) => {
          const payroll = payrolls.find((p) => p.employee._id === emp._id);
          const status = payroll ? payroll.status : "Not Processed";
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
              ${
                status === "Paid"
                  ? "bg-status-success/10 text-status-success border-status-success/20"
                  : status === "Approved"
                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                  : status === "Draft"
                  ? "bg-status-warning/10 text-status-warning border-status-warning/20"
                  : "bg-bg-secondary text-text-secondary border-border"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Gross Salary",
        render: (emp) => {
          const payroll = payrolls.find((p) => p.employee._id === emp._id);
          return (
            <span className="font-medium text-text-primary">
              {payroll ? `₹${payroll.grossSalary.toLocaleString()}` : "-"}
            </span>
          );
        },
      },
      {
        header: "Net Payable",
        render: (emp) => {
          const payroll = payrolls.find((p) => p.employee._id === emp._id);
          return (
            <span className="font-medium text-text-primary">
              {payroll ? `₹${payroll.netSalary.toLocaleString()}` : "-"}
            </span>
          );
        },
      },
      {
        header: "Actions",
        className: "text-right",
        render: (emp) => {
          const payroll = payrolls.find((p) => p.employee._id === emp._id);
          return (
            <div className="flex justify-end gap-2">
              {!payroll && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCalculate(emp._id);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 bg-brand-primary text-white hover:bg-brand-secondary rounded-md text-xs font-medium transition-colors shadow-sm"
                >
                  Calculate
                </button>
              )}

              {payroll && payroll.status === "Draft" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(payroll._id, "Approved");
                    }}
                    className="px-3 py-1.5 bg-status-success text-white hover:bg-status-success/90 rounded-md text-xs font-medium transition-colors shadow-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCalculate(emp._id);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 border border-border text-text-secondary hover:bg-bg-active hover:text-text-primary rounded-md text-xs font-medium transition-all"
                  >
                    Recalculate
                  </button>
                </>
              )}

              {payroll && payroll.status === "Approved" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(payroll._id, "Paid");
                    }}
                    className="px-3 py-1.5 bg-brand-primary text-white hover:bg-brand-secondary rounded-md text-xs font-medium transition-colors shadow-sm"
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCalculate(emp._id);
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 border border-border text-text-secondary hover:bg-bg-active hover:text-text-primary rounded-md text-xs font-medium transition-all"
                  >
                    Recalculate
                  </button>
                </>
              )}

              {payroll && payroll.status === "Paid" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCalculate(emp._id);
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 border border-border text-text-secondary hover:bg-bg-active hover:text-text-primary rounded-md text-xs font-medium transition-all"
                >
                  Recalculate
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [payrolls, loading]
  );

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
            options={(() => {
              const currentYear = new Date().getFullYear();
              return Array.from({ length: 100 }, (_, i) => {
                const year = currentYear - 50 + i;
                return { value: year, label: String(year) };
              });
            })()}
          />
        </div>
        <div className="ml-auto text-sm text-text-secondary">
          Process payroll for {selectedMonth} {selectedYear}
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border bg-bg-secondary/30 flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">
            Payroll Processing ({employees.length} Employees)
          </h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 bg-bg-main border border-border rounded-md text-sm text-text-primary hover:bg-bg-hover transition-colors"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>

        <Table
          columns={columns}
          data={employees}
          isLoading={isListLoading}
          emptyMessage="No employees found to process."
        />
      </div>

      <ConfirmationModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        onConfirm={() => setErrorModalOpen(false)} // Just close
        title="Processing Error"
        message={errorMessage}
        confirmText="OK"
        variant="danger"
        isLoading={false}
      />
    </div>
  );
}
