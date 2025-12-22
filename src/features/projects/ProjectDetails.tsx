import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MessageSquare,
  CheckSquare,
  Trash2,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import TaskBoard from "./TaskBoard";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "../../components/common/Loader";
import { Button } from "../../components/common/Button";
import { Textarea } from "../../components/common/Textarea";
import { Avatar } from "../../components/common/Avatar";
import CreateTaskModal from "./CreateTaskModal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      setSubmittingComment(true);
      const data = await apiService.addProjectComment(project._id, commentText);
      setProject(data.project);
      setCommentText(""); // Clear input
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setSubmittingComment(false);
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

  // Check if Tasks module is enabled
  const tenantLimits =
    user?.tenantId &&
    typeof user.tenantId === "object" &&
    "limits" in user.tenantId
      ? (user.tenantId as any).limits
      : null;

  const isTasksEnabled =
    !tenantLimits || // Default to true if no limits found (legacy/dev)
    !tenantLimits.enabledModules ||
    tenantLimits.enabledModules.includes("tasks");

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/projects")}
        className="flex items-center gap-1 text-sm text-text-secondary hover:text-brand-primary"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
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
                    : "bg-bg-subtle text-text-muted border-border"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-text-secondary text-lg">{project.client}</p>
          </div>
          {isPM && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Project
              </Button>
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              await apiService.deleteProject(project._id);
              navigate("/projects");
            } catch (error) {
              console.error("Delete failed", error);
              // Ideally show a toast here, simple alert for fallback if Toast context not ready
              alert("Failed to delete project");
            }
          }}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />

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
          {(user?.role === "Admin" ||
            user?.role === "HR" ||
            user?.role === "Project Manager") && (
            <div>
              <span className="text-xs text-text-secondary uppercase font-semibold flex items-center gap-1 mb-1">
                <DollarSign size={14} /> Budget
              </span>
              <span className="text-sm font-medium">
                {project.budget ? `₹${project.budget.toLocaleString()}` : "N/A"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="bg-bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <MessageSquare size={20} /> Discussion
        </h2>

        {/* Add Comment Input */}
        <div className="flex gap-4 mb-8">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            alt={user?.name}
            size="md"
          />
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="w-full resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handlePostComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className="space-y-6">
          {project.comments && project.comments.length > 0 ? (
            [...project.comments]
              .reverse()
              .map((comment: any, index: number) => (
                <div key={index} className="flex gap-4 group">
                  <Avatar
                    src={comment.createdBy?.avatar}
                    name={comment.createdBy?.name || "Unknown"} // Handle populated user
                    alt={comment.createdBy?.name}
                    size="md"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {comment.createdBy?.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-text-primary whitespace-pre-wrap bg-bg-subtle p-3 rounded-lg rounded-tl-none border border-border">
                      {/* Render links as clickable if they start with http or www */}
                      {comment.content
                        .split(/((?:https?:\/\/|www\.)[^\s]+)/g)
                        .map((part: string, i: number) => {
                          const isUrl = part.match(/^(https?:\/\/|www\.)/);
                          return isUrl ? (
                            <a
                              key={i}
                              href={
                                part.startsWith("www.")
                                  ? `https://${part}`
                                  : part
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary hover:underline"
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-text-secondary text-sm italic py-4 text-center">
              No comments yet. Start the discussion!
            </p>
          )}
        </div>
      </div>

      {/* Task Board - Only show if Tasks module is enabled */}
      {/* Task Board - Only show if Tasks module is enabled AND user has permission */}
      {isTasksEnabled &&
        user &&
        (user.role === "Admin" ||
          user.permissions?.includes("projects:task_view") ||
          user.permissions?.some(
            (p: any) => p.name === "projects:task_view"
          )) && (
          <div className="bg-bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <CheckSquare size={20} /> Tasks
              </h2>
              {(user.role === "Admin" ||
                user.permissions?.includes("projects:task_create") ||
                user.permissions?.some(
                  (p: any) => p.name === "projects:task_create"
                )) && (
                <Button size="sm" onClick={() => setShowTaskModal(true)}>
                  <div className="flex items-center gap-1">
                    <span>+</span> Add Task
                  </div>
                </Button>
              )}
            </div>
            <TaskBoard projectId={project._id} />
          </div>
        )}

      {showTaskModal && (
        <CreateTaskModal
          projectId={project._id}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
