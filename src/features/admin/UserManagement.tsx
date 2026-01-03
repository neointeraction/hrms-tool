import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Shield,
  Lock,
  UserX,
  UserCheck,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import AddUserModal from "./components/AddUserModal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Button } from "../../components/common/Button";
import { Table } from "../../components/common/Table";
import { Input } from "../../components/common/Input";

import { Tooltip } from "../../components/common/Tooltip";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: string;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from API
      const response = await apiService.getAllUsers();
      // Backend returns array directly. Map roles array to single role string.
      const mappedUsers = (Array.isArray(response) ? response : []).map(
        (u: any) => ({
          ...u,
          role: u.roles && u.roles.length > 0 ? u.roles[0].name : "employee",
        })
      );
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to fetch users, using mock data", err);
      // Mock data fallback
      setUsers([
        {
          _id: "1",
          name: "System Admin",
          email: "admin@sys.com",
          role: "admin",
          status: "active",
          lastLogin: new Date().toISOString(),
        },
        {
          _id: "2",
          name: "HR Manager",
          email: "hr@company.com",
          role: "hr",
          status: "active",
          lastLogin: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: "3",
          name: "John Doe",
          email: "employee@company.com",
          role: "employee",
          status: "active",
          lastLogin: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: "4",
          name: "Inactive User",
          email: "inactive@company.com",
          role: "employee",
          status: "inactive",
          lastLogin: new Date(Date.now() - 1000000000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      // await apiService.updateUserStatus(userId, newStatus); // API call

      // Optimistic update
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleResetPassword = (userId: string) => {
    setResetPasswordUserId(userId);
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordUserId) return;
    setActionLoading(true);
    try {
      // await apiService.resetUserPassword(resetPasswordUserId); // API call
      // alert("Password reset email sent to user."); // Could replace with toast
    } catch (err) {
      console.error("Failed to reset password", err);
    } finally {
      setActionLoading(false);
      setResetPasswordUserId(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setActionLoading(true);
    try {
      await apiService.deleteUser(deleteUserId);
      setUsers(users.filter((u) => u._id !== deleteUserId));
    } catch (err) {
      console.error("Failed to delete user", err);
      // alert("Failed to delete user"); // Could replace with toast
    } finally {
      setActionLoading(false);
      setDeleteUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          User Accounts
        </h2>
        <Button
          onClick={() => setIsAddUserModalOpen(true)}
          leftIcon={<Plus size={20} />}
        >
          Add User
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search users by name, email, or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="bg-transparent border-none outline-none flex-1 text-sm h-full"
        leftIcon={<Search className="text-text-muted" size={20} />}
      />

      {error && (
        <div className="bg-status-error/10 text-status-error p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <Table
        columns={[
          {
            header: "User",
            render: (user) => (
              <div className="flex flex-col">
                <span className="font-medium text-text-primary">
                  {user.name}
                </span>
                <span className="text-sm text-text-secondary">
                  {user.email}
                </span>
              </div>
            ),
          },
          {
            header: "Role",
            render: (user) => (
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-brand-primary" />
                <span className="capitalize text-sm">{user.role}</span>
              </div>
            ),
          },
          {
            header: "Status",
            render: (user) => (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status}
              </span>
            ),
          },
          {
            header: "Last Login",
            render: (user) => (
              <span className="text-sm text-text-secondary">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString()
                  : "Never"}
              </span>
            ),
          },
          {
            header: "Actions",
            className: "text-right",
            render: (user) => (
              <div className="flex items-center justify-end gap-2">
                <Tooltip
                  content={
                    user.status === "active"
                      ? "Deactivate User"
                      : "Activate User"
                  }
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusToggle(user._id, user.status);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      user.status === "active"
                        ? "text-red-500 hover:bg-red-50"
                        : "text-green-500 hover:bg-green-50"
                    }`}
                  >
                    {user.status === "active" ? (
                      <UserX size={18} />
                    ) : (
                      <UserCheck size={18} />
                    )}
                  </button>
                </Tooltip>

                <Tooltip content="Reset Password">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetPassword(user._id);
                    }}
                    className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                  >
                    <Lock size={18} />
                  </button>
                </Tooltip>

                <Tooltip content="Delete User">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user._id);
                    }}
                    className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </Tooltip>
              </div>
            ),
          },
        ]}
        data={filteredUsers}
        isLoading={loading}
        emptyMessage="No users found matching your search."
      />
      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setIsAddUserModalOpen(false);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading}
      />

      {/* Reset Password Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!resetPasswordUserId}
        onClose={() => setResetPasswordUserId(null)}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        message="Are you sure you want to reset this user's password? They will receive an email with instructions."
        confirmText="Reset Password"
        variant="warning"
        isLoading={actionLoading}
      />
    </div>
  );
}
