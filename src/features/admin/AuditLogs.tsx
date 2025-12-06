import { useState, useEffect } from "react";
import { Filter, Download, Search, Calendar, Loader2 } from "lucide-react";
import { apiService } from "../../services/api.service";

interface AuditLog {
  _id: string;
  action: string;
  module: string;
  user: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAuditLogs();
      setLogs(response.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs, using mock data", err);
      setLogs([
        {
          _id: "1",
          action: "LOGIN",
          module: "AUTH",
          user: "admin@sys.com",
          details: "User logged in successfully",
          ipAddress: "192.168.1.1",
          timestamp: new Date().toISOString(),
        },
        {
          _id: "2",
          action: "CREATE_USER",
          module: "USERS",
          user: "admin@sys.com",
          details: "Created new user 'john.doe@company.com'",
          ipAddress: "192.168.1.1",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: "3",
          action: "UPDATE_ROLE",
          module: "ROLES",
          user: "admin@sys.com",
          details: "Updated permissions for 'HR Manager' role",
          ipAddress: "192.168.1.1",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          _id: "4",
          action: "VIEW_PAYROLL",
          module: "PAYROLL",
          user: "hr@company.com",
          details: "Viewed payroll report for May 2024",
          ipAddress: "10.0.0.5",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: "5",
          action: "LOGIN_FAILED",
          module: "AUTH",
          user: "unknown@ip",
          details: "Failed login attempt",
          ipAddress: "45.33.22.11",
          timestamp: new Date(Date.now() - 90000000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.user.toLowerCase().includes(filter.toLowerCase()) ||
      log.module.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          System Audit Logs
        </h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors text-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-bg-main p-2 rounded-lg border border-border">
        <Search className="text-text-muted" size={20} />
        <input
          type="text"
          placeholder="Search logs by action, user, or module..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-sm"
        />
        <button className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
          <Calendar size={14} />
          Date Range
        </button>
        <button className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors">
          <Filter size={14} />
          Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-main text-text-secondary text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-text-muted"
                  >
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">
                      {log.module}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {log.user}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate"
                      title={log.details}
                    >
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
