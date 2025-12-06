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

  if (loading) {
    return <div className="text-center py-8">Loading leaves...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-bg-main text-text-secondary text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Duration</th>
            <th className="px-6 py-4">Dates</th>
            <th className="px-6 py-4">Reason</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Workflow</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-text-muted">
                No leave history found.
              </td>
            </tr>
          ) : (
            leaves.map((leave) => (
              <tr
                key={leave._id}
                className="hover:bg-bg-hover/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-text-primary">
                  {leave.type}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {leave.totalDays} day{leave.totalDays > 1 ? "s" : ""}
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(leave.startDate), "MMM d, yyyy")} -{" "}
                      {format(new Date(leave.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                </td>
                <td
                  className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate"
                  title={leave.reason}
                >
                  {leave.reason}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {leave.workflowStatus}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
