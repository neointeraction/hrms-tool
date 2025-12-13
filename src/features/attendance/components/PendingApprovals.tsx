import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { Skeleton } from "../../../components/common/Skeleton";
import { apiService } from "../../../services/api.service";
import { useAuth } from "../../../context/AuthContext";

export default function PendingApprovals() {
  const { user } = useAuth();
  const [pendingTimesheets, setPendingTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isManager = ["HR", "Project Manager"].includes(user?.role || "");

  useEffect(() => {
    if (isManager) {
      fetchPendingApprovals();
      // Refresh every minute
      const interval = setInterval(fetchPendingApprovals, 60000);
      return () => clearInterval(interval);
    }
  }, [isManager]);

  const fetchPendingApprovals = async () => {
    try {
      const data = await apiService.getPendingTimesheetApprovals();
      setPendingTimesheets(data.timesheets || []);
    } catch (error) {
      console.error("Failed to fetch pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await apiService.approveTimesheet(id, "");
      fetchPendingApprovals();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isManager) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="border border-border rounded-lg p-4 bg-bg-card"
          >
            <div className="flex justify-between mb-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-16 w-full rounded" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-9 w-24 rounded" />
              <Skeleton className="h-9 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Group by employee
  const groupedByEmployee = pendingTimesheets.reduce((acc, timesheet) => {
    const empId = timesheet.employee._id;
    if (!acc[empId]) {
      acc[empId] = {
        employee: timesheet.employee,
        timesheets: [],
      };
    }
    acc[empId].timesheets.push(timesheet);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Pending Approvals
          </h3>
          <p className="text-sm text-text-secondary">
            Review and approve timesheet submissions from your team
          </p>
        </div>
        {pendingTimesheets.length > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {pendingTimesheets.length} pending
          </span>
        )}
      </div>

      {Object.keys(groupedByEmployee).length === 0 ? (
        <div className="text-center py-12 text-text-secondary border border-border rounded-lg">
          <CheckCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p>No pending approvals</p>
          <p className="text-sm mt-1">All timesheets are up to date</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(groupedByEmployee).map((group: any) => {
            const totalHours = group.timesheets
              .reduce((sum: number, t: any) => sum + (t.hours || 0), 0)
              .toFixed(2);

            return (
              <div
                key={group.employee._id}
                className="border border-border rounded-lg p-4 bg-yellow-50"
              >
                {/* Employee Header */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-yellow-200">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      {group.employee.firstName} {group.employee.lastName}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {group.employee.employeeId} • {group.timesheets.length}{" "}
                      entries • {totalHours}h total
                    </p>
                  </div>
                  <span className="text-xs text-text-secondary flex items-center gap-1">
                    <Clock size={12} />
                    Submitted{" "}
                    {new Date(
                      group.timesheets[0].submittedAt
                    ).toLocaleDateString()}
                  </span>
                </div>

                {/* Timesheet Entries */}
                <div className="space-y-2 mb-4">
                  {group.timesheets.map((timesheet: any) => (
                    <div
                      key={timesheet._id}
                      className="bg-white border border-yellow-200 rounded p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-text-primary">
                              {timesheet.project}
                            </span>
                            <span className="text-text-secondary">•</span>
                            <span className="text-text-secondary">
                              {timesheet.task}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span>
                              {new Date(timesheet.date).toLocaleDateString()}
                            </span>
                            <span>
                              {timesheet.startTime} - {timesheet.endTime}
                            </span>
                            <span className="font-medium text-brand-primary">
                              {timesheet.hours}h
                            </span>
                          </div>
                          {timesheet.description && (
                            <p className="text-xs text-text-secondary mt-1 italic">
                              {timesheet.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Approval Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Approve all timesheets for this employee
                      group.timesheets.forEach((t: any) =>
                        handleApprove(t._id)
                      );
                    }}
                    disabled={processingId !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {processingId ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Approve All
                  </button>
                  <button
                    onClick={() => {
                      // Reject with common reason for all
                      const reason = prompt(
                        "Reason for rejecting all entries:"
                      );
                      if (reason) {
                        group.timesheets.forEach((t: any) =>
                          apiService.rejectTimesheet(t._id, reason)
                        );
                        fetchPendingApprovals();
                      }
                    }}
                    disabled={processingId !== null}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    <XCircle size={16} />
                    Reject All
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
