import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, User } from "lucide-react";
import { apiService } from "../../services/api.service";

interface LeaveRequest {
  _id: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeId: string;
    designation: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  totalDays: number;
}

export default function LeaveApproval() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const data = await apiService.getPendingLeaveApprovals();
      setRequests(data.leaves || []);
    } catch (error) {
      console.error("Failed to fetch approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      if (action === "approve") {
        await apiService.approveLeave(id, "Approved via portal");
      } else {
        await apiService.rejectLeave(id, "Rejected via portal");
      }
      // Refresh list
      fetchApprovals();
    } catch (error) {
      console.error(`Failed to ${action} leave:`, error);
      alert(`Failed to ${action} leave`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading approvals...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.length === 0 ? (
        <div className="col-span-full text-center py-8 text-text-muted">
          No pending approvals.
        </div>
      ) : (
        requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">
                    {request.employee?.firstName} {request.employee?.lastName}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {request.employee?.designation}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-brand-primary/5 text-brand-primary text-xs font-medium rounded">
                {request.type}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Duration</span>
                <span className="font-medium text-text-primary">
                  {request.totalDays} Day{request.totalDays > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Dates</span>
                <span className="font-medium text-text-primary">
                  {format(new Date(request.startDate), "MMM d")} -{" "}
                  {format(new Date(request.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="bg-bg-main p-3 rounded text-sm text-text-secondary">
                <p className="line-clamp-2" title={request.reason}>
                  {request.reason}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleAction(request._id, "reject")}
                disabled={processingId === request._id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-status-error text-status-error rounded-lg hover:bg-status-error/5 transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Reject
              </button>
              <button
                onClick={() => handleAction(request._id, "approve")}
                disabled={processingId === request._id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                <Check size={16} />
                Approve
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
