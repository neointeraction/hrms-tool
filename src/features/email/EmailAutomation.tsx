import { useState, useEffect } from "react";
import { Loader2, PlayCircle, Save } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Badge } from "../../components/common/Badge";
import { Table, type Column } from "../../components/common/Table";
import RichTextEditor from "../../components/common/RichTextEditor";

export default function EmailAutomation() {
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "settings") fetchSettings();
    if (activeTab === "logs") fetchLogs();
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEmailSettings();
      setSettings(data);
    } catch (error: any) {
      console.error("Failed to fetch settings", error);
      setError(error.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getEmailAuditLogs();
      setLogs(data);
    } catch (error: any) {
      console.error("Failed to fetch logs", error);
      // Optional: setError(error.message) for logs too?
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updateEmailSettings(settings);
      // maybe show toast
    } catch (error: any) {
      console.error("Failed to save settings", error);
      setError(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleRunNow = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.triggerEmailAutomation();
      // show success toast or refetch logs
      setActiveTab("logs");
    } catch (error: any) {
      console.error("Failed to trigger automation", error);
      setError(error.message || "Failed to trigger automation");
    } finally {
      setLoading(false);
    }
  };

  // Helper to deep update state provided a path like 'birthday.enabled'
  const updateSetting = (path: string, value: any) => {
    setSettings((prev: any) => {
      const parts = path.split(".");
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newSettings;
    });
  };

  const logColumns: Column<any>[] = [
    {
      header: "Recipient",
      accessorKey: "recipient.name",
      render: (row) => row.recipient.name,
    },
    {
      header: "Type",
      accessorKey: "type",
      render: (row) => <Badge variant="primary">{row.type}</Badge>,
    },
    { header: "Subject", accessorKey: "subject" },
    {
      header: "Date",
      accessorKey: "sentAt",
      render: (row) => new Date(row.sentAt).toLocaleString(),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) => (
        <Badge variant={row.status === "Success" ? "success" : "error"}>
          {row.status}
        </Badge>
      ),
    },
    { header: "Trigger", accessorKey: "triggeredBy" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors -ml-2"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Email Automation
            </h1>
            <p className="text-text-secondary">
              Configure automated birthday and work anniversary email
              notifications
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Header Tabs */}
        <div className="flex border-b border-border">
          {/* ... tabs ... */}
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "settings"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "logs"
                ? "border-b-2 border-brand-primary text-brand-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Audit Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              Error: {error}
              <button
                onClick={fetchSettings}
                className="ml-4 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === "settings" && !settings && !loading && !error && (
            <div className="text-center py-12 text-text-secondary">
              <p>No settings data found.</p>
              <button
                onClick={fetchSettings}
                className="mt-2 text-brand-primary underline"
              >
                Retry
              </button>
            </div>
          )}

          {activeTab === "settings" && settings && (
            <div className="space-y-8">
              {/* Birthday Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Birthday Emails
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.birthday?.enabled || false}
                      onChange={(e) =>
                        updateSetting("birthday.enabled", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                {settings.birthday?.enabled && (
                  <div className="grid gap-4 pl-4 border-l-2 border-border">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={settings.birthday.subject}
                        onChange={(e) =>
                          updateSetting("birthday.subject", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Body (HTML Editor)
                      </label>
                      <RichTextEditor
                        value={settings.birthday.body}
                        onChange={(value) =>
                          updateSetting("birthday.body", value)
                        }
                        placeholder="Enter birthday email template..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Anniversary Section */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text-primary">
                    Work Anniversary Emails
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.anniversary?.enabled || false}
                      onChange={(e) =>
                        updateSetting("anniversary.enabled", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                {settings.anniversary?.enabled && (
                  <div className="grid gap-4 pl-4 border-l-2 border-border">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={settings.anniversary.subject}
                        onChange={(e) =>
                          updateSetting("anniversary.subject", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1">
                        Body (HTML Editor)
                      </label>
                      <RichTextEditor
                        value={settings.anniversary.body}
                        onChange={(value) =>
                          updateSetting("anniversary.body", value)
                        }
                        placeholder="Enter anniversary email template..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* General Settings */}
              <div className="space-y-4 pt-4 border-t border-border md:flex gap-8">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    Schedule
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-text-secondary">
                      Send daily at:
                    </label>
                    <input
                      type="time"
                      value={settings.schedule?.time || "09:00"}
                      onChange={(e) =>
                        updateSetting("schedule.time", e.target.value)
                      }
                      className="px-2 py-1 bg-bg-input border border-border rounded"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    Notifications
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={settings.notification?.ccManager || false}
                        onChange={(e) =>
                          updateSetting(
                            "notification.ccManager",
                            e.target.checked
                          )
                        }
                      />
                      CC Employee's Manager
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={settings.notification?.notifyHR || false}
                        onChange={(e) =>
                          updateSetting(
                            "notification.notifyHR",
                            e.target.checked
                          )
                        }
                      />
                      Notify HR upon sending
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={
                          settings.notification?.notifyAllEmployees || false
                        }
                        onChange={(e) =>
                          updateSetting(
                            "notification.notifyAllEmployees",
                            e.target.checked
                          )
                        }
                      />
                      Send celebration email to all employees
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                  onClick={handleRunNow}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors"
                >
                  <PlayCircle size={18} />
                  Run Now
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-dark rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div>
              <Table
                data={logs}
                columns={logColumns}
                isLoading={loading}
                emptyMessage="No emails sent yet."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
