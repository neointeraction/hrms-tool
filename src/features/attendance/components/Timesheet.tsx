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

export default function Timesheet() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
    // Get current week's Sunday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    const weekEnding = new Date(today);
    weekEnding.setDate(today.getDate() + daysUntilSunday);

    if (
      !confirm(
        `Submit all draft timesheets for the week ending ${weekEnding.toLocaleDateString()} for approval?`
      )
    )
      return;

    setSubmitting(true);
    try {
      const result = await apiService.submitTimesheets(
        weekEnding.toISOString().split("T")[0]
      );
      alert(result.message);
      fetchEntries();
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

  const groupByWeek = () => {
    const weeks = new Map<string, any[]>();
    entries.forEach((entry) => {
      const weekEnd = new Date(entry.weekEnding).toLocaleDateString();
      if (!weeks.has(weekEnd)) {
        weeks.set(weekEnd, []);
      }
      weeks.get(weekEnd)!.push(entry);
    });
    return weeks;
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

  const weeklyEntries = groupByWeek();

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
              <Input
                label="Date"
                type="date"
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
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project: e.target.value,
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
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
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

      {/* Entries List by Week */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <p>No timesheet entries yet</p>
          <p className="text-sm mt-1">Add your first entry to get started</p>
        </div>
      ) : (
        <>
          {Array.from(weeklyEntries.entries()).map(([weekEnd, weekEntries]) => {
            const weekTotal = weekEntries
              .reduce((sum, e) => sum + (e.hours || 0), 0)
              .toFixed(2);
            const allSameStatus = weekEntries.every(
              (e) => e.status === weekEntries[0].status
            );

            return (
              <div
                key={weekEnd}
                className="border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <div>
                    <h4 className="font-semibold text-text-primary">
                      Week Ending: {weekEnd}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {weekTotal}h total
                    </p>
                  </div>
                  {allSameStatus && getStatusBadge(weekEntries[0].status)}
                </div>

                {weekEntries.map((entry) => (
                  <div
                    key={entry._id}
                    className="bg-bg-main border border-border rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-text-primary">
                            {entry.project}
                          </span>
                          <span className="text-sm text-text-secondary">•</span>
                          <span className="text-sm text-text-secondary">
                            {entry.task}
                          </span>
                          {getStatusBadge(entry.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>
                            {new Date(entry.date).toLocaleDateString()}
                          </span>
                          <span>
                            {entry.startTime} - {entry.endTime}
                          </span>
                          <span className="font-medium text-brand-primary">
                            {entry.hours}h
                          </span>
                        </div>
                        {entry.description && (
                          <p className="text-sm text-text-secondary mt-2">
                            {entry.description}
                          </p>
                        )}
                        {entry.reviewComments && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                            <p className="font-medium text-yellow-900">
                              Manager feedback:
                            </p>
                            <p className="text-yellow-800">
                              {entry.reviewComments}
                            </p>
                          </div>
                        )}
                      </div>
                      {(entry.status === "draft" ||
                        entry.status === "rejected") && (
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Total Hours */}
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 flex justify-between items-center">
            <span className="font-semibold text-text-primary">
              Total Hours (Last 30 Days)
            </span>
            <span className="text-2xl font-bold text-brand-primary">
              {calculateTotalHours()}h
            </span>
          </div>
        </>
      )}
    </div>
  );
}
