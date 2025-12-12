import { useState, useEffect } from "react";
import { Building, Loader, Trash2, UserX, UserCheck } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllGlobalUsers({});
      // Filter out Super Admin users
      const filteredUsers = data.filter(
        (u: any) =>
          !u.isSuperAdmin && !u.roles.some((r: any) => r.name === "Super Admin")
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: any) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await apiService.updateGlobalUserStatus(user._id, newStatus);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = (user: any) => {
    setDeleteUserId(user._id);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setActionLoading(true);
    try {
      await apiService.deleteGlobalUser(deleteUserId);
      fetchUsers();
    } catch (error: any) {
      console.error("Failed to delete user", error);
      alert(error.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
      setDeleteUserId(null);
    }
  };

  const getUserStatus = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      header: "User",
      accessorKey: "name",
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-medium">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-text-primary">{user.name}</div>
            <div className="text-xs text-text-secondary">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Tenant (Company)",
      accessorKey: "tenantId",
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <Building size={14} className="text-text-muted" />
          <span className="text-sm text-text-primary">
            {user.tenantId ? user.tenantId.companyName : "N/A (Super Admin)"}
          </span>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "roles",
      render: (user: any) => (
        <div className="flex flex-wrap gap-1">
          {user.roles.map((role: any) => (
            <span
              key={role._id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
            >
              {role.name}
            </span>
          ))}
          {user.isSuperAdmin && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Super Admin
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (user: any) => (
        <Badge variant={getUserStatus(user.status)}>{user.status}</Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      render: (user: any) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStatusToggle(user)}
            className={`p-1 rounded transition-colors ${
              user.status === "active"
                ? "text-amber-600 hover:bg-amber-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={
              user.status === "active" ? "Deactivate User" : "Activate User"
            }
          >
            {user.status === "active" ? (
              <UserX size={16} />
            ) : (
              <UserCheck size={16} />
            )}
          </button>
          <button
            onClick={() => handleDeleteUser(user)}
            className="p-1 hover:bg-red-50 text-text-muted hover:text-red-600 rounded transition-colors"
            title="Delete User"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            User Management
          </h1>
          <p className="text-text-secondary mt-1">
            View and manage all users across all tenants
          </p>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table data={users} columns={columns} />
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This will also remove their employee record if it exists. This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
}
