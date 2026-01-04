import { useState, useEffect } from "react";
import {
  Plus,
  Briefcase,
  Calendar,
  Users,
  Edit,
  CheckCircle,
} from "lucide-react"; // Added Edit icon
import { Link } from "react-router-dom";
import { apiService } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/common/Skeleton";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import ProjectFormModal from "./ProjectFormModal"; // Updated Import

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  totalTasks: number;
}

const ProjectSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>

    {/* Filter Bar Skeleton */}
    <div className="flex gap-4 items-center bg-bg-card p-4 rounded-lg border border-border">
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-48 rounded-md" />
    </div>

    {/* Project Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-bg-card border border-border rounded-lg p-5 flex flex-col h-[180px]"
        >
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <div className="mt-auto pt-3 flex gap-2">
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ProjectDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null); // For update

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        apiService.getProjects(),
        apiService.getProjectStats(),
      ]);
      setProjects(data.projects || []);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEdit = (project: any, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    setEditingProject(project);
    setShowModal(true);
  };

  const isPM = user?.role === "Project Manager" || user?.role === "Admin";

  const showWidgets = ["Admin", "HR", "Project Manager"].includes(
    user?.role || ""
  );

  if (loading) {
    return <ProjectSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Project Management
          </h1>
          <p className="text-text-secondary">
            Manage and track your projects and tasks.
          </p>
        </div>
        {isPM && (
          <Button onClick={handleCreate} leftIcon={<Plus size={20} />}>
            New Project
          </Button>
        )}
      </div>

      {showWidgets && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-status-success/10 rounded-lg text-status-success">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Active</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.active}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Completed
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.completed}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Tasks
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.totalTasks}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 items-center bg-bg-card p-4 rounded-lg border border-border">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as string)}
            options={[
              { value: "All", label: "All Status" },
              { value: "Active", label: "Active" },
              { value: "Completed", label: "Completed" },
              { value: "On Hold", label: "On Hold" },
            ]}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
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
          {isPM && <Button onClick={handleCreate}>Create Project</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project._id}`}
              className="relative bg-bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow group flex flex-col min-h-[180px]"
            >
              {isPM && (
                <button
                  onClick={(e) => handleEdit(project, e)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-text-muted hover:text-brand-primary transition-colors opacity-0 group-hover:opacity-100 z-10"
                  title="Edit Project"
                >
                  <Edit size={16} />
                </button>
              )}

              <div className="flex justify-between items-start mb-3">
                <div className="pr-8">
                  <h3 className="font-semibold text-lg text-text-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                    {project.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {project.client}
                  </p>
                </div>
              </div>

              <div className="mb-2">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    project.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                {project.description}
              </p>

              <div className="flex items-center gap-4 text-xs text-text-secondary border-t border-border pt-3 mt-auto">
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
                  <span>{project.members?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1 ml-4 border-l pl-4 border-border">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 11 3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    {project.taskCount || 0} Tasks
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectFormModal
          initialData={editingProject}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadProjects();
          }}
        />
      )}
    </div>
  );
}
