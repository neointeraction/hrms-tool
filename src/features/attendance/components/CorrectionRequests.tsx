import { useState, useEffect } from "react";
import { Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { Skeleton } from "../../../components/common/Skeleton";
import { apiService } from "../../../services/api.service";
import { useAuth } from "../../../context/AuthContext";
import { Select } from "../../../components/common/Select";
import { DatePicker } from "../../../components/common/DatePicker";
import { Button } from "../../../components/common/Button";

export default function CorrectionRequests() {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    correctionType: "add",
    requestedDate: new Date().toISOString().split("T")[0],
    requestedClockIn: "",
    requestedClockOut: "",
    reason: "",
  });

  const isManager = ["HR", "Project Manager"].includes(user?.role || "");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const myData = await apiService.getMyCorrections();
      setMyRequests(myData.corrections || []);

      if (isManager) {
        const pendingData = await apiService.getPendingCorrections();
        setPendingApprovals(pendingData.corrections || []);
      }
    } catch (error) {
      console.error("Failed to fetch corrections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.requestTimeCorrection(formData);
      setShowAddForm(false);
      setFormData({
        correctionType: "add",
        requestedDate: new Date().toISOString().split("T")[0],
        requestedClockIn: "",
        requestedClockOut: "",
        reason: "",
      });
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiService.approveCorrection(id, "");
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleReject = async (id: string) => {
    const comments = prompt("Reason for rejection:");
    if (!comments) return;
    try {
      await apiService.rejectCorrection(id, comments);
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-bg-main border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Request Form */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              My Correction Requests
            </h3>
            <p className="text-sm text-text-secondary">
              Request corrections for missed clock in/out
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus size={20} />}
          >
            New Request
          </Button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-bg-main border border-border rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Type"
                  value={formData.correctionType}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      correctionType: value as string,
                    })
                  }
                  options={[
                    { value: "add", label: "Add Missing Entry" },
                    { value: "edit", label: "Edit Existing Entry" },
                  ]}
                />
              </div>
              <div>
                <DatePicker
                  label="Date"
                  value={formData.requestedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, requestedDate: e.target.value })
                  }
                  required
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Clock In Time
                </label>
                <input
                  type="time"
                  value={formData.requestedClockIn}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedClockIn: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Clock Out Time
                </label>
                <input
                  type="time"
                  value={formData.requestedClockOut}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedClockOut: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Reason *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Explain why this correction is needed..."
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* My Requests */}
      <div className="space-y-3">
        {myRequests.length === 0 ? (
          <div className="text-center py-8 text-text-secondary border border-border rounded-lg">
            <Clock size={32} className="mx-auto mb-2 opacity-50" />
            <p>No correction requests yet</p>
          </div>
        ) : (
          myRequests.map((request) => (
            <div
              key={request._id}
              className="bg-bg-main border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold text-text-primary">
                    {new Date(request.requestedDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-text-secondary ml-2">
                    ({request.correctionType})
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    request.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : request.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {request.status}
                </span>
              </div>
              <p className="text-sm text-text-secondary mb-2">
                {request.requestedClockIn} - {request.requestedClockOut}
              </p>
              <p className="text-sm text-text-primary italic">
                "{request.reason}"
              </p>
              {request.managerComments && (
                <p className="text-sm text-text-secondary mt-2 pt-2 border-t border-border">
                  Manager: {request.managerComments}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pending Approvals (for Managers) */}
      {isManager && (
        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Pending Approvals
          </h3>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-text-secondary border border-border rounded-lg">
              <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((request) => (
                <div
                  key={request._id}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-text-primary">
                        {request.employee?.firstName}{" "}
                        {request.employee?.lastName}
                      </span>
                      <span className="text-sm text-text-secondary ml-2">
                        ({request.employee?.employeeId})
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {new Date(request.requestedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">
                    {request.requestedClockIn} - {request.requestedClockOut}
                  </p>
                  <p className="text-sm text-text-primary italic mb-3">
                    Reason: "{request.reason}"
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
