import React, { useState, useEffect } from "react";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Select } from "../../../components/common/Select";

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export const DocumentTypeModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: DocumentTypeModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Employment",
    description: "",
    isRequired: false,
    expiryRequired: false,
    maxFileSize: 5, // MB
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = [
    { value: "Employment", label: "Employment" },
    { value: "Identity", label: "Identity" },
    { value: "Legal", label: "Legal" },
    { value: "Education", label: "Education" },
    { value: "Other", label: "Other" },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        description: initialData.description || "",
        isRequired: initialData.isRequired,
        expiryRequired: initialData.expiryRequired,
        maxFileSize: initialData.maxFileSize
          ? initialData.maxFileSize / (1024 * 1024)
          : 5,
      });
    } else {
      setFormData({
        name: "",
        category: "Employment",
        description: "",
        isRequired: false,
        expiryRequired: false,
        maxFileSize: 5,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCategoryChange = (value: string | number) => {
    setFormData((prev) => ({ ...prev, category: value as string }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        maxFileSize: Number(formData.maxFileSize) * 1024 * 1024, // Convert MB to bytes
      };

      if (initialData) {
        await apiService.updateDocumentType(initialData._id, payload);
      } else {
        await apiService.createDocumentType(payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save document type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Document Type" : "Add Document Type"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-status-error/10 border border-status-error/20 rounded-lg text-status-error text-sm">
            {error}
          </div>
        )}

        <Input
          label="Document Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g. Offer Letter"
        />

        <div>
          <Select
            label="Category"
            options={categoryOptions}
            value={formData.category}
            onChange={handleCategoryChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-bg-card border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none resize-none"
            placeholder="Briefly describe this document purpose..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Max File Size (MB)"
            name="maxFileSize"
            type="number"
            value={formData.maxFileSize}
            onChange={handleChange}
            min="1"
            max="50"
            required
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleChange}
              className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
            />
            <div>
              <span className="block text-sm font-medium text-text-primary">
                Mark as Mandatory
              </span>
              <span className="block text-xs text-text-secondary">
                Employees must upload this document
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-hover transition-colors">
            <input
              type="checkbox"
              name="expiryRequired"
              checked={formData.expiryRequired}
              onChange={handleChange}
              className="w-4 h-4 text-brand-primary rounded border-gray-300 focus:ring-brand-primary"
            />
            <div>
              <span className="block text-sm font-medium text-text-primary">
                Requires Expiry Date
              </span>
              <span className="block text-xs text-text-secondary">
                User must select expiration date when uploading
              </span>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            className="text-text-secondary hover:bg-bg-hover"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {loading ? "Saving..." : "Save Document Type"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
