import { useState, useEffect } from "react";
import { Filter, Loader2, Clock, User, FileText } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Select } from "../../components/common/Select";

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

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
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Audit Trail</h1>
        <p className="text-text-secondary mt-1">
          Complete history of all time-related changes
        </p>
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
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-bg-card text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-bg-card text-text-primary"
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
                  <strong>Details:</strong> {JSON.stringify(log.metadata)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
