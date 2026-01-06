import { useState, useEffect } from "react";
import * as XLSX from "xlsx-js-style";
import {
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  StopCircle,
  Clock,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { Textarea } from "../../../components/common/Textarea";
import { Table } from "../../../components/common/Table";
import { DatePicker } from "../../../components/common/DatePicker";
import { ConfirmationModal } from "../../../components/common/ConfirmationModal";
import { Modal } from "../../../components/common/Modal";
import { Skeleton } from "../../../components/common/Skeleton";

import SubmitConfirmationModal from "./SubmitConfirmationModal";

export default function Timesheet() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    project: "",
    task: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [pendingWeekStart, setPendingWeekStart] = useState<Date | undefined>(
    undefined
  );

  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeFormData, setMergeFormData] = useState({
    project: "",
    task: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  // Timer State
  const [activeTimer, setActiveTimer] = useState<any>(null);
  const [timerDuration, setTimerDuration] = useState<string>("00:00:00");
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInFormData, setClockInFormData] = useState({
    project: "",
    task: "",
    description: "",
  });

  // Filter State
  const [filters, setFilters] = useState({
    client: "",
    project: "",
    entryType: "",
  });

  useEffect(() => {
    fetchEntries();
    fetchProjects();
    fetchActiveTimer();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any;
    if (activeTimer) {
      interval = setInterval(() => {
        const start = new Date(activeTimer.clockIn).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimerDuration(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setTimerDuration("00:00:00");
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchActiveTimer = async () => {
    try {
      const data = await apiService.getActiveTimesheetTimer();
      if (data && data.activeTimer) {
        setActiveTimer(data.activeTimer);
      } else {
        setActiveTimer(null);
      }
    } catch (error) {
      console.error("Failed to fetch active timer");
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects");
    }
  };

  useEffect(() => {
    if (formData.project && projects.length > 0) {
      const selectedProj = projects.find(
        (p) => p._id === formData.project || p.name === formData.project
      );
      if (selectedProj) {
        fetchTasks(selectedProj._id);
      } else {
        setProjectTasks([]);
      }
    } else {
      setProjectTasks([]);
    }
  }, [formData.project, projects]);

  useEffect(() => {
    if (clockInFormData.project && projects.length > 0) {
      const selectedProj = projects.find(
        (p) =>
          p._id === clockInFormData.project ||
          p.name === clockInFormData.project
      );
      if (selectedProj) {
        fetchTasks(selectedProj._id);
      }
    }
  }, [clockInFormData.project, projects]);

  const fetchTasks = async (projectId: string) => {
    try {
      const data = await apiService.getTasks({ projectId });
      setProjectTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  const handleClockIn = async () => {
    try {
      if (!clockInFormData.project || !clockInFormData.task) {
        alert("Please select a project and task");
        return;
      }

      setSubmitting(true);
      const selectedProj = projects.find(
        (p) => p._id === clockInFormData.project
      );
      const selectedTask = projectTasks.find(
        (t) => t._id === clockInFormData.task
      );

      await apiService.startTimesheetTimer({
        ...clockInFormData,
        project: selectedProj ? selectedProj.name : clockInFormData.project,
        projectId: selectedProj ? selectedProj._id : undefined,
        task: selectedTask ? selectedTask.title : clockInFormData.task,
        taskId: selectedTask ? selectedTask._id : undefined,
      });

      setShowClockInModal(false);
      setClockInFormData({ project: "", task: "", description: "" });
      fetchActiveTimer();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!confirm("Stop the timer?")) return;
    try {
      setSubmitting(true);
      await apiService.stopTimesheetTimer();
      setActiveTimer(null);
      fetchEntries();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchEntries = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const queryParams: any = {
        startDate: startDate.toISOString().split("T")[0],
      };

      if (filters.client) queryParams.client = filters.client;
      if (filters.project) queryParams.projectId = filters.project;
      if (filters.entryType) queryParams.entryType = filters.entryType;

      const data = await apiService.getTimesheetEntries(queryParams);
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedProj = projects.find((p) => p._id === formData.project);
      const selectedTask = projectTasks.find((t) => t._id === formData.task);

      const payload = {
        ...formData,
        project: selectedProj ? selectedProj.name : formData.project,
        projectId: selectedProj ? selectedProj._id : undefined,
        task: selectedTask ? selectedTask.title : formData.task,
        taskId: selectedTask ? selectedTask._id : undefined,
        entryType: "manual",
      };

      await apiService.createTimesheetEntry(payload);
      setShowAddForm(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        project: "",
        task: "",
        startTime: "",
        endTime: "",
        description: "",
      });
      fetchEntries();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timesheet entry?")) return;
    try {
      await apiService.deleteTimesheetEntry(id);
      fetchEntries();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSubmitForApproval = async () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const weekEnding = new Date(today);
    weekEnding.setDate(today.getDate() + daysUntilSunday);

    const weekStart = new Date(weekEnding);
    weekStart.setDate(weekEnding.getDate() - 6);

    setPendingWeekStart(weekStart);
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!pendingWeekStart) return;

    setSubmitting(true);
    try {
      const weekEnding = new Date(pendingWeekStart);
      weekEnding.setDate(pendingWeekStart.getDate() + 6);

      const result = await apiService.submitTimesheets(
        weekEnding.toISOString().split("T")[0]
      );

      setSuccessMessage(result.message);
      setShowSuccessModal(true);

      fetchEntries();
      setShowSubmitModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (entries.length === 0) {
      alert("No entries to export");
      return;
    }

    const exportData = entries.map((entry) => {
      const proj = projects.find((p) => p.name === entry.project);
      return {
        Date: new Date(entry.date).toLocaleDateString(),
        Type: entry.entryType === "timer" ? "Timer" : "Manual",
        Client: proj?.client || "",
        Project: entry.project,
        Task: entry.task,
        Description: entry.description || "",
        "Start Time": entry.startTime,
        "End Time": entry.endTime,
        Hours: entry.hours,
        Status: entry.status,
        "Review Comments": entry.reviewComments || "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wscols = Object.keys(exportData[0]).map((key) => {
      const maxLen = Math.max(
        key.toString().length,
        ...exportData.map((row) =>
          row[key as keyof typeof row]
            ? row[key as keyof typeof row].toString().length
            : 0
        )
      );
      return { wch: maxLen + 5 };
    });
    ws["!cols"] = wscols;

    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = {
        fill: {
          fgColor: { rgb: "4F46E5" },
        },
        font: {
          color: { rgb: "FFFFFF" },
          bold: true,
        },
        alignment: {
          horizontal: "center",
        },
      };
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timesheet");

    XLSX.writeFile(
      wb,
      `timesheet_export_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            <AlertCircle size={12} />
            Draft
          </span>
        );
      case "submitted":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
            <Send size={12} />
            Submitted
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
            <XCircle size={12} />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const calculateTotalHours = () => {
    return entries
      .reduce((sum, entry) => sum + (entry.hours || 0), 0)
      .toFixed(2);
  };

  const hasDraftEntries = entries.some((e) => e.status === "draft");

  // Clear selection on entry fetch
  useEffect(() => {
    setSelectedEntries([]);
  }, [entries]);

  const handleSelectRow = (id: string) => {
    setSelectedEntries((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (
      selectedEntries.length ===
      entries.filter((e) => e.status === "draft").length
    ) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(
        entries.filter((e) => e.status === "draft").map((e) => e._id)
      );
    }
  };

  const handleMergeClick = () => {
    if (selectedEntries.length < 2) return;

    // Pre-fill merge form with data from first selected entry
    const firstEntry = entries.find((e) => e._id === selectedEntries[0]);
    if (firstEntry) {
      // Find earliest start time and latest end time logic could go here
      // For now, default to first entry's times
      setMergeFormData({
        project: firstEntry.project || "",
        task: firstEntry.task || "",
        description: selectedEntries
          .map((id) => entries.find((e) => e._id === id)?.description)
          .filter(Boolean)
          .join(" + "),
        startTime: firstEntry.startTime,
        endTime: firstEntry.endTime,
      });
    }
    setShowMergeModal(true);
  };

  const confirmMerge = async () => {
    try {
      setSubmitting(true);
      const selectedProj = projects.find(
        (p) =>
          p._id === mergeFormData.project || p.name === mergeFormData.project
      );
      const selectedTask = projectTasks.find(
        (t) => t._id === mergeFormData.task || t.title === mergeFormData.task
      );

      const payload = {
        entryIds: selectedEntries,
        ...mergeFormData,
        project: selectedProj ? selectedProj.name : mergeFormData.project,
        projectId: selectedProj ? selectedProj._id : undefined,
        task: selectedTask ? selectedTask.title : mergeFormData.task,
        taskId: selectedTask ? selectedTask._id : undefined,
      };

      await apiService.mergeTimesheetEntries(payload);
      setShowMergeModal(false);
      fetchEntries(); // Will clear selection via useEffect
      setSuccessMessage("Entries merged successfully");
      setShowSuccessModal(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ... existing functions ...

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Timer Banner */}
      {activeTimer && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600">
              <Clock size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900">
                Active Timer: {activeTimer.project} - {activeTimer.task}
              </h4>
              <p className="text-2xl font-mono font-bold text-blue-700">
                {timerDuration}
              </p>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={handleClockOut}
            leftIcon={<StopCircle size={18} />}
          >
            Stop Timer
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            Timesheet Entries
          </h3>
          <p className="text-sm text-text-secondary">
            Track time spent on projects and tasks
          </p>
        </div>
        <div className="flex gap-2">
          {selectedEntries.length >= 2 && (
            <Button
              variant="secondary"
              onClick={handleMergeClick}
              className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200"
            >
              Merge Selected ({selectedEntries.length})
            </Button>
          )}
          {entries.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleExport}
              leftIcon={<Download size={18} />}
            >
              Export Excel
            </Button>
          )}
          {hasDraftEntries && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSubmitForApproval}
              disabled={submitting}
              isLoading={submitting}
              leftIcon={!submitting && <Send size={18} />}
            >
              Submit for Approval
            </Button>
          )}
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            leftIcon={<Plus size={20} />}
          >
            Add Entry
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-border">
        <div>
          <Select
            label="Client"
            value={filters.client}
            onChange={(val) =>
              setFilters({ ...filters, client: val as string })
            }
            options={Array.from(
              new Set(projects.map((p) => p.client).filter(Boolean))
            ).map((client) => ({ value: client, label: client }))}
            placeholder="All Clients"
          />
        </div>
        <div>
          <Select
            label="Project"
            value={filters.project}
            onChange={(val) =>
              setFilters({ ...filters, project: val as string })
            }
            options={projects.map((p) => ({ value: p._id, label: p.name }))}
            placeholder="All Projects"
          />
        </div>
        <div>
          <Select
            label="Entry Type"
            value={filters.entryType}
            onChange={(val) =>
              setFilters({ ...filters, entryType: val as string })
            }
            options={[
              { value: "manual", label: "Manual Entry" },
              { value: "timer", label: "Timer" },
            ]}
            placeholder="All Types"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button variant="secondary" onClick={fetchEntries} className="flex-1">
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="px-3"
            onClick={() => {
              setFilters({ client: "", project: "", entryType: "" });
              // We need to trigger fetch with valid empty filters, but setFilters is async.
              // So we call fetchEntries manually with empty params or rely on useEffect if we added one (we didn't).
              // Let's create a specialized clear function or just call setFilters then fetchEntries with empty params.
              // Best way:
              setFilters({ client: "", project: "", entryType: "" });
              // Trigger a fetch with empty params (ignoring the async state update for this immediate call)
              const startDate = new Date();
              startDate.setDate(startDate.getDate() - 30);
              apiService
                .getTimesheetEntries({
                  startDate: startDate.toISOString().split("T")[0],
                })
                .then((data) => setEntries(data.entries || []));
            }}
            title="Clear Filters"
          >
            <XCircle size={18} />
          </Button>
        </div>
      </div>

      {/* ... Add Form ... (unchanged) */}
      {/* Add Entry Modal */}
      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add Timesheet Entry"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-entry-form"
              leftIcon={<Save size={16} />}
            >
              Save Entry
            </Button>
          </div>
        }
      >
        <form id="add-entry-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div>
              {projects.length > 0 ? (
                <Select
                  label="Project"
                  value={formData.project}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      project: value as string,
                      task: "",
                    })
                  }
                  required
                  options={projects.map((p) => ({
                    value: p._id,
                    label: p.name,
                  }))}
                  placeholder="Select Project"
                />
              ) : (
                <Input
                  label="Project"
                  type="text"
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  required
                  placeholder="Project name"
                />
              )}
            </div>
            <div>
              {projectTasks.length > 0 ? (
                <Select
                  label="Task"
                  value={formData.task}
                  onChange={(value) =>
                    setFormData({ ...formData, task: value as string })
                  }
                  required
                  options={projectTasks.map((t) => ({
                    value: t._id,
                    label: t.title,
                  }))}
                  placeholder="Select Task"
                />
              ) : (
                <Input
                  label="Task"
                  type="text"
                  value={formData.task}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  required
                  placeholder="Task description"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Input
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="col-span-2">
              <Textarea
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                placeholder="Additional details..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Entries List */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table
          columns={[
            {
              header: (
                <div className="h-full flex items-center justify-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      entries.filter((e) => e.status === "draft").length > 0 &&
                      selectedEntries.length ===
                        entries.filter((e) => e.status === "draft").length
                    }
                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                </div>
              ),
              render: (entry) =>
                entry.status === "draft" ? (
                  <input
                    type="checkbox"
                    checked={selectedEntries.includes(entry._id)}
                    onChange={() => handleSelectRow(entry._id)}
                    className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                ) : null,
              className: "w-10 text-center",
            },
            {
              header: "Type",
              render: (entry: any) =>
                entry.entryType === "timer" ? (
                  <div
                    className="flex items-center gap-1 text-blue-600"
                    title="Timer Entry"
                  >
                    <Clock size={16} />
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Manual</span>
                ),
              className: "w-10 text-center",
            },
            {
              header: "Date",
              accessorKey: "date",
              render: (entry) => (
                <span className="text-sm">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              ),
            },
            {
              header: "Client",
              render: (entry: any) => {
                // Try to find client from project if available or entry might have client info?
                // Currently backend doesn't populate client on Timesheet entry explicitly,
                // but we can look it up from projects list if loaded
                const proj = projects.find((p) => p.name === entry.project);
                return (
                  <span className="text-sm text-gray-600">
                    {proj?.client || "-"}
                  </span>
                );
              },
            },
            {
              header: "Project",
              accessorKey: "project",
              render: (entry) => (
                <span className="font-medium">{entry.project}</span>
              ),
            },
            {
              header: "Task",
              accessorKey: "task",
              render: (entry) => (
                <div className="flex flex-col">
                  <span>{entry.task}</span>
                  {entry.description && (
                    <span className="text-xs text-text-muted truncate max-w-xs">
                      {entry.description}
                    </span>
                  )}
                  {entry.reviewComments && (
                    <span className="text-xs text-yellow-700 mt-1">
                      Review: {entry.reviewComments}
                    </span>
                  )}
                </div>
              ),
            },
            {
              header: "Time",
              render: (entry) => (
                <span className="text-sm">
                  {entry.startTime} - {entry.endTime}
                </span>
              ),
            },
            {
              header: "Hours",
              accessorKey: "hours",
              render: (entry) => (
                <span className="font-medium text-brand-primary">
                  {entry.hours}h
                </span>
              ),
            },
            {
              header: "Status",
              accessorKey: "status",
              render: (entry) => getStatusBadge(entry.status),
            },
            {
              header: "Actions",
              render: (entry) => {
                if (entry.status === "draft" || entry.status === "rejected") {
                  return (
                    <button
                      onClick={() => handleDelete(entry._id)}
                      className="text-text-muted hover:text-red-500 transition-colors p-1"
                      title="Delete Entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  );
                }
                return null;
              },
            },
          ]}
          data={entries}
          isLoading={loading}
          emptyMessage="No timesheet entries found"
        />
      </div>

      {/* ... Total Hours ... */}
      {entries.length > 0 && (
        <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 flex justify-between items-center">
          <span className="font-semibold text-text-primary">
            Total Hours (Last 30 Days)
          </span>
          <span className="text-2xl font-bold text-brand-primary">
            {calculateTotalHours()}h
          </span>
        </div>
      )}

      {/* Clock In Modal */}
      <Modal
        isOpen={showClockInModal}
        onClose={() => setShowClockInModal(false)}
        title="Start Timer"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowClockInModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClockIn}
              isLoading={submitting}
              leftIcon={<Clock size={16} />}
            >
              Start
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Select
              label="Project"
              value={clockInFormData.project}
              onChange={(val) =>
                setClockInFormData({
                  ...clockInFormData,
                  project: val as string,
                  task: "",
                })
              }
              required
              options={projects.map((p) => ({
                value: p._id,
                label: p.name,
              }))}
              placeholder="Select Project"
            />
          </div>
          <div>
            <Select
              label="Task"
              value={clockInFormData.task}
              onChange={(val) =>
                setClockInFormData({ ...clockInFormData, task: val as string })
              }
              required
              options={projectTasks.map((t) => ({
                value: t._id,
                label: t.title,
              }))}
              placeholder="Select Task"
            />
          </div>
          <div>
            <Textarea
              label="Description (Optional)"
              value={clockInFormData.description}
              onChange={(e) =>
                setClockInFormData({
                  ...clockInFormData,
                  description: e.target.value,
                })
              }
              rows={2}
              placeholder="What are you working on?"
            />
          </div>
        </div>
      </Modal>

      {/* ... SubmitConfirmationModal ... */}
      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={confirmSubmit}
        weekStartDate={pendingWeekStart}
        totalHours={entries
          .filter((e) => e.status === "draft")
          .reduce((acc, curr) => acc + (curr.hours || 0), 0)}
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        confirmText="OK"
        variant="success"
        showCancel={false}
      />

      {/* Merge Modal */}
      {/* Merge Modal */}
      <Modal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        title="Merge Entries"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowMergeModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmMerge} isLoading={submitting}>
              Confirm Merge
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Combine selected entries into a single entry. This will delete the
            original entries.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Project"
                value={mergeFormData.project}
                onChange={(val) =>
                  setMergeFormData({
                    ...mergeFormData,
                    project: val as string,
                  })
                }
                options={projects.map((p) => ({
                  value: p._id,
                  label: p.name,
                }))}
              />
            </div>
            <div>
              <Select
                label="Task"
                value={mergeFormData.task}
                onChange={(val) =>
                  setMergeFormData({ ...mergeFormData, task: val as string })
                }
                options={projectTasks.map((t) => ({
                  value: t._id,
                  label: t.title,
                }))}
              />
            </div>
            <div>
              <Input
                label="Start Time"
                type="time"
                value={mergeFormData.startTime}
                onChange={(e) =>
                  setMergeFormData({
                    ...mergeFormData,
                    startTime: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Input
                label="End Time"
                type="time"
                value={mergeFormData.endTime}
                onChange={(e) =>
                  setMergeFormData({
                    ...mergeFormData,
                    endTime: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Description"
                value={mergeFormData.description}
                onChange={(e) =>
                  setMergeFormData({
                    ...mergeFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
