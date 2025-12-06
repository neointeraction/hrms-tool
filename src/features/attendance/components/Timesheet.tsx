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
            <button
              onClick={handleSubmitForApproval}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Submit for Approval
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
          >
            <Plus size={18} />
            Add Entry
          </button>
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
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Project
              </label>
              {projects.length > 0 ? (
                <select
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project: e.target.value,
                      task: "",
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) =>
                    setFormData({ ...formData, project: e.target.value })
                  }
                  required
                  placeholder="Project name"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Task
              </label>
              {projectTasks.length > 0 ? (
                <select
                  value={formData.task}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                >
                  <option value="">Select Task</option>
                  {projectTasks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData.task}
                  onChange={(e) =>
                    setFormData({ ...formData, task: e.target.value })
                  }
                  required
                  placeholder="Task description"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                placeholder="Additional details..."
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              <Save size={16} />
              Save Entry
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
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
