import { useState, useEffect } from "react";
import { Badge, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Select } from "../../components/common/Select";

import { Tooltip } from "../../components/common/Tooltip";
import { useAuth } from "../../context/AuthContext";

interface Designation {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export default function DesignationManagement() {
  const { hasPermission } = useAuth();

  const canManage = hasPermission("designations:manage");

  const [designations, setDesignations] = useState<Designation[]>([]);
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
      const data = await apiService.getDesignations();
      setDesignations(data);
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
        isLoading={loading}
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
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-medium transition-colors disabled:opacity-50"
              disabled={modalLoading}
            >
              {modalLoading ? "Saving..." : "Save Designation"}
            </button>
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
