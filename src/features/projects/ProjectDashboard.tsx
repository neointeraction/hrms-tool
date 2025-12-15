import { useState, useEffect } from "react";
import { Plus, Briefcase, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/common/Skeleton";
import { Button } from "../../components/common/Button";
import CreateProjectModal from "./CreateProjectModal";

export default function ProjectDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProjects();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const isPM = user?.role === "Project Manager" || user?.role === "Admin";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary">
            Manage and track your projects and tasks.
          </p>
        </div>
        {isPM && (
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus size={20} />}
          >
            New Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded-lg p-5 flex flex-col h-[180px]"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <Skeleton className="h-6 w-16 rounded ml-4" />
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="flex items-center gap-4 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-bg-card border border-border rounded-lg">
          <Briefcase
            size={48}
            className="mx-auto mb-4 text-text-muted opacity-50"
          />
          <h3 className="text-lg font-medium text-text-primary">
            No Projects Found
          </h3>
          <p className="text-text-secondary mb-4">
            Get started by creating a new project.
          </p>
          {isPM && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="bg-bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow group"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {project.client}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    project.status === "Active"
                      ? "bg-status-success/10 text-status-success"
                      : "bg-text-muted/10 text-text-muted"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 mb-4 h-10">
                {project.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-secondary border-t border-border pt-3">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "No deadline"}
                  </span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <Users size={14} />
                  <span>{project.members?.length || 0} Members</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
