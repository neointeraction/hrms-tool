import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { Textarea } from "../../../components/common/Textarea";
import { Table } from "../../../components/common/Table";
import { DatePicker } from "../../../components/common/DatePicker";

import SubmitConfirmationModal from "./SubmitConfirmationModal";

export default function Timesheet() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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

  useEffect(() => {
    fetchEntries();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.project && projects.length > 0) {
      // Check if project is an ID (from selection) or just a name (legacy/initial)
      // For now, let's assume if it matches an ID in our list, we fetch tasks
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

  const fetchProjects = async () => {
    try {
      const data = await apiService.getProjects();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects");
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      const data = await apiService.getTasks({ projectId });
      setProjectTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks");
    }
  };

  const fetchEntries = async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const data = await apiService.getTimesheetEntries({
        startDate: startDate.toISOString().split("T")[0],
      });
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
      // Map IDs to Names for backward compatibility if needed, or backend handles it?
      // Backend expects 'project' string and 'projectId' optional.
      // We will send both if we have a match.

      const selectedProj = projects.find((p) => p._id === formData.project);
      const selectedTask = projectTasks.find((t) => t._id === formData.task);

      const payload = {
        ...formData,
        project: selectedProj ? selectedProj.name : formData.project,
        projectId: selectedProj ? selectedProj._id : undefined,
        task: selectedTask ? selectedTask.title : formData.task,
        taskId: selectedTask ? selectedTask._id : undefined,
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
    // Get current week's Sunday (or week start)
    // Assuming backend logic uses week ending or starting.
    // The modal asks for weekStartDate logic or weekEnding?
    // Let's stick to existing logic but just open modal.

    // Original logic was calculating Week Ending (Sunday?)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sunday
    // if today is Sunday (0), daysUntilSunday is 0.
    // If today is Monday (1), days until sunday is 6.
    // So this calculates Next Sunday or Today if Sunday.
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

    // Wait, typically timesheets are submitted for the *past* week or current week?
    // Let's assume standard logic: Submit *Current* week (implied by "daysUntilSunday").
    const weekEnding = new Date(today);
    weekEnding.setDate(today.getDate() + daysUntilSunday);

    // Calculate week start for display in modal
    const weekStart = new Date(weekEnding);
    weekStart.setDate(weekEnding.getDate() - 6);

    setPendingWeekStart(weekStart);
    setShowSubmitModal(true);
  };

  const confirmSubmit = async () => {
    if (!pendingWeekStart) return;

    setSubmitting(true);
    try {
      // Recalculate weekEnding from pendingWeekStart
      const weekEnding = new Date(pendingWeekStart);
      weekEnding.setDate(pendingWeekStart.getDate() + 6);

      const result = await apiService.submitTimesheets(
        weekEnding.toISOString().split("T")[0]
      );
      // alert(result.message); // Maybe show toast or success message? User just wanted modal for *confirm*.
      // Replacing alert with nothing or toast would be ideal, but for now just close modal.
      // Alerting result message is still okay for feedback, or we can rely on UI update.
      // Let's show alert for success feedback as per previous behavior, but maybe in a better way?
      // User only asked to replace *confirmation* alert.
      alert(result.message);

      fetchEntries();
      setShowSubmitModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
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
            leftIcon={<Plus size={18} />}
          >
            Add Entry
          </Button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-bg-main border border-border rounded-lg p-4 space-y-4"
        >
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
          <div className="flex gap-2">
            <Button type="submit" leftIcon={<Save size={16} />}>
              Save Entry
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Entries List */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table
          columns={[
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

      <SubmitConfirmationModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={confirmSubmit}
        weekStartDate={pendingWeekStart}
        totalHours={
          // Calculate total hours for the *current* week to display in modal?
          // The existing calculateTotalHours is for *all* entries loaded (last 30 days).
          // For the modal, it might be nice to filter, but user prompt just said generic "submit modal".
          // We can pass the total available or just 0 if complex to filter right now without loop.
          // Let's pass the 30-day total or try to sum draft?
          entries
            .filter((e) => e.status === "draft")
            .reduce((acc, curr) => acc + (curr.hours || 0), 0)
        }
      />
    </div>
  );
}
