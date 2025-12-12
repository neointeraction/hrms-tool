import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import {
  Plus,
  Search,
  Building,
  Users,
  Database,
  Trash2,
  Ban,
  CheckCircle,
  Edit,
} from "lucide-react";
import CreateTenantModal from "./CreateTenantModal.tsx";
import EditTenantModal from "./EditTenantModal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";

interface Tenant {
  _id: string;
  companyName: string;
  ownerEmail: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial" | "expired";
  createdAt: string;
  stats?: {
    userCount: number;
    employeeCount: number;
    storageUsed: number;
  };
  limits: {
    maxEmployees: number;
    maxStorage: number;
  };
}

const TenantList = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deleteTenantId, setDeleteTenantId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadTenants();
  }, [filterStatus, filterPlan]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== "all") params.status = filterStatus;
      if (filterPlan !== "all") params.plan = filterPlan;
      if (searchTerm) params.search = searchTerm;

      const response = await apiService.getAllTenants(params);
      setTenants(response.tenants || []);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTenants();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      trial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      expired: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      pro: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      enterprise:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    };
    return colors[plan as keyof typeof colors] || colors.free;
  };

  const handleDelete = async () => {
    if (!deleteTenantId) return;

    setDeleteLoading(true);
    try {
      await apiService.deleteTenant(deleteTenantId);
      // Reload tenants after successful deletion
      await loadTenants();
      setDeleteTenantId(null);
    } catch (error) {
      console.error("Failed to delete tenant:", error);
      alert("Failed to delete tenant. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusToggle = async (
    tenantId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";

    try {
      await apiService.updateTenantStatus(tenantId, newStatus);
      // Reload tenants after status change
      await loadTenants();
    } catch (error) {
      console.error("Failed to update tenant status:", error);
      alert("Failed to update tenant status. Please try again.");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Tenant Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage all companies and their subscriptions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Create Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="col-span-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by company name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="expired">Expired</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Tenants Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading tenants...
          </p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No tenants found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <div
              key={tenant._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Tenant Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                    {tenant.companyName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {tenant.ownerEmail}
                  </p>
                </div>
              </div>

              {/* Status & Plan Badges */}
              <div className="flex gap-2 mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    tenant.status
                  )}`}
                >
                  {tenant.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(
                    tenant.plan
                  )}`}
                >
                  {tenant.plan.toUpperCase()}
                </span>
              </div>

              {/* Stats */}
              {tenant.stats && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users size={16} />
                      Employees
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tenant.stats.employeeCount}/{tenant.limits.maxEmployees}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Database size={16} />
                      Storage
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tenant.stats.storageUsed.toFixed(1)}/
                      {tenant.limits.maxStorage} MB
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Created {new Date(tenant.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTenant(tenant);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm"
                    title="Edit Tenant"
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  {/* Suspend/Activate Button */}
                  {tenant.status === "active" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(tenant._id, tenant.status);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 rounded-lg transition-colors text-sm"
                      title="Suspend Tenant"
                    >
                      <Ban size={16} />
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusToggle(tenant._id, tenant.status);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 rounded-lg transition-colors text-sm"
                      title="Activate Tenant"
                    >
                      <CheckCircle size={16} />
                      Activate
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTenantId(tenant._id);
                    }}
                    className="px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Delete Tenant"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal
          onClose={() => setShowCreateModal(false)}
          onCreate={loadTenants}
        />
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <EditTenantModal
          tenant={editingTenant}
          onClose={() => setEditingTenant(null)}
          onUpdate={loadTenants}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTenantId !== null}
        onClose={() => setDeleteTenantId(null)}
        onConfirm={handleDelete}
        title="Delete Tenant"
        message={`Are you sure you want to delete this tenant? This will permanently delete all data including employees, projects, and records. This action cannot be undone.`}
        confirmText="Delete Tenant"
        variant="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default TenantList;
