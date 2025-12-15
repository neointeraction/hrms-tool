import { useState, useEffect } from "react";
import {
  Filter,
  Clock,
  User,
  FileText,
  MapPin,
  Trash2,
  Monitor,
  Smartphone,
  Globe,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Select } from "../../components/common/Select";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { DatePicker } from "../../components/common/DatePicker";
import { Skeleton } from "../../components/common/Skeleton";

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleClearLogs = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear Audit Trail",
      message:
        "Are you sure you want to delete ALL audit logs? This action cannot be undone.",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await apiService.clearAuditLogs();
          setLogs([]); // Clear local state immediately
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to clear logs", error);
          alert("Failed to clear logs");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const handleDeleteLog = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Audit Log",
      message: "Are you sure you want to delete this log entry?",
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await apiService.deleteAuditLog(id);
          setLogs((prev) => prev.filter((l) => l._id !== id));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Failed to delete log", err);
          alert("Failed to delete log");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAuditLogs({
        ...filters,
        limit: 100,
      });
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAuditLogs();
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      create: "bg-status-success/10 text-status-success",
      update: "bg-brand-primary/10 text-brand-primary",
      delete: "bg-status-error/10 text-status-error",
      approve: "bg-status-success/10 text-status-success",
      reject: "bg-status-error/10 text-status-error",
      submit: "bg-status-warning/10 text-status-warning",
      login: "bg-blue-100 text-blue-700",
      logout: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[action] || "bg-bg-main text-text-secondary"
        }`}
      >
        {action.toUpperCase()}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "TimeEntry":
        return <Clock size={16} className="text-blue-600" />;
      case "Timesheet":
        return <FileText size={16} className="text-green-600" />;
      case "TimeCorrection":
        return <User size={16} className="text-purple-600" />;
      case "User":
        return <User size={16} className="text-indigo-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
          <div className="flex justify-end">
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="bg-bg-card p-4 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32 mt-4 rounded-lg" />
        </div>

        {/* List Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-bg-card p-4 rounded-lg shadow-sm border border-border"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-48 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Audit Trail</h1>
        <p className="text-text-secondary mt-1">
          Complete history of all time-related changes
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleClearLogs}
            disabled={isDeleting || logs.length === 0}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Audit Trail
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-brand-primary" />
          <h3 className="font-semibold text-text-primary">Filters</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Select
              label="Entity Type"
              value={filters.entityType}
              onChange={(value) =>
                setFilters({ ...filters, entityType: value as string })
              }
              options={[
                { value: "", label: "All" },
                { value: "TimeEntry", label: "Time Entry" },
                { value: "Timesheet", label: "Timesheet" },
                { value: "TimeCorrection", label: "Time Correction" },
                { value: "User", label: "User" },
              ]}
            />
          </div>
          <div>
            <Select
              label="Action"
              value={filters.action}
              onChange={(value) =>
                setFilters({ ...filters, action: value as string })
              }
              options={[
                { value: "", label: "All" },
                { value: "create", label: "Create" },
                { value: "update", label: "Update" },
                { value: "delete", label: "Delete" },
                { value: "submit", label: "Submit" },
                { value: "approve", label: "Approve" },
                { value: "reject", label: "Reject" },
                { value: "login", label: "Login" },
                { value: "logout", label: "Logout" },
              ]}
            />
          </div>
          <div>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleFilter}
          className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
        >
          Apply Filters
        </button>
      </div>

      {/* Audit Logs List */}
      {logs.length === 0 ? (
        <div className="text-center py-12 text-text-secondary border border-border rounded-lg">
          <p>No audit logs found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log._id}
              className="bg-bg-card p-4 rounded-lg shadow-sm border border-border hover:border-brand-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getEntityIcon(log.entityType)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-text-primary">
                        {log.entityType}
                      </span>
                      {getActionBadge(log.action)}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">
                      by {log.performedBy?.name || "Unknown"}
                      {log.employee &&
                        ` • ${log.employee.firstName} ${log.employee.lastName}`}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteLog(log._id);
                  }}
                  className="p-1 text-text-muted hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                  title="Delete Log"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Changes Display */}
              {log.changes && (
                <div className="mt-3 p-3 bg-bg-main rounded border border-border">
                  <p className="text-xs font-medium text-text-secondary mb-2">
                    Changes:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {log.changes.old && (
                      <div>
                        <p className="text-xs text-red-600 font-medium mb-1">
                          Old:
                        </p>
                        <pre className="text-xs bg-status-error/5 p-2 rounded overflow-auto text-text-primary">
                          {JSON.stringify(log.changes.old, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.changes.new && (
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">
                          New:
                        </p>
                        <pre className="text-xs bg-status-success/5 p-2 rounded overflow-auto text-text-primary">
                          {JSON.stringify(log.changes.new, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata Display */}
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="mt-2 text-xs text-text-secondary">
                  <strong>Details:</strong>{" "}
                  <div className="mt-2 flex flex-col gap-1.5">
                    {/* Common fields (IP & Device) */}
                    {(log.metadata.ip || log.metadata.device) && (
                      <div className="flex flex-wrap gap-4">
                        {log.metadata.ip && (
                          <div className="flex items-center gap-1.5 text-xs bg-bg-main px-2 py-1 rounded border border-border">
                            <Globe size={12} className="text-brand-primary" />
                            <span className="font-mono text-text-primary">
                              {log.metadata.ip}
                            </span>
                          </div>
                        )}
                        {log.metadata.device && (
                          <div className="flex items-center gap-1.5 text-xs bg-bg-main px-2 py-1 rounded border border-border">
                            {log.metadata.device
                              .toLowerCase()
                              .includes("mobile") ? (
                              <Smartphone
                                size={12}
                                className="text-brand-primary"
                              />
                            ) : (
                              <Monitor
                                size={12}
                                className="text-brand-primary"
                              />
                            )}
                            <span
                              className="truncate max-w-[200px]"
                              title={log.metadata.device}
                            >
                              {log.metadata.device.includes("Mozilla")
                                ? log.metadata.device.includes("Mac")
                                  ? "Mac OS"
                                  : log.metadata.device.includes("Windows")
                                  ? "Windows"
                                  : "Web Browser"
                                : log.metadata.device}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Location Link */}
                    {log.metadata.location && (
                      <div className="flex">
                        <a
                          href={`https://www.google.com/maps?q=${log.metadata.location.lat},${log.metadata.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-brand-primary hover:underline font-medium text-xs bg-brand-primary/5 px-2 py-1 rounded border border-brand-primary/20 hover:bg-brand-primary/10 transition-colors"
                        >
                          <MapPin size={12} />
                          View Location
                        </a>
                      </div>
                    )}

                    {/* Show remaining metadata as JSON if it's not handled above and not empty context */}
                    {Object.keys(log.metadata).filter(
                      (k) => !["ip", "device", "location"].includes(k)
                    ).length > 0 && (
                      <pre className="text-[10px] bg-bg-main p-2 rounded overflow-auto mt-1 border border-border">
                        {JSON.stringify(
                          Object.fromEntries(
                            Object.entries(log.metadata).filter(
                              ([k]) => !["ip", "device", "location"].includes(k)
                            )
                          ),
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
