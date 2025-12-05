import { useState, useEffect } from "react";
import { Shield, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Modal } from "../../components/common/Modal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

interface Permission {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        apiService.getRoles(),
        apiService.getPermissions(),
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permissionsData);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      setSelectedPermissions(role.permissions.map((p) => p._id));
    } else {
      setEditingRole(null);
      setRoleName("");
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setModalLoading(true);
    try {
      const payload = {
        name: roleName,
        permissions: selectedPermissions,
      };

      if (editingRole) {
        await apiService.updateRole(editingRole._id, payload);
      } else {
        await apiService.createRole(payload);
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save role");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteRole(deleteRoleId);
      setRoles(roles.filter((r) => r._id !== deleteRoleId));
      setDeleteRoleId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete role");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Role Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage system roles and permissions
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
        >
          <Plus size={20} />
          Add Role
        </button>
      </div>

      {error && (
        <div className="bg-status-error/10 text-status-error p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <Table
        columns={[
          {
            header: "Role Name",
            render: (role) => (
              <div className="flex items-center gap-2 font-medium text-text-primary">
                <Shield size={16} className="text-brand-primary" />
                {role.name}
              </div>
            ),
          },
          {
            header: "Permissions",
            render: (role) => (
              <div className="flex flex-wrap gap-1">
                {role.permissions.length > 0 ? (
                  role.permissions.map((p) => (
                    <span
                      key={p._id}
                      className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded-full"
                    >
                      {p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-secondary">
                    No permissions
                  </span>
                )}
              </div>
            ),
          },
          {
            header: "Actions",
            className: "text-right",
            render: (role) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenModal(role)}
                  className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  title="Edit Role"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setDeleteRoleId(role._id)}
                  className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Role"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ),
          },
        ]}
        data={roles}
        isLoading={loading}
        emptyMessage="No roles found."
      />

      {/* Add/Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? "Edit Role" : "Add New Role"}
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
              placeholder="e.g. HR Manager"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Permissions
            </label>
            <div className="space-y-4 max-h-96 overflow-y-auto border border-border rounded-lg p-4">
              {availablePermissions.length > 0 ? (
                Object.entries(
                  availablePermissions.reduce((acc, p) => {
                    const [module] = p.name.split(":");
                    const key = module || "Other";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(p);
                    return acc;
                  }, {} as Record<string, Permission[]>)
                ).map(([module, perms]) => (
                  <div key={module} className="space-y-2">
                    <h3 className="text-sm font-semibold text-text-primary capitalize border-b border-border pb-1">
                      {module.replace("_", " ")}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((permission) => (
                        <label
                          key={permission._id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              permission._id
                            )}
                            onChange={() =>
                              handleTogglePermission(permission._id)
                            }
                            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                          />
                          <span className="text-sm text-text-secondary">
                            {permission.name.split(":")[1] || permission.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-2">
                  No permissions available.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-gray-50 font-medium transition-colors"
              disabled={modalLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-medium transition-colors disabled:opacity-50"
              disabled={modalLoading}
            >
              {modalLoading ? "Saving..." : "Save Role"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteRoleId}
        onClose={() => setDeleteRoleId(null)}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
}
