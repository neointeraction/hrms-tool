import { useState, useEffect } from "react";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { format } from "date-fns";
import { Avatar } from "../../../components/common/Avatar";
import { Table } from "../../../components/common/Table";
import { Modal } from "../../../components/common/Modal";
import { Select } from "../../../components/common/Select";
import { ASSET_BASE_URL } from "../../../services/api.service";

export default function ResignationManagement() {
  const [resignations, setResignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [selectedResignation, setSelectedResignation] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [actionComment, setActionComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [clearanceModalOpen, setClearanceModalOpen] = useState(false);
  const [clearanceData, setClearanceData] = useState<any>(null);
  const [clearanceLoading, setClearanceLoading] = useState(false);

  useEffect(() => {
    fetchResignations();
  }, [filterStatus]);

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPendingResignations(filterStatus);
      setResignations(data);
    } catch (error) {
      console.error("Failed to fetch resignations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (resignation: any, type: "approve" | "reject") => {
    setSelectedResignation(resignation);
    setActionType(type);
    setActionModalOpen(true);
    setActionComment("");
  };

  const submitAction = async () => {
    if (!selectedResignation) return;

    try {
      setActionLoading(true);
      await apiService.updateResignationStatus(selectedResignation._id, {
        status: actionType === "approve" ? "approved" : "rejected",
        comments: actionComment,
      });
      setActionModalOpen(false);
      fetchResignations(); // Refresh list
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearanceClick = async (resignationId: string) => {
    const resignation = resignations.find((r) => r._id === resignationId);
    if (resignation) {
      setSelectedResignation(resignation);
    }
    setClearanceModalOpen(true);
    setClearanceLoading(true);
    try {
      const data = await apiService.getClearance(resignationId);
      setClearanceData(data);
    } catch (error) {
      console.error("Failed to fetch clearance", error);
      alert("Failed to load clearance data");
      setClearanceModalOpen(false);
    } finally {
      setClearanceLoading(false);
    }
  };

  const updateClearanceItem = async (
    type: "asset" | "task",
    itemId: string,
    currentStatus: string
  ) => {
    if (!clearanceData) return;

    // Optimistic or simple toggle logic
    const newStatus =
      type === "asset"
        ? currentStatus === "Pending"
          ? "Returned"
          : "Pending"
        : currentStatus === "Pending"
        ? "Completed"
        : "Pending";

    try {
      // Update local state first for responsiveness or wait? Let's wait for API
      const updatedClearance = await apiService.updateClearanceItem(
        clearanceData._id,
        {
          type,
          itemId,
          status: newStatus,
          remarks: "Updated via Portal",
        }
      );
      setClearanceData(updatedClearance);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Resignations</h1>
          <p className="text-text-secondary text-sm">
            Manage employee exit requests and approvals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Select
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as string)}
              options={[
                { value: "", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>

      <div className="bg-bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <Table
          isLoading={loading}
          data={resignations}
          emptyMessage="No resignation records found."
          columns={[
            {
              header: "Employee",
              accessorFn: (row) =>
                `${row.employee?.firstName} ${row.employee?.lastName}`,
              render: (resignation) => (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={
                      resignation.employee?.profilePicture
                        ? resignation.employee.profilePicture.startsWith("http")
                          ? resignation.employee.profilePicture
                          : `${ASSET_BASE_URL}${resignation.employee.profilePicture}`
                        : undefined
                    }
                    name={`${resignation.employee?.firstName} ${resignation.employee?.lastName}`}
                    className="w-8 h-8"
                  />
                  <div>
                    <p className="font-medium text-text-primary">
                      {resignation.employee?.firstName}{" "}
                      {resignation.employee?.lastName}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {resignation.employee?.designation || "Employee"}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              header: "Submitted On",
              accessorKey: "submittedDate",
              render: (resignation) => (
                <span className="text-text-secondary">
                  {format(new Date(resignation.submittedDate), "MMM dd, yyyy")}
                </span>
              ),
            },
            {
              header: "Last Working Day",
              accessorKey: "lastWorkingDay",
              render: (resignation) => (
                <span className="text-text-secondary font-medium">
                  {format(new Date(resignation.lastWorkingDay), "MMM dd, yyyy")}
                </span>
              ),
            },
            {
              header: "Reason",
              accessorKey: "reason",
              render: (resignation) => (
                <div
                  className="text-text-secondary max-w-xs truncate"
                  title={resignation.reason}
                >
                  {resignation.reason}
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (resignation) => getStatusBadge(resignation.status),
            },
            {
              header: "Actions",
              className: "text-right",
              render: (resignation) => (
                <div className="flex items-center justify-end gap-2">
                  {resignation.status === "pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleActionClick(resignation, "approve")
                        }
                        className="p-1.5 rounded-full text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleActionClick(resignation, "reject")}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  )}

                  {(resignation.status === "approved" ||
                    resignation.status === "completed") && (
                    <button
                      onClick={() => handleClearanceClick(resignation._id)}
                      className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Exit Clearance Checklist"
                    >
                      <FileText size={18} />
                    </button>
                  )}

                  {resignation.status !== "pending" &&
                    resignation.status !== "approved" &&
                    resignation.status !== "completed" && (
                      <span className="text-xs text-text-muted italic">
                        {resignation.status}
                      </span>
                    )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Action Modal (Approve/Reject) */}
      {/* Action Modal (Approve/Reject) */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`${actionType === "approve" ? "Approve" : "Reject"} Resignation`}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <button
              onClick={() => setActionModalOpen(false)}
              className="px-3 py-1.5 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitAction}
              disabled={actionLoading}
              className={`px-3 py-1.5 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionLoading
                ? "Processing..."
                : `Confirm ${
                    actionType === "approve" ? "Approval" : "Rejection"
                  }`}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-text-secondary text-sm">
            You are about to <strong>{actionType}</strong> the resignation
            request for{" "}
            <strong>
              {selectedResignation?.employee?.firstName}{" "}
              {selectedResignation?.employee?.lastName}
            </strong>
            .
          </p>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              className="w-full p-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-text-primary placeholder:text-text-placeholder"
              placeholder="Add any internal notes or feedback..."
            />
          </div>
        </div>
      </Modal>

      {/* Clearance Modal */}
      <Modal
        isOpen={clearanceModalOpen}
        onClose={() => setClearanceModalOpen(false)}
        title="Exit Clearance Checklist"
        maxWidth="max-w-4xl"
      >
        <div className="">
          {clearanceData && (
            <div className="mb-6 bg-brand-primary/5 dark:bg-brand-primary/10 p-4 rounded-lg border border-brand-primary/20">
              <p className="text-sm text-text-secondary">
                Employee:{" "}
                <span className="font-semibold text-text-primary">
                  {clearanceData.employee.firstName}{" "}
                  {clearanceData.employee.lastName}
                </span>{" "}
                • Status:{" "}
                <span className="font-medium text-brand-primary">
                  {clearanceData.overallStatus}
                </span>{" "}
                • Exit Date:{" "}
                <span className="font-semibold text-text-primary">
                  {selectedResignation?.lastWorkingDay
                    ? format(
                        new Date(selectedResignation.lastWorkingDay),
                        "MMM dd, yyyy"
                      )
                    : "N/A"}
                </span>
              </p>
            </div>
          )}

          {clearanceLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading clearance data...
            </div>
          ) : !clearanceData ? (
            <div className="text-center py-12 text-red-500">
              Failed to load data.
            </div>
          ) : (
            <div className="space-y-8">
              {/* Assets Section */}
              <div>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-1 rounded text-sm">
                    📦
                  </span>{" "}
                  Asset Recovery
                </h4>
                {clearanceData.assetsToReturn.length === 0 ? (
                  <p className="text-sm text-text-secondary italic px-4">
                    No assets assigned to return.
                  </p>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-bg-secondary text-text-secondary font-medium border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Asset Name</th>
                          <th className="px-4 py-3">Code</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {clearanceData.assetsToReturn.map((item: any) => (
                          <tr key={item._id} className="hover:bg-bg-subtle">
                            <td className="px-4 py-3 font-medium text-text-primary">
                              {item.assetName}
                            </td>
                            <td className="px-4 py-3 text-text-secondary">
                              {item.assetCode}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  item.status === "Returned"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.status !== "Returned" && (
                                <button
                                  onClick={() =>
                                    updateClearanceItem(
                                      "asset",
                                      item._id,
                                      item.status
                                    )
                                  }
                                  className="text-xs bg-bg-card border border-border hover:bg-bg-secondary px-3 py-1.5 rounded-md shadow-sm transition-colors text-text-secondary"
                                >
                                  Mark Returned
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Checklist Section */}
              <div>
                <h4 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 p-1 rounded text-sm">
                    ✅
                  </span>{" "}
                  Operational Checklist
                </h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-bg-secondary text-text-secondary font-medium border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Task</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {clearanceData.checklist.map((item: any) => (
                        <tr key={item._id} className="hover:bg-bg-subtle">
                          <td className="px-4 py-3 font-medium text-text-primary">
                            {item.task}
                          </td>
                          <td className="px-4 py-3 text-text-secondary">
                            {item.department}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                item.status === "Completed"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-bg-main text-text-secondary"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.status !== "Completed" && (
                              <button
                                onClick={() =>
                                  updateClearanceItem(
                                    "task",
                                    item._id,
                                    item.status
                                  )
                                }
                                className="text-xs bg-bg-card border border-border hover:bg-bg-secondary px-3 py-1.5 rounded-md shadow-sm transition-colors text-text-secondary"
                              >
                                Mark Done
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
