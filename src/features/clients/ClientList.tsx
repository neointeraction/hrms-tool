import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Briefcase,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Table } from "../../components/common/Table";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import ClientFormModal from "./ClientFormModal";
import { useAuth } from "../../context/AuthContext";
import { Tooltip } from "../../components/common/Tooltip";
import { Skeleton } from "../../components/common/Skeleton";

const ClientSkeleton = () => (
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

interface ClientStats {
  total: number;
  active: number;
  inactive: number;
  totalProjects: number;
}

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    // Check if permission exists as a string OR as an object with name
    const permissions = user?.permissions || [];
    return (
      user?.role === "Admin" ||
      permissions.some(
        (p: any) =>
          (typeof p === "string" && p === permission) ||
          (typeof p === "object" && p.name === permission)
      )
    );
  };

  const canCreate = hasPermission("clients:create");
  const canEdit = hasPermission("clients:edit");
  const canDelete = hasPermission("clients:delete");

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        apiService.getClients(),
        apiService.getClientStats(),
      ]);
      setClients(data);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setClientToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await apiService.deleteClient(clientToDelete);
      setShowDeleteModal(false);
      setClientToDelete(null);
      loadClients();
    } catch (err) {
      console.error("Failed to delete client", err);
      alert("Failed to delete client");
    }
  };

  const handleEdit = (client: any) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  if (loading) {
    return <ClientSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Client Management
          </h1>
          <p className="text-text-secondary">
            Manage your client database and details.
          </p>
        </div>
        {canCreate && (
          <Button onClick={handleCreate} leftIcon={<Plus size={20} />}>
            Add Client
          </Button>
        )}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Clients
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
            <div className="p-3 bg-status-error/10 rounded-lg text-status-error">
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
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Projects
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.totalProjects}
              </p>
            </div>
          </div>
        </div>
      )}

      <Table
        isLoading={false} // Handled by skeletal loader
        data={clients}
        columns={[
          {
            header: "Client Name",
            accessorKey: "name",
            render: (client: any) => (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text-primary">
                    {client.name}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Contact Info",
            accessorKey: "email",
            render: (client: any) => (
              <div>
                <div className="text-sm text-text-primary">{client.email}</div>
                {client.phone && (
                  <div className="text-xs text-text-secondary">
                    {client.phone}
                  </div>
                )}
              </div>
            ),
          },
          {
            header: "Status",
            accessorKey: "status",
            render: (client: any) => (
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  client.status === "Active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {client.status}
              </span>
            ),
          },
          {
            header: "Actions",
            className: "text-right",
            render: (client: any) => (
              <div className="flex justify-end gap-2">
                {canEdit && (
                  <Tooltip content="Edit">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(client);
                      }}
                      className="text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </Tooltip>
                )}

                {canDelete && (
                  <Tooltip content="Delete">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client._id);
                      }}
                      className="text-text-secondary hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </Tooltip>
                )}
              </div>
            ),
          },
        ]}
        emptyMessage="No clients found. Get started by creating a new client."
      />

      {showModal && (
        <ClientFormModal
          initialData={editingClient}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadClients();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClientToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
