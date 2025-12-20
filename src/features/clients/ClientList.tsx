import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Table } from "../../components/common/Table";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import ClientFormModal from "./ClientFormModal";

import { Tooltip } from "../../components/common/Tooltip";

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await apiService.getClients();
      setClients(data);
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
      // Clean up modal state first to avoid blink/race
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
        <Button onClick={handleCreate} leftIcon={<Plus size={20} />}>
          Add Client
        </Button>
      </div>

      {/* Search */}

      <Table
        isLoading={loading}
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
