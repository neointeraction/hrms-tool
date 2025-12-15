import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronLeft } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Skeleton } from "../../../components/common/Skeleton";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { Checkbox } from "../../../components/common/Checkbox";

interface CustomField {
  name: string;
  fieldType: "text" | "number" | "date" | "dropdown" | "boolean";
  required: boolean;
  options?: string[];
}

interface AssetCategory {
  _id: string;
  name: string;
  description: string;
  customFields: CustomField[];
  isActive: boolean;
  createdAt: string;
}

export default function AssetCategories() {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(
    null
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customFields: [] as CustomField[],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAssetCategories(true);
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiService.updateAssetCategory(editingCategory._id, formData);
      } else {
        await apiService.createAssetCategory(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (category: AssetCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      customFields: category.customFields || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAssetCategory(id);
      setDeleteConfirmId(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", customFields: [] });
    setEditingCategory(null);
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...formData.customFields,
        { name: "", fieldType: "text", required: false, options: [] },
      ],
    });
  };

  const updateCustomField = (index: number, field: Partial<CustomField>) => {
    const newFields = [...formData.customFields];
    newFields[index] = { ...newFields[index], ...field };
    setFormData({ ...formData, customFields: newFields });
  };

  const removeCustomField = (index: number) => {
    setFormData({
      ...formData,
      customFields: formData.customFields.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-bg-secondary rounded-lg transition-colors -ml-2"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Asset Categories
            </h1>
            <p className="text-text-secondary">
              Configure asset types and their custom fields
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={20} />}
        >
          Add Category
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  {[
                    "Name",
                    "Description",
                    "Custom Fields",
                    "Status",
                    "Actions",
                  ].map((header, i) => (
                    <th
                      key={i}
                      className={`px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider ${
                        header === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-5 w-5 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            No asset categories found. Click "Add Category" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Custom Fields
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-text-primary">
                        {category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {category.description || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-text-secondary">
                        {category.customFields?.length || 0} field(s)
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive
                            ? "bg-status-success/10 text-status-success"
                            : "bg-status-muted/10 text-status-muted"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-brand-primary hover:text-brand-secondary mr-4"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(category._id)}
                        className="text-status-error hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Name *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-bg-input"
              placeholder="e.g., Laptop, Monitor, Keyboard"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              rows={3}
              placeholder="Optional description"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Custom Fields
              </label>
              <button
                type="button"
                onClick={addCustomField}
                className="text-sm text-brand-primary hover:underline"
              >
                + Add Field
              </button>
            </div>

            {formData.customFields.map((field, index) => (
              <div
                key={index}
                className="p-3 bg-bg-secondary rounded-lg mb-2 space-y-2"
              >
                <div className="flex gap-2 items-start">
                  <Input
                    placeholder="Field name"
                    value={field.name}
                    onChange={(e) =>
                      updateCustomField(index, { name: e.target.value })
                    }
                    className="flex-1 bg-bg-input"
                  />
                  <div className="w-1/3">
                    <Select
                      value={field.fieldType}
                      onChange={(value) =>
                        updateCustomField(index, {
                          fieldType: value as CustomField["fieldType"],
                        })
                      }
                      options={[
                        { value: "text", label: "Text" },
                        { value: "number", label: "Number" },
                        { value: "date", label: "Date" },
                        { value: "dropdown", label: "Dropdown" },
                        { value: "boolean", label: "Yes/No" },
                      ]}
                      className="bg-bg-input"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="p-2 text-status-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mt-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    checked={field.required}
                    onChange={(e) =>
                      updateCustomField(index, { required: e.target.checked })
                    }
                    label="Required field"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Category"
      >
        <p className="text-text-secondary mb-4">
          Are you sure you want to delete this category? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
