import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Checkbox } from "../../components/common/Checkbox";

import { MODULES } from "../../constants/modules";

interface Permission {
  _id: string;
  name: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  accessibleModules: string[];
  mandatoryDocuments?: string[];
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<
    Permission[]
  >([]);
  const [availableDocTypes, setAvailableDocTypes] = useState<any[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Filter modules available to the tenant
  const tenantModules = MODULES.filter((m) => {
    // If no tenant or limits (e.g. super admin or legacy), show all
    if (
      !user?.tenantId ||
      typeof user.tenantId !== "object" ||
      !("limits" in user.tenantId)
    )
      return true;

    // TypeScript doesn't automatically narrow 'user.tenantId' to the version with limits despite the check above in all contexts
    const tenantWithLimits = user.tenantId as any;
    return (
      tenantWithLimits.limits &&
      tenantWithLimits.limits.enabledModules &&
      tenantWithLimits.limits.enabledModules.includes(m.key)
    );
  });

  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData, docTypesData] = await Promise.all([
        apiService.getRoles(),
        apiService.getPermissions(),
        apiService.getAllDocumentTypes(),
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permissionsData);
      if (docTypesData.success) {
        setAvailableDocTypes(docTypesData.data);
      }
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
      setSelectedModules(role.accessibleModules || []);
      setSelectedDocuments(role.mandatoryDocuments || []);
    } else {
      setEditingRole(null);
      setRoleName("");
      setSelectedPermissions([]);
      setSelectedModules([]);
      setSelectedDocuments([]);
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

  const handleToggleDocument = (docId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
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
        accessibleModules: selectedModules,
        mandatoryDocuments: selectedDocuments,
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
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus size={20} />}>
          Add Role
        </Button>
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
            accessorKey: "name",
            searchKey: "name",
            render: (role) => (
              <div className="flex items-center gap-2 font-medium text-text-primary">
                <Shield size={16} className="text-brand-primary" />
                {role.name}
              </div>
            ),
          },
          {
            header: "Mandatory Documents",
            render: (role) => (
              <div className="flex flex-wrap gap-1">
                {role.mandatoryDocuments &&
                role.mandatoryDocuments.length > 0 ? (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-100">
                    {role.mandatoryDocuments.length} Documents Required
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary">None</span>
                )}
              </div>
            ),
          },
          {
            header: "Permissions",
            render: (role) => (
              <div className="flex flex-wrap gap-1">
                {role.permissions.length > 0 ? (
                  role.permissions.slice(0, 3).map((p) => (
                    <span
                      key={p._id}
                      className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary text-xs rounded-full"
                    >
                      {p.name.split(":")[1] || p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-secondary">
                    No permissions
                  </span>
                )}
                {role.permissions.length > 3 && (
                  <span className="text-xs text-text-secondary">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            ),
          },
          {
            header: "Accessible Modules",
            render: (role) => (
              <div className="flex flex-wrap gap-1">
                {role.accessibleModules && role.accessibleModules.length > 0 ? (
                  role.accessibleModules.slice(0, 3).map((moduleKey) => {
                    const moduleLabel =
                      MODULES.find((m) => m.key === moduleKey)?.label ||
                      moduleKey;
                    return (
                      <span
                        key={moduleKey}
                        className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-100 dark:border-blue-800"
                      >
                        {moduleLabel}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-text-secondary">
                    No modules
                  </span>
                )}
                {role.accessibleModules &&
                  role.accessibleModules.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full border border-gray-200 dark:border-gray-700">
                      +{role.accessibleModules.length - 3} more
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
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSaveRole} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Role Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. HR Manager"
              className="bg-bg-main"
              required
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">
              Mandatory Documents Checklist
            </h3>
            <div className="border border-border rounded-lg p-4 bg-bg-main/50 max-h-48 overflow-y-auto grid grid-cols-2 gap-3">
              {availableDocTypes.length > 0 ? (
                availableDocTypes.map((doc) => (
                  <Checkbox
                    key={doc._id}
                    label={doc.name}
                    checked={selectedDocuments.includes(doc._id)}
                    onChange={() => handleToggleDocument(doc._id)}
                  />
                ))
              ) : (
                <p className="col-span-2 text-sm text-text-secondary text-center">
                  No document types available. Configure them in Settings.
                </p>
              )}
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Select documents that employees with this role MUST upload.
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-secondary">
                Accessible Modules
              </label>
              <div className="flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedModules(tenantModules.map((m) => m.key))
                  }
                  className="text-brand-primary hover:text-brand-primary/80 font-medium"
                >
                  Select All
                </button>
                <span className="text-border">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedModules([])}
                  className="text-text-secondary hover:text-text-primary"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border border-border rounded-lg p-4 bg-bg-main/50">
              {tenantModules.map((moduleObj) => (
                <Checkbox
                  key={moduleObj.key}
                  label={moduleObj.shortLabel || moduleObj.label}
                  checked={selectedModules.includes(moduleObj.key)}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      setSelectedModules([...selectedModules, moduleObj.key]);
                    } else {
                      setSelectedModules(
                        selectedModules.filter((m) => m !== moduleObj.key)
                      );
                    }
                  }}
                />
              ))}
            </div>
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
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission._id
                            )}
                            onChange={() =>
                              handleTogglePermission(permission._id)
                            }
                            label={
                              permission.name.split(":")[1] || permission.name
                            }
                          />
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
