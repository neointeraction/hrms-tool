import { Table } from "../../components/common/Table";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { apiService } from "../../services/api.service";

interface LeaveRequest {
  _id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  totalDays: number;
  workflowStatus: string;
  createdAt: string;
}

export default function LeaveList() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const data = await apiService.getMyLeaves();
      setLeaves(data.leaves || []);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []); // Reload on mount. Ideally should reload on submit success.

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-status-success/10 text-status-success";
      case "rejected":
        return "bg-status-error/10 text-status-error";
      case "pending":
      default:
        return "bg-status-warning/10 text-status-warning";
    }
  };

  return (
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      <Table
        isLoading={loading}
        data={leaves}
        emptyMessage="No leave history found."
        columns={[
          {
            header: "Type",
            accessorKey: "type",
            render: (leave) => (
              <span className="font-medium text-text-primary">
                {leave.type}
              </span>
            ),
          },
          {
            header: "Duration",
            accessorKey: "totalDays",
            render: (leave) => (
              <span className="text-sm text-text-secondary">
                {leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}
              </span>
            ),
          },
          {
            header: "Dates",
            accessorKey: "startDate", // Sort by start date
            render: (leave) => (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar size={14} />
                <span>
                  {format(new Date(leave.startDate), "MMM d, yyyy")} -{" "}
                  {format(new Date(leave.endDate), "MMM d, yyyy")}
                </span>
              </div>
            ),
          },
          {
            header: "Reason",
            accessorKey: "reason",
            render: (leave) => (
              <span
                className="text-sm text-text-secondary max-w-xs truncate block"
                title={leave.reason}
              >
                {leave.reason}
              </span>
            ),
          },
          {
            header: "Status",
            accessorKey: "status",
            render: (leave) => (
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                  leave.status
                )}`}
              >
                {leave.status}
              </span>
            ),
          },
          {
            header: "Workflow",
            accessorKey: "workflowStatus",
            render: (leave) => (
              <div className="flex items-center gap-1 text-sm text-text-secondary">
                <Clock size={14} />
                {leave.workflowStatus}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
