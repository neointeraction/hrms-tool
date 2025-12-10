import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Users, DollarSign, Plus } from "lucide-react";
import { apiService } from "../../services/api.service";
import TaskBoard from "./TaskBoard";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/common/Loader";
import CreateTaskModal from "./CreateTaskModal";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (id) loadProject(id);
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await apiService.getProjectById(projectId);
      setProject(data.project);
    } catch (err) {
      console.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader size={32} />
      </div>
    );
  if (!project) return <div>Project not found</div>;

  const isPM = user?.role === "Project Manager" || user?.role === "Admin";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-brand-primary"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">
                {project.name}
              </h1>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold border ${
                  project.status === "Active"
                    ? "bg-status-success/10 text-status-success border-status-success/20"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-text-secondary text-lg">{project.client}</p>
          </div>

          {isPM && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
            >
              <Plus size={18} /> Add Task
            </button>
          )}
        </div>

        <p className="text-text-primary mb-6 max-w-3xl">
          {project.description}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-border">
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold flex items-center gap-1 mb-1">
              <Calendar size={14} /> Start Date
            </span>
            <span className="text-sm font-medium">
              {project.startDate
                ? new Date(project.startDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold flex items-center gap-1 mb-1">
              <Calendar size={14} /> Deadline
            </span>
            <span className="text-sm font-medium">
              {project.endDate
                ? new Date(project.endDate).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold flex items-center gap-1 mb-1">
              <Users size={14} /> Manager
            </span>
            <span className="text-sm font-medium text-brand-primary">
              {project.manager?.name || "Unassigned"}
            </span>
          </div>
          <div>
            <span className="text-xs text-text-secondary uppercase font-semibold flex items-center gap-1 mb-1">
              <DollarSign size={14} /> Budget
            </span>
            <span className="text-sm font-medium">
              {project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Task Board */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4">Tasks</h2>
        <TaskBoard projectId={project._id} />
      </div>

      {showTaskModal && (
        <CreateTaskModal
          projectId={project._id}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            // Refresh logic: The TaskBoard should refresh itself, typically via a context or ref logic,
            // but simplified here we might just reload or pass a trigger.
            // For MVP: force reload window or use a key prop on TaskBoard to force re-mount
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
