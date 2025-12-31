import { useState, useEffect } from "react";
import { Download, Search } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Table } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { formatDate } from "../../utils/dateUtils";

interface PayrollRecord {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
  };
  month: string;
  year: number;
  basicPay: number;
  hra: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
  totalDays: number;
  lopDays: number;
}

export default function PayrollReports() {
  const [loading, setLoading] = useState(false);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  const months = [
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
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPayrollList({
        month: selectedMonth,
        year: selectedYear,
      });
      setPayrolls(response.payrolls || []);
    } catch (error) {
      console.error("Failed to fetch payroll report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedMonth, selectedYear]);

  const handleExport = () => {
    if (payrolls.length === 0) return;

    // Define Headers
    const headers = [
      "Employee ID",
      "Employee Name",
      "Month",
      "Year",
      "Total Days",
      "LOP Days",
      "Basic Pay",
      "HRA",
      "Gross Salary",
      "Total Deductions",
      "Net Salary",
      "Status",
      "Payment Date",
    ];

    // Map Data
    const data = payrolls.map((p) => [
      p.employee?.employeeId || "N/A",
      `${p.employee?.firstName || ""} ${p.employee?.lastName || ""}`,
      p.month,
      p.year,
      p.totalDays,
      p.lopDays,
      p.basicPay,
      p.hra,
      p.grossSalary,
      p.totalDeductions,
      p.netSalary,
      p.status,
      p.paymentDate ? formatDate(p.paymentDate) : "-",
    ]);

    // Create Worksheet
    const worksheet = utils.aoa_to_sheet([headers, ...data]);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Payroll Report");

    // Generate Excel File
    writeFile(workbook, `Payroll_Report_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const columns = [
    {
      header: "Employee",
      accessorKey: "employee",
      render: (record: PayrollRecord) => {
        const emp = record.employee;
        return (
          <div>
            <div className="font-medium text-text-primary">
              {emp?.firstName} {emp?.lastName}
            </div>
            <div className="text-xs text-text-secondary">{emp?.employeeId}</div>
          </div>
        );
      },
    },
    {
      header: "Gross Pay",
      accessorKey: "grossSalary",
      render: (record: PayrollRecord) =>
        `₹${record.grossSalary.toLocaleString()}`,
    },
    {
      header: "Deductions",
      accessorKey: "totalDeductions",
      render: (record: PayrollRecord) =>
        `₹${record.totalDeductions.toLocaleString()}`,
    },
    {
      header: "Net Pay",
      accessorKey: "netSalary",
      render: (record: PayrollRecord) => (
        <span className="font-bold text-text-primary">
          ₹{record.netSalary.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (record: PayrollRecord) => {
        const status = record.status;
        return (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              status === "Paid"
                ? "bg-green-100 text-green-700"
                : status === "Draft"
                ? "bg-gray-100 text-gray-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Pay Date",
      accessorKey: "paymentDate",
      render: (record: PayrollRecord) =>
        record.paymentDate ? formatDate(record.paymentDate) : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card p-4 rounded-lg border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-40">
            <Select
              label=""
              value={selectedMonth}
              onChange={(val) => setSelectedMonth(val as string)}
              options={months.map((m) => ({ value: m, label: m }))}
            />
          </div>
          <div className="w-32">
            <Select
              label=""
              value={selectedYear}
              onChange={(val) => setSelectedYear(val as string)}
              options={(() => {
                const currentYear = new Date().getFullYear();
                return Array.from({ length: 100 }, (_, i) => {
                  const year = currentYear - 50 + i;
                  return { value: String(year), label: String(year) };
                });
              })()}
            />
          </div>
          <Button
            variant="secondary"
            onClick={fetchReport}
            leftIcon={<Search size={16} />}
          >
            Refresh
          </Button>
        </div>

        <Button
          variant="primary"
          onClick={handleExport}
          disabled={payrolls.length === 0}
          leftIcon={<Download size={16} />}
        >
          Export Excel
        </Button>
      </div>

      <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
        <Table
          data={payrolls}
          columns={columns}
          isLoading={loading}
          emptyMessage="No payroll records found for this period."
        />
      </div>

      {payrolls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-bg-card p-4 rounded-lg border border-border">
            <p className="text-text-secondary text-sm">Total Payout</p>
            <p className="text-2xl font-bold text-text-primary">
              ₹
              {payrolls
                .reduce((sum, p) => sum + p.netSalary, 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-bg-card p-4 rounded-lg border border-border">
            <p className="text-text-secondary text-sm">Average Salary</p>
            <p className="text-2xl font-bold text-text-primary">
              ₹
              {Math.round(
                payrolls.reduce((sum, p) => sum + p.netSalary, 0) /
                  payrolls.length
              ).toLocaleString()}
            </p>
          </div>
          <div className="bg-bg-card p-4 rounded-lg border border-border">
            <p className="text-text-secondary text-sm">Total Employees</p>
            <p className="text-2xl font-bold text-text-primary">
              {payrolls.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
