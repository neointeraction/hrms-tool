import { useState, useEffect } from "react";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { apiService } from "../../services/api.service";

interface ClientFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export default function ClientFormModal({
  onClose,
  onSuccess,
  initialData,
}: ClientFormModalProps) {
  const isEditMode = !!initialData;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        status: initialData.status || "Active",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditMode) {
        await apiService.updateClient(initialData._id, formData);
      } else {
        await apiService.createClient(formData);
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? "Edit Client" : "Add New Client"}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Client"
              : "Create Client"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Client Name *"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email Address *"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
        {isEditMode && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all pr-8"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        )}
      </form>
    </Modal>
  );
}
