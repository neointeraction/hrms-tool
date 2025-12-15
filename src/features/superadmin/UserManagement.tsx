import { useState, useEffect } from "react";
import { Building, Trash2, UserX, UserCheck } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { Badge } from "../../components/common/Badge";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Skeleton } from "../../components/common/Skeleton";

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
        <div className="bg-bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="min-w-full divide-y divide-border">
            {/* Header Skeleton */}
            <div className="bg-bg-secondary/50 px-6 py-3 border-b border-border flex justify-between">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-24" />
              ))}
            </div>
            {/* Rows Skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="px-6 py-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-6" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
            ))}
          </div>
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
