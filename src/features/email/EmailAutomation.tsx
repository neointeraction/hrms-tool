import { useState, useEffect } from "react";
import { Loader2, PlayCircle, Save } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Badge } from "../../components/common/Badge";
import { Table, type Column } from "../../components/common/Table";
import RichTextEditor from "../../components/common/RichTextEditor";
import { Checkbox } from "../../components/common/Checkbox";
import { Input } from "../../components/common/Input";

export default function EmailAutomation() {
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<{
    birthday: boolean;
    anniversary: boolean;
    timesheet: boolean;
  }>({
    birthday: false,
    anniversary: false,
    timesheet: false,
  });

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
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updateEmailSettings(settings);
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
      setActiveTab("logs");
    } catch (error: any) {
      console.error("Failed to trigger automation", error);
      setError(error.message || "Failed to trigger automation");
    } finally {
      setLoading(false);
    }
  };

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

  const toggleCollapse = (
    section: "birthday" | "anniversary" | "timesheet"
  ) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const EmailCard = ({
    icon,
    title,
    description,
    enabled,
    onToggle,
    children,
    section,
  }: {
    icon: { bgColor: string; svg: React.ReactNode };
    title: string;
    description: string;
    enabled: boolean;
    onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: React.ReactNode;
    section: "birthday" | "anniversary" | "timesheet";
  }) => (
    <div className="bg-bg-secondary/50 border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-start gap-3 flex-1 cursor-pointer"
            onClick={() => toggleCollapse(section)}
          >
            <div className={`p-2 ${icon.bgColor} rounded-lg`}>{icon.svg}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-text-primary">
                  {title}
                </h3>
                <svg
                  className={`w-5 h-5 text-text-secondary transition-transform ${
                    collapsed[section] ? "-rotate-90" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={enabled}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>
        {!collapsed[section] && enabled && (
          <div className="grid gap-4 mt-4 pt-4 border-t border-border">
            {children}
          </div>
        )}
      </div>
    </div>
  );

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
              Configure automated birthday, work anniversary, and timesheet
              reminder email notifications
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
            <div className="space-y-6">
              {/* Birthday Card */}
              <EmailCard
                icon={{
                  bgColor: "bg-purple-500/10",
                  svg: (
                    <svg
                      className="w-5 h-5 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z"
                      />
                    </svg>
                  ),
                }}
                title="Birthday Emails"
                description="Automatically send birthday wishes to employees"
                enabled={settings.birthday?.enabled || false}
                onToggle={(e: any) =>
                  updateSetting("birthday.enabled", e.target.checked)
                }
                section="birthday"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    value={settings.birthday.subject}
                    onChange={(e) =>
                      updateSetting("birthday.subject", e.target.value)
                    }
                    className="bg-bg-input"
                    placeholder="Happy Birthday, {{employee_name}}! 🎉"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Body
                  </label>
                  <RichTextEditor
                    value={settings.birthday.body}
                    onChange={(value) => updateSetting("birthday.body", value)}
                    placeholder="Enter birthday email template..."
                  />
                </div>
              </EmailCard>

              {/* Anniversary Card */}
              <EmailCard
                icon={{
                  bgColor: "bg-blue-500/10",
                  svg: (
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  ),
                }}
                title="Work Anniversary Emails"
                description="Celebrate employee milestones and tenure"
                enabled={settings.anniversary?.enabled || false}
                onToggle={(e: any) =>
                  updateSetting("anniversary.enabled", e.target.checked)
                }
                section="anniversary"
              >
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    value={settings.anniversary.subject}
                    onChange={(e) =>
                      updateSetting("anniversary.subject", e.target.value)
                    }
                    className="bg-bg-input"
                    placeholder="Happy Work Anniversary, {{employee_name}}!"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Body
                  </label>
                  <RichTextEditor
                    value={settings.anniversary.body}
                    onChange={(value) =>
                      updateSetting("anniversary.body", value)
                    }
                    placeholder="Enter anniversary email template..."
                  />
                </div>
              </EmailCard>

              {/* Timesheet Reminder Card */}
              <EmailCard
                icon={{
                  bgColor: "bg-orange-500/10",
                  svg: (
                    <svg
                      className="w-5 h-5 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                }}
                title="Weekly Timesheet Reminders"
                description="Remind employees to update their timesheets weekly"
                enabled={settings.timesheetReminder?.enabled || false}
                onToggle={(e: any) =>
                  updateSetting("timesheetReminder.enabled", e.target.checked)
                }
                section="timesheet"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Day of Week
                    </label>
                    <select
                      value={settings.timesheetReminder.dayOfWeek ?? 5}
                      onChange={(e) =>
                        updateSetting(
                          "timesheetReminder.dayOfWeek",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={settings.timesheetReminder.time || "09:00"}
                      onChange={(e) =>
                        updateSetting("timesheetReminder.time", e.target.value)
                      }
                      className="bg-bg-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Subject
                  </label>
                  <Input
                    type="text"
                    value={
                      settings.timesheetReminder.subject ||
                      "Reminder: Update Your Timesheet"
                    }
                    onChange={(e) =>
                      updateSetting("timesheetReminder.subject", e.target.value)
                    }
                    className="bg-bg-input"
                    placeholder="Reminder: Update Your Timesheet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email Body
                  </label>
                  <RichTextEditor
                    value={
                      settings.timesheetReminder.body ||
                      "Dear {{employee_name}},\n\nThis is a friendly reminder to update your timesheet for the current week.\n\nPlease log your hours at your earliest convenience.\n\nBest regards,\n{{company_name}}"
                    }
                    onChange={(value) =>
                      updateSetting("timesheetReminder.body", value)
                    }
                    placeholder="Enter timesheet reminder email template..."
                  />
                </div>
              </EmailCard>

              {/* General Settings */}
              <div className="bg-gradient-to-br from-brand-primary/5 to-brand-primary/10 border border-brand-primary/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-brand-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  General Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3">
                      Schedule
                    </h4>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-text-secondary whitespace-nowrap">
                        Send daily at:
                      </label>
                      <Input
                        type="time"
                        value={settings.schedule?.time || "09:00"}
                        onChange={(e) =>
                          updateSetting("schedule.time", e.target.value)
                        }
                        className="px-3 py-2 bg-bg-input"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      Time for birthday and anniversary emails
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3">
                      Notifications
                    </h4>
                    <div className="space-y-3">
                      <Checkbox
                        checked={settings.notification?.ccManager || false}
                        onChange={(e) =>
                          updateSetting(
                            "notification.ccManager",
                            e.target.checked
                          )
                        }
                        label="CC Employee's Manager"
                      />
                      <Checkbox
                        checked={settings.notification?.notifyHR || false}
                        onChange={(e) =>
                          updateSetting(
                            "notification.notifyHR",
                            e.target.checked
                          )
                        }
                        label="Notify HR upon sending"
                      />
                      <Checkbox
                        checked={
                          settings.notification?.notifyAllEmployees || false
                        }
                        onChange={(e) =>
                          updateSetting(
                            "notification.notifyAllEmployees",
                            e.target.checked
                          )
                        }
                        label="Send celebration email to all employees"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={handleRunNow}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <PlayCircle size={18} />
                  Run Now
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white hover:bg-brand-primary-dark rounded-lg transition-colors disabled:opacity-50"
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
