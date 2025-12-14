import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  Download,
  UserPlus,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Loader } from "../../../components/common/Loader";
import { Badge } from "../../../components/common/Badge";

interface Asset {
  _id: string;
  assetCode: string;
  name: string;
  categoryId: { _id: string; name: string };
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  condition: string;
  status: string;
  purchasePrice?: number;
  currentValue?: number;
  invoice?: string;
}

export default function AssetInventory() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  // const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Disposal state
  const [disposeModalId, setDisposeModalId] = useState<string | null>(null);
  const [disposalReason, setDisposalReason] = useState("");
  const [disposalNotes, setDisposalNotes] = useState("");

  // Assignment state
  const [assignModalAsset, setAssignModalAsset] = useState<Asset | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    employeeId: "",
    expectedReturnDate: "",
    notes: "",
  });

  // Filters
  const [filters, setFilters] = useState({
    categoryId: "",
    status: "",
    search: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    manufacturer: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    vendor: "",
    warrantyExpiry: "",
    condition: "New",
    purchasePrice: "",
    currentValue: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([fetchAssets(), fetchCategories(), fetchEmployees()]);
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiService.getAssetCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.categoryId) params.categoryId = filters.categoryId;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const data = await apiService.getAssets(params);
      setAssets(data.assets || data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        purchasePrice: formData.purchasePrice
          ? parseFloat(formData.purchasePrice)
          : undefined,
        currentValue: formData.currentValue
          ? parseFloat(formData.currentValue)
          : undefined,
      };

      if (editingAsset) {
        await apiService.updateAsset(editingAsset._id, payload);
      } else {
        await apiService.createAsset(payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      categoryId: asset.categoryId._id,
      name: asset.name,
      manufacturer: asset.manufacturer || "",
      model: asset.model || "",
      serialNumber: asset.serialNumber || "",
      purchaseDate: "",
      vendor: "",
      warrantyExpiry: "",
      condition: asset.condition,
      purchasePrice: asset.purchasePrice?.toString() || "",
      currentValue: asset.currentValue?.toString() || "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  /*
  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteAsset(id);
      setDeleteConfirmId(null);
      fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };
  */

  const handleDispose = async () => {
    if (!disposeModalId) return;

    try {
      await apiService.disposeAsset(disposeModalId, {
        disposalReason,
        disposalNotes,
        disposalDate: new Date().toISOString(),
      });

      setDisposeModalId(null);
      setDisposalReason("");
      setDisposalNotes("");
      fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignAsset = async () => {
    if (!assignModalAsset || !assignmentData.employeeId) return;

    try {
      await apiService.assignAsset({
        assetId: assignModalAsset._id,
        employeeId: assignmentData.employeeId,
        expectedReturnDate: assignmentData.expectedReturnDate || undefined,
        conditionAtIssue: assignModalAsset.condition,
        notes: assignmentData.notes,
      });

      setAssignModalAsset(null);
      setAssignmentData({ employeeId: "", expectedReturnDate: "", notes: "" });
      fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      categoryId: "",
      name: "",
      manufacturer: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      vendor: "",
      warrantyExpiry: "",
      condition: "New",
      purchasePrice: "",
      currentValue: "",
      notes: "",
    });
    setEditingAsset(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Issued":
        return "info";
      case "Under Repair":
        return "warning";
      case "Lost":
      case "Disposed":
        return "error";
      default:
        return "default";
    }
  };

  const exportToCSV = () => {
    if (assets.length === 0) return;

    // CSV headers
    const headers = [
      "Asset Code",
      "Name",
      "Category",
      "Manufacturer",
      "Model",
      "Serial Number",
      "Status",
      "Condition",
      "Purchase Price",
      "Current Value",
    ];

    // Convert assets to CSV rows
    const rows = assets.map((asset) => [
      asset.assetCode,
      asset.name,
      asset.categoryId?.name || "N/A",
      asset.manufacturer || "-",
      asset.model || "-",
      asset.serialNumber || "-",
      asset.status,
      asset.condition,
      asset.purchasePrice || "0",
      asset.currentValue || "0",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `asset-inventory-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              Asset Inventory
            </h1>
            <p className="text-text-secondary">
              Manage and track all company assets
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={exportToCSV}
            leftIcon={<Download size={18} />}
            disabled={assets.length === 0}
          >
            Export CSV
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            leftIcon={<Plus size={20} />}
          >
            Add Asset
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-bg-card p-4 rounded-xl border border-border flex gap-4">
        <input
          type="text"
          placeholder="Search by name, code, or serial number..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 px-3 py-2 bg-bg-input border border-border rounded-lg text-sm"
        />
        <select
          value={filters.categoryId}
          onChange={(e) =>
            setFilters({ ...filters, categoryId: e.target.value })
          }
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 bg-bg-input border border-border rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Issued">Issued</option>
          <option value="Under Repair">Under Repair</option>
          <option value="Lost">Lost</option>
          <option value="Disposed">Disposed</option>
        </select>
      </div>

      {/* Assets List */}
      <div className="bg-bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <Package className="mx-auto mb-4 text-text-muted" size={48} />
            <p>No assets found. Click "Add Asset" to register one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Asset Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Serial Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset) => (
                  <tr
                    key={asset._id}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-brand-primary">
                        {asset.assetCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-text-primary">
                        {asset.name}
                      </span>
                      {asset.manufacturer && (
                        <p className="text-xs text-text-secondary">
                          {asset.manufacturer}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary">
                        {asset.categoryId?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary font-mono">
                        {asset.serialNumber || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(asset.status) as any}>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-text-secondary">
                        {asset.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {asset.status === "Available" && (
                        <button
                          onClick={() => setAssignModalAsset(asset)}
                          className="text-green-600 hover:text-green-700 mr-4"
                          title="Assign to Employee"
                        >
                          <UserPlus size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(asset)}
                        className="text-brand-primary hover:text-brand-secondary mr-4"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      {asset.status !== "Disposed" && (
                        <button
                          onClick={() => setDisposeModalId(asset._id)}
                          className="text-amber-600 hover:text-amber-700 mr-4"
                          title="Dispose Asset"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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
        title={editingAsset ? "Edit Asset" : "Add New Asset"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Category *
              </label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Used">Used</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Purchase Price
              </label>
              <input
                type="number"
                value={formData.purchasePrice}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Current Value
              </label>
              <input
                type="number"
                value={formData.currentValue}
                onChange={(e) =>
                  setFormData({ ...formData, currentValue: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {editingAsset ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={assignModalAsset !== null}
        onClose={() => {
          setAssignModalAsset(null);
          setAssignmentData({
            employeeId: "",
            expectedReturnDate: "",
            notes: "",
          });
        }}
        title="Assign Asset to Employee"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Asset: {assignModalAsset?.name} ({assignModalAsset?.assetCode})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Assign to Employee *
            </label>
            <select
              value={assignmentData.employeeId}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  employeeId: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              required
            >
              <option value="">Select an employee</option>
              {employees.map((emp: any) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.employeeId || emp.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Expected Return Date (Optional)
            </label>
            <input
              type="date"
              value={assignmentData.expectedReturnDate}
              onChange={(e) =>
                setAssignmentData({
                  ...assignmentData,
                  expectedReturnDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={assignmentData.notes}
              onChange={(e) =>
                setAssignmentData({ ...assignmentData, notes: e.target.value })
              }
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              rows={3}
              placeholder="Enter any assignment notes or special instructions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setAssignModalAsset(null);
                setAssignmentData({
                  employeeId: "",
                  expectedReturnDate: "",
                  notes: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignAsset}
              disabled={!assignmentData.employeeId}
            >
              Assign Asset
            </Button>
          </div>
        </div>
      </Modal>

      {/* Disposal Confirmation Modal */}
      <Modal
        isOpen={disposeModalId !== null}
        onClose={() => {
          setDisposeModalId(null);
          setDisposalReason("");
          setDisposalNotes("");
        }}
        title="Dispose Asset"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              ⚠️ <strong>Warning:</strong> Asset disposal is permanent and
              cannot be undone. The asset will be marked as disposed and removed
              from active inventory.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Disposal Reason *
            </label>
            <select
              value={disposalReason}
              onChange={(e) => setDisposalReason(e.target.value)}
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              required
            >
              <option value="">Select a reason</option>
              <option value="End of Life">End of Life</option>
              <option value="Damaged Beyond Repair">
                Damaged Beyond Repair
              </option>
              <option value="Lost/Stolen">Lost/Stolen</option>
              <option value="Obsolete">Obsolete</option>
              <option value="Sold">Sold</option>
              <option value="Donated">Donated</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={disposalNotes}
              onChange={(e) => setDisposalNotes(e.target.value)}
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg"
              rows={3}
              placeholder="Enter any additional details about the disposal..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setDisposeModalId(null);
                setDisposalReason("");
                setDisposalNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDispose}
              disabled={!disposalReason}
            >
              Dispose Asset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
