import { useState, useEffect } from "react";
import { format } from "date-fns";
import { apiService } from "../../services/api.service";
import { Table, type Column } from "../../components/common/Table";
import { Badge, type BadgeVariant } from "../../components/common/Badge";
import { Select } from "../../components/common/Select";
import { DatePicker } from "../../components/common/DatePicker";

interface LeaveEntry {
  _id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalLeavesTakenMonth: number;
  status: string;
  reason: string;
}

export default function HRLeaveOverview() {
  const [data, setData] = useState<LeaveEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [year, setYear] = useState(new Date().getFullYear());
  const [department, setDepartment] = useState("All");
  const [employee, setEmployee] = useState("All"); // Employee User ID
  const [status, setStatus] = useState("All");
  const [leaveType, setLeaveType] = useState("All");

  const [employees, setEmployees] = useState<
    { value: string; label: string }[]
  >([]);

  const departments = [
    { value: "All", label: "All Departments" },
    { value: "Engineering", label: "Engineering" },
    { value: "Design", label: "Design" },
    { value: "Product", label: "Product" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "HR", label: "Human Resources" },
    { value: "Finance", label: "Finance" },
  ];

  const leaveTypes = [
    { value: "All", label: "All Types" },
    { value: "Sick", label: "Sick" },
    { value: "Casual", label: "Casual" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Floating", label: "Floating" },
  ];

  const statusOptions = [
    { value: "All", label: "All Status" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "Rejected", label: "Rejected" },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchData();
  }, [month, year, department, employee, status, leaveType]);

  const fetchEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      const options = data.map((emp: any) => ({
        value: emp.user?._id || emp._id, // Prefer User ID if available, else Employee ID
        label: `${emp.firstName} ${emp.lastName} (${emp.employeeId || "N/A"})`,
      }));
      setEmployees([{ value: "All", label: "All Employees" }, ...options]);
    } catch (error) {
      console.error("Failed to fetch employees", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const filters = {
        month,
        year,
        department,
        employee,
        status,
        type: leaveType,
      };

      const result = await apiService.getHRLeaveOverview(filters);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch leave overview", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<LeaveEntry>[] = [
    {
      header: "Employee",
      accessorKey: "employeeName",
      render: (leave) => (
        <div>
          <div className="font-medium text-text-primary">
            {leave.employeeName}
          </div>
          <div className="text-xs text-text-secondary">{leave.employeeId}</div>
        </div>
      ),
    },
    {
      header: "Details",
      accessorKey: "department",
      render: (leave) => (
        <div>
          <div className="text-sm text-text-primary">{leave.department}</div>
          <div className="text-xs text-text-secondary">{leave.designation}</div>
        </div>
      ),
    },
    {
      header: "Leave Type",
      accessorKey: "type",
      render: (leave) => <span className="font-medium">{leave.type}</span>,
    },
    {
      header: "Duration",
      accessorKey: "startDate",
      render: (leave) => (
        <div className="text-sm">
          <div>
            {format(new Date(leave.startDate), "MMM dd")} -{" "}
            {format(new Date(leave.endDate), "MMM dd")}
          </div>
          <div className="text-xs text-text-muted">
            {leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      header: "Total (Month)",
      accessorKey: "totalLeavesTakenMonth",
      render: (leave) => (
        <div className="font-bold text-center text-brand-primary">
          {leave.totalLeavesTakenMonth}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (leave) => {
        const variants: Record<string, BadgeVariant> = {
          Approved: "success",
          Pending: "warning",
          Rejected: "error",
        };
        return (
          <Badge variant={variants[leave.status] || "default"}>
            {leave.status}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Month picker replacing separate month/year selects */}
          <div className="flex flex-col gap-1.5">
            <DatePicker
              label="Month & Year"
              showMonthYearPicker
              dateFormat="MMMM yyyy"
              value={`${year}-${String(month).padStart(2, "0")}-01`}
              onChange={(e) => {
                // e.target.value is yyyy-MM-dd from DatePicker implementation
                const val = e.target.value;
                if (val) {
                  const date = new Date(val);
                  if (!isNaN(date.getTime())) {
                    setYear(date.getFullYear());
                    setMonth(date.getMonth() + 1);
                  }
                }
              }}
              // Force disable custom header to allow month picker view
              renderCustomHeader={undefined}
            />
          </div>

          <Select
            label="Department"
            value={department}
            onChange={(v) => setDepartment(String(v))}
            options={departments}
          />
          <Select
            label="Employee"
            value={employee}
            onChange={(v) => setEmployee(String(v))}
            options={employees}
          />
          <Select
            label="Type"
            value={leaveType}
            onChange={(v) => setLeaveType(String(v))}
            options={leaveTypes}
          />
          <Select
            label="Status"
            value={status}
            onChange={(v) => setStatus(String(v))}
            options={statusOptions}
          />
        </div>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <Table
          data={data}
          columns={columns}
          isLoading={loading}
          emptyMessage="No leave records found for selected criteria."
        />
      </div>
    </div>
  );
}
