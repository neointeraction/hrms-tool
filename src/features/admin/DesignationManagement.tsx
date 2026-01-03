import { useState, useEffect } from "react";
import {
  Badge,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Briefcase,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Select } from "../../components/common/Select";
import { Tooltip } from "../../components/common/Tooltip";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/common/Skeleton";

interface DesignationStats {
  total: number;
  active: number;
  inactive: number;
  designationCounts: Record<string, number>;
}

interface Designation {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

const DesignationSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {/* Header Skeleton */}
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

    {/* Table Skeleton */}
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function DesignationManagement() {
  const { hasPermission } = useAuth();

  const canManage = hasPermission("designations:manage");

  const [designations, setDesignations] = useState<Designation[]>([]);
  const [stats, setStats] = useState<DesignationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] =
    useState<Designation | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDesignations = async () => {
    setLoading(true);
    try {
      const [data, statsData] = await Promise.all([
        apiService.getDesignations(),
        apiService.getDesignationStats(),
      ]);
      setDesignations(data);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch designations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const handleOpenModal = (designation?: Designation) => {
    if (designation) {
      setEditingDesignation(designation);
      setFormData({
        name: designation.name,
        description: designation.description || "",
        status: designation.status,
      });
    } else {
      setEditingDesignation(null);
      setFormData({
        name: "",
        description: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setModalLoading(true);
    try {
      if (editingDesignation) {
        await apiService.updateDesignation(editingDesignation._id, formData);
      } else {
        await apiService.createDesignation(formData);
      }
      fetchDesignations();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save designation");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteDesignation(deleteId);
      setDesignations(designations.filter((d) => d._id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete designation");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <DesignationSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Designation Management
          </h1>
          <p className="text-text-secondary mt-1">
            Create and manage employee job designations
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => handleOpenModal()}
            leftIcon={<Plus size={20} />}
          >
            Add Designation
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Designations
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
            <div className="p-3 bg-text-secondary/10 rounded-lg text-text-secondary">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Inactive
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.inactive}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Assigned
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Object.values(stats.designationCounts).reduce(
                  (a, b) => a + b,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 text-status-error p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <Table<Designation>
        columns={[
          {
            header: "Designation Name",
            accessorKey: "name" as keyof Designation,
            searchKey: "name" as keyof Designation,
            render: (d: Designation) => (
              <div className="flex items-center gap-2 font-medium text-text-primary">
                <Badge size={16} className="text-brand-primary" />
                {d.name}
              </div>
            ),
          },
          {
            header: "Description",
            accessorKey: "description" as keyof Designation,
            render: (d: Designation) => (
              <span className="text-text-secondary truncate block max-w-md">
                {d.description || "-"}
              </span>
            ),
          },
          {
            header: "Employees",
            render: (d: Designation) => (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-text-secondary" />
                <span className="text-text-primary font-medium">
                  {stats?.designationCounts[d._id] || 0}
                </span>
              </div>
            ),
          },
          {
            header: "Status",
            accessorKey: "status" as keyof Designation,
            render: (d: Designation) => (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  d.status === "active"
                    ? "bg-status-success/10 text-status-success"
                    : "bg-status-error/10 text-status-error"
                }`}
              >
                {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
              </span>
            ),
          },
          {
            header: "Actions",
            className: "text-right",
            render: (d: Designation) => (
              <div className="flex items-center justify-end gap-2">
                <Tooltip content="Edit">
                  <button
                    onClick={() => handleOpenModal(d)}
                    className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </Tooltip>

                <Tooltip content="Delete">
                  <button
                    onClick={() => setDeleteId(d._id)}
                    className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </Tooltip>
              </div>
            ),
          },
        ].filter((col) => col.header !== "Actions" || canManage)}
        data={designations}
        isLoading={false} // Handled by main loading state
        emptyMessage="No designations found."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDesignation ? "Edit Designation" : "Add Designation"}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-bg-main text-text-primary"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as any })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={modalLoading}
              isLoading={modalLoading}
            >
              Save Designation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Designation"
        message="Are you sure you want to delete this designation?"
        confirmText="Delete"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
