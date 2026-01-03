import { useState, useEffect } from "react";
import { Download, Search, Wallet, Banknote, Users } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Table, type Column } from "../../components/common/Table";
import { Select } from "../../components/common/Select";
import { formatDate } from "../../utils/dateUtils";
import { Skeleton } from "../../components/common/Skeleton";

const PayrollReportSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-bg-card p-4 rounded-xl border border-border flex items-center gap-4"
        >
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>

    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

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

    // Calculate Column Widths
    const wscols = headers.map((header, i) => {
      const maxLen = Math.max(
        header.length,
        ...data.map((row) => (row[i] ? row[i].toString().length : 0))
      );
      return { wch: maxLen + 5 }; // Add padding
    });
    worksheet["!cols"] = wscols;

    // Apply Header Styles
    const range = utils.decode_range(worksheet["!ref"] || "A1");
    // Only style the first row (header)
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = utils.encode_cell({ r: 0, c: C });
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        fill: {
          fgColor: { rgb: "4F46E5" }, // Brand Primary for Report
        },
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
        },
        alignment: {
          horizontal: "center",
        },
        border: {
          bottom: { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Payroll Report");

    // Generate Excel File
    writeFile(workbook, `Payroll_Report_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const columns: Column<PayrollRecord>[] = [
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

      {loading ? (
        <PayrollReportSkeleton />
      ) : (
        <>
          {payrolls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Payout Widget */}
              <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">
                    Total Payout
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    ₹
                    {payrolls
                      .reduce((sum, p) => sum + p.netSalary, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Average Salary Widget */}
              <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-status-success/10 rounded-lg text-status-success">
                  <Banknote size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">
                    Average Salary
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    ₹
                    {Math.round(
                      payrolls.reduce((sum, p) => sum + p.netSalary, 0) /
                        payrolls.length
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Total Employees Widget */}
              <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-text-secondary font-medium">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-text-primary">
                    {payrolls.length}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
            <Table
              data={payrolls}
              columns={columns}
              isLoading={false}
              emptyMessage="No payroll records found for this period."
            />
          </div>
        </>
      )}
    </div>
  );
}
