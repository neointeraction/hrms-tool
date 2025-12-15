import { useState, useEffect } from "react";
import { Plus, Edit2, Eye, Trash2, Lock, UserX, UserCheck } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../services/api.service";
import { Table } from "../../components/common/Table";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Button } from "../../components/common/Button";
import AddEditEmployee from "./AddEditEmployee";

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState(false);

  // User management states
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch tenant-scoped employees (already includes user data via populate)
      const employeeData = await apiService.getEmployees();

      // Employees from /api/employees are already tenant-scoped and include user data
      setEmployees(Array.isArray(employeeData) ? employeeData : []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
    setViewMode(false);
    fetchEmployees(); // Refresh list after close
  };

  // User management handlers
  const handleStatusToggle = async (employee: any) => {
    try {
      const userId = employee.user?._id || employee.user;
      if (!userId) {
        alert("User ID not found");
        return;
      }
      const currentStatus = employee.user?.status || "active";
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      await apiService.updateUserStatus(userId, newStatus);
      fetchEmployees(); // Refresh to get updated data
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleResetPassword = (employee: any) => {
    const userId = employee.user?._id || employee.user;
    if (!userId) {
      alert("User ID not found");
      return;
    }
    setResetPasswordUserId(userId);
  };

  const confirmResetPassword = async () => {
    if (!resetPasswordUserId) return;
    setActionLoading(true);
    try {
      await apiService.resetUserPassword(resetPasswordUserId);
      alert("Password reset successfully. Default password sent to user.");
    } catch (err: any) {
      alert(err.message || "Failed to reset password");
    } finally {
      setActionLoading(false);
      setResetPasswordUserId(null);
    }
  };

  const handleDeleteUser = (employee: any) => {
    const userId = employee.user?._id || employee.user;
    if (!userId) {
      alert("User ID not found");
      return;
    }
    setDeleteUserId(userId);
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserId) return;
    setActionLoading(true);
    try {
      await apiService.deleteUser(deleteUserId);
      fetchEmployees(); // Refresh list
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(false);
      setDeleteUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Employee Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage detailed employee records
          </p>
        </div>
        <Button onClick={handleAddEmployee} leftIcon={<Plus size={20} />}>
          Add Employee
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table
          columns={[
            {
              header: "Employee",
              accessorKey: "firstName", // Enable sorting by name
              render: (emp) => (
                <div className="flex items-center gap-3">
                  {emp.profilePicture ? (
                    <img
                      src={
                        emp.profilePicture.startsWith("http")
                          ? emp.profilePicture
                          : `${ASSET_BASE_URL}/${emp.profilePicture}`
                      }
                      alt={`${emp.firstName} ${emp.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-medium">
                      {emp.firstName?.[0] || "?"}
                      {emp.lastName?.[0] || ""}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-text-primary">
                      {emp.firstName} {emp.lastName}
                      {emp.isPlaceholder && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                          No Details
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {emp.employeeId}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              header: "Role & Dept",
              accessorKey: "role", // Enable sorting by role
              render: (emp) => (
                <div>
                  <div className="text-sm text-text-primary">{emp.role}</div>
                  <div className="text-xs text-text-secondary">
                    {emp.department}
                  </div>
                </div>
              ),
            },
            {
              header: "Status",
              accessorKey: "user.status",
              enableSorting: true,
              render: (emp) => {
                const userStatus = emp.user?.status || "active";
                return (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      userStatus === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {userStatus === "active" ? "Active" : "Inactive"}
                  </span>
                );
              },
            },
            {
              header: "Contact",
              render: (emp) => (
                <div className="text-sm text-text-secondary">
                  <div>{emp.email}</div>
                  <div>{emp.workPhone}</div>
                </div>
              ),
            },
            {
              header: "Actions",
              className: "text-right",
              render: (emp) => {
                const userStatus = emp.user?.status || "active";
                return (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleViewEmployee(emp)}
                      className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditEmployee(emp)}
                      className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                      title="Edit Employee"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleStatusToggle(emp)}
                      className={`p-2 rounded-lg transition-colors ${
                        userStatus === "active"
                          ? "text-amber-600 hover:bg-amber-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={
                        userStatus === "active"
                          ? "Deactivate User"
                          : "Activate User"
                      }
                    >
                      {userStatus === "active" ? (
                        <UserX size={16} />
                      ) : (
                        <UserCheck size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleResetPassword(emp)}
                      className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Reset Password"
                    >
                      <Lock size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(emp)}
                      className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              },
            },
          ]}
          data={employees}
          isLoading={loading}
          emptyMessage="No employees found."
        />
      </div>

      {isModalOpen && (
        <AddEditEmployee
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          employee={selectedEmployee}
          viewMode={viewMode}
        />
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteUserId !== null}
        onClose={() => setDeleteUserId(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading}
      />

      <ConfirmationModal
        isOpen={resetPasswordUserId !== null}
        onClose={() => setResetPasswordUserId(null)}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        message="Are you sure you want to reset this user's password? A default password will be sent to them."
        confirmText="Reset Password"
        isLoading={actionLoading}
      />
    </div>
  );
}
