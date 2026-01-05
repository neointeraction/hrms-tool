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
  ArrowRight,
  Shield,
  Activity,
  AlertCircle,
  Database,
  LogIn,
  LogOut,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Select } from "../../components/common/Select";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { DatePicker } from "../../components/common/DatePicker";
import { Skeleton } from "../../components/common/Skeleton";
import { Input } from "../../components/common/Input";

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]); // Auto-fetch on filter change

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
          setLogs([]);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (error) {
          console.error("Failed to clear logs", error);
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
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      // In a real app, 'search' might be a separate param or filtered client-side if API doesn't support it
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

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <Activity size={14} />;
      case "update":
        return <FileText size={14} />;
      case "delete":
        return <Trash2 size={14} />;
      case "login":
        return <LogIn size={14} />;
      case "logout":
        return <LogOut size={14} />;
      case "approve":
        return <Shield size={14} />;
      case "reject":
        return <AlertCircle size={14} />;
      default:
        return <Database size={14} />;
    }
  };

  const getActionStyle = (action: string) => {
    const styles: Record<string, string> = {
      create: "bg-green-100 text-green-600 border-green-200",
      update: "bg-blue-100 text-blue-600 border-blue-200",
      delete: "bg-red-100 text-red-600 border-red-200",
      login: "bg-indigo-100 text-indigo-600 border-indigo-200",
      logout: "bg-gray-100 text-gray-600 border-gray-200",
      approve: "bg-emerald-100 text-emerald-600 border-emerald-200",
      reject: "bg-orange-100 text-orange-600 border-orange-200",
    };
    return (
      styles[action.toLowerCase()] ||
      "bg-gray-100 text-gray-600 border-gray-200"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Audit Trail</h1>
          <p className="text-text-secondary mt-1">
            Track and monitor system activities
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAuditLogs}
            className="px-3 py-2 bg-white border border-border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={handleClearLogs}
            disabled={isDeleting || logs.length === 0}
            className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-card p-4 rounded-xl shadow-sm border border-border space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by user, entity..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              leftIcon={<Search size={16} className="text-gray-400" />}
              className="bg-bg-main"
            />
          </div>
          <div className="w-40">
            <Select
              value={filters.action}
              onChange={(value) =>
                setFilters({ ...filters, action: value as string })
              }
              options={[
                { value: "", label: "All Actions" },
                { value: "create", label: "Create" },
                { value: "update", label: "Update" },
                { value: "delete", label: "Delete" },
                { value: "login", label: "Login" },
                { value: "approve", label: "Approve" },
              ]}
              className="bg-bg-main"
            />
          </div>
          <div className="w-40">
            <DatePicker
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              placeholder="Start Date"
            />
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="relative pl-8 space-y-6">
        {/* Continuous Timeline Line */}
        <div className="absolute left-[11px] top-6 bottom-6 w-[2px] bg-border/60" />

        {loading ? (
          // Timeline Skeleton
          [...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[29px] mt-1.5 w-6 h-6 rounded-full bg-gray-200 animate-pulse border-4 border-white dark:border-gray-900" />
              <div className="bg-bg-card border border-border p-4 rounded-xl shadow-sm">
                <div className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-text-primary">
              No logs found
            </h3>
            <p className="text-text-secondary">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogs.has(log._id);
            const hasDetails =
              (log.changes && Object.keys(log.changes).length > 0) ||
              (log.metadata &&
                Object.keys(log.metadata).some(
                  (k) => !["ip", "device", "location"].includes(k)
                ));

            return (
              <div key={log._id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[29px] mt-4 w-6 h-6 rounded-full border-4 border-bg-main flex items-center justify-center z-10 ${getActionStyle(
                    log.action
                  )}`}
                >
                  {getActionIcon(log.action)}
                </div>

                {/* Card */}
                <div
                  className={`bg-bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "ring-2 ring-brand-primary/5 ring-offset-1"
                      : ""
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => hasDetails && toggleExpand(log._id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* User Avatar / Initials */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border border-white shadow-sm">
                          {log.performedBy?.name
                            ? log.performedBy.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()
                            : "SY"}
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              <span className="font-bold">
                                {log.performedBy?.name || "System"}
                              </span>{" "}
                              <span className="text-text-secondary font-normal">
                                {log.action.toLowerCase()}d
                              </span>{" "}
                              <span className="font-semibold text-brand-primary">
                                {log.entityType}
                              </span>
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(log.createdAt)}
                              </span>
                              {log.metadata?.ip && (
                                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                                  <Globe size={10} />
                                  {log.metadata.ip}
                                </span>
                              )}
                              {log.metadata?.device && (
                                <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 truncate max-w-[150px]">
                                  <Monitor size={10} />
                                  {log.metadata.device}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {hasDetails && (
                              <button className="text-xs font-medium text-brand-primary hover:bg-brand-primary/5 px-2 py-1 rounded transition-colors flex items-center gap-1">
                                {isExpanded ? (
                                  <>
                                    Hide Details <ChevronUp size={12} />
                                  </>
                                ) : (
                                  <>
                                    View Details <ChevronDown size={12} />
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLog(log._id);
                              }}
                              className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete log"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details (Diff View) */}
                  {isExpanded && hasDetails && (
                    <div className="border-t border-border bg-gray-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
                      {/* Changes Grid */}
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Property Changes
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(log.changes).map(
                              ([field, change]: [string, any]) => {
                                if (!change || typeof change !== "object")
                                  return null;

                                return (
                                  <div
                                    key={field}
                                    className="bg-white border border-border rounded-lg overflow-hidden flex flex-col sm:flex-row text-sm"
                                  >
                                    <div className="bg-gray-50 px-3 py-2 sm:w-1/4 border-b sm:border-b-0 sm:border-r border-border flex items-center font-medium text-text-primary">
                                      {field.replace(/([A-Z])/g, " $1").trim()}
                                    </div>
                                    <div className="flex-1 grid grid-cols-2 divide-x divide-border">
                                      <div className="px-3 py-2 bg-red-50/30 text-text-secondary">
                                        <span className="text-xs font-medium text-red-500 block mb-1">
                                          Before
                                        </span>
                                        <span className="break-all font-mono text-xs">
                                          {formatValue(change.from)}
                                        </span>
                                      </div>
                                      <div className="px-3 py-2 bg-green-50/30 text-text-secondary">
                                        <span className="text-xs font-medium text-green-600 block mb-1">
                                          After
                                        </span>
                                        <span className="break-all font-mono text-xs text-text-primary font-medium">
                                          {formatValue(change.to)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/* Extra Metadata */}
                      {log.metadata &&
                        Object.keys(log.metadata).some(
                          (k) =>
                            !["ip", "device", "location", "name"].includes(k)
                        ) && (
                          <div className="mt-4">
                            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                              Additional Info
                            </h4>
                            <div className="bg-white p-3 rounded-lg border border-border text-xs font-mono text-text-secondary overflow-x-auto">
                              <pre>
                                {JSON.stringify(
                                  Object.fromEntries(
                                    Object.entries(log.metadata).filter(
                                      ([k]) =>
                                        ![
                                          "ip",
                                          "device",
                                          "location",
                                          "name",
                                        ].includes(k)
                                    )
                                  ),
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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

const formatValue = (val: any) => {
  if (val === null || val === undefined)
    return <span className="text-gray-400 italic">empty</span>;
  if (typeof val === "boolean") return val ? "Yes" : "No";
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
};
