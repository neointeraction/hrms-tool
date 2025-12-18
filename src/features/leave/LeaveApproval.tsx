import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Check, X, User, AlertCircle } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Textarea } from "../../components/common/Textarea";
import { Skeleton } from "../../components/common/Skeleton";

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

  // Action State
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null
  );
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

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

  const openActionModal = (
    request: LeaveRequest,
    type: "approve" | "reject"
  ) => {
    setSelectedRequest(request);
    setActionType(type);
    setComment("");
  };

  const closeActionModal = () => {
    setSelectedRequest(null);
    setActionType(null);
    setComment("");
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    if (actionType === "reject" && !comment.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setActionLoading(true);
    try {
      if (actionType === "approve") {
        await apiService.approveLeave(selectedRequest._id, comment);
      } else {
        await apiService.rejectLeave(selectedRequest._id, comment);
      }
      // Refresh list
      fetchApprovals();
      closeActionModal();
    } catch (error) {
      console.error(`Failed to ${actionType} leave:`, error);
      alert(`Failed to ${actionType} leave`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card rounded-lg border border-border p-4 shadow-sm flex flex-col h-[280px]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="space-y-3 mb-6 flex-1">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-20 w-full rounded" />
            </div>
            <div className="flex gap-3 mt-auto">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-bg-main rounded-lg border border-dashed border-border">
            <div className="flex flex-col items-center justify-center text-text-muted">
              <Check className="w-12 h-12 mb-2 opacity-20" />
              <p>No pending approvals found.</p>
            </div>
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request._id}
              className="bg-bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
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

              <div className="space-y-3 mb-6 flex-1">
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
                  <p className="text-xs uppercase text-text-muted font-semibold mb-1">
                    Reason
                  </p>
                  <p className="line-clamp-3 italic" title={request.reason}>
                    "{request.reason}"
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => openActionModal(request, "reject")}
                  leftIcon={<X size={16} />}
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => openActionModal(request, "approve")}
                  leftIcon={<Check size={16} />}
                >
                  Approve
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-bg-card rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div
              className={`p-4 border-b ${
                actionType === "approve"
                  ? "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900/30"
                  : "bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30"
              } flex items-center justify-between`}
            >
              <h3
                className={`font-semibold ${
                  actionType === "approve"
                    ? "text-green-800 dark:text-green-300"
                    : "text-red-800 dark:text-red-300"
                } flex items-center gap-2`}
              >
                {actionType === "approve" ? (
                  <Check size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                {actionType === "approve"
                  ? "Approve Request"
                  : "Reject Request"}
              </h3>
              <button
                onClick={closeActionModal}
                className="text-text-muted hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-text-secondary">
                You are about to <strong>{actionType}</strong> the leave request
                for
                <span className="font-semibold text-text-primary">
                  {" "}
                  {selectedRequest.employee?.firstName}{" "}
                  {selectedRequest.employee?.lastName}
                </span>
                .
              </p>

              <Textarea
                label={
                  actionType === "reject"
                    ? "Reason for Rejection *"
                    : "Comments (Optional)"
                }
                placeholder={
                  actionType === "reject"
                    ? "Please explain why this request is being rejected..."
                    : "Add any comments..."
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                autoFocus
              />

              {actionType === "reject" && !comment.trim() && (
                <p className="text-xs text-amber-600 flex items-center gap-1">
                  <AlertCircle size={12} /> Reason is required for rejection.
                </p>
              )}
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-3 bg-bg-secondary/50">
              <Button
                variant="ghost"
                onClick={closeActionModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === "approve" ? "primary" : "danger"}
                onClick={handleConfirmAction}
                isLoading={actionLoading}
                disabled={actionType === "reject" && !comment.trim()}
              >
                Confirm {actionType === "approve" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
