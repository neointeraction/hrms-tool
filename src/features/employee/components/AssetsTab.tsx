import React, { useEffect, useState } from "react";
import { apiService } from "../../../services/api.service";
import { Modal } from "../../../components/common/Modal";
import {
  Monitor,
  Smartphone,
  Laptop,
  Plus,
  ArrowRightLeft,
  AlertCircle,
  Search,
} from "lucide-react";
import { Select } from "../../../components/common/Select";
import { Input } from "../../../components/common/Input";
import { useNotification } from "../../../context/NotificationContext";
import { Button } from "../../../components/common/Button";

interface AssetsTabProps {
  employeeId: string;
  readOnly?: boolean;
}

export const AssetsTab = ({ employeeId, readOnly = false }: AssetsTabProps) => {
  const { showToast } = useNotification();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAssetAssignments({
        employeeId,
      });

      if (Array.isArray(response)) {
        setAssignments(response);
      } else if (response && response.assignments) {
        setAssignments(response.assignments);
      } else {
        setAssignments([]);
      }
    } catch (err: any) {
      setError("Failed to load assets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  const handleAssignSuccess = () => {
    setAssignModalOpen(false);
    fetchData();
    showToast("Asset assigned successfully", "success");
  };

  const handleReturnSuccess = () => {
    setReturnModalOpen(false);
    fetchData();
    showToast("Asset returned successfully", "success");
  };

  const getIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes("laptop") || lower.includes("computer"))
      return <Laptop size={20} />;
    if (lower.includes("mobile") || lower.includes("phone"))
      return <Smartphone size={20} />;
    return <Monitor size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-text-primary">
          Assigned Assets
        </h3>
        {!readOnly && (
          <Button
            onClick={() => setAssignModalOpen(true)}
            leftIcon={<Plus size={16} />}
            disabled={!employeeId} // Can't assign if new employee not saved yet
            type="button"
          >
            Assign Asset
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-bg-card rounded-xl border border-border">
          <Monitor size={48} className="mx-auto text-text-muted mb-3" />
          <h3 className="text-lg font-medium text-text-primary">
            No Assets Assigned
          </h3>
          <p className="text-text-secondary">
            This employee currently has no assets assigned.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                    {getIcon(assignment.assetId?.categoryId?.name || "")}
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {assignment.assetId?.name || "Unknown Asset"}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {assignment.assetId?.assetCode || "N/A"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    assignment.status === "Active"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {assignment.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary mb-4">
                <div>
                  <span className="block text-xs text-text-muted">Issued</span>
                  {new Date(assignment.issueDate).toLocaleDateString()}
                </div>
                {assignment.status === "Returned" && (
                  <div>
                    <span className="block text-xs text-text-muted">
                      Returned
                    </span>
                    {new Date(assignment.actualReturnDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              {assignment.status === "Active" && !readOnly && (
                <div className="pt-3 border-t border-border flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setReturnModalOpen(true);
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <ArrowRightLeft size={14} /> Return Asset
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <AssignAssetModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={handleAssignSuccess}
          employeeId={employeeId}
        />
      )}

      {/* Return Modal */}
      {returnModalOpen && selectedAssignment && (
        <ReturnAssetModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          onSuccess={handleReturnSuccess}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
};

const AssignAssetModal = ({ isOpen, onClose, onSuccess, employeeId }: any) => {
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    assetId: "",
    issueDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    conditionAtIssue: "New",
    notes: "",
  });

  useEffect(() => {
    fetchAvailableAssets();
  }, []);

  const fetchAvailableAssets = async () => {
    try {
      const res = await apiService.getAssets({ status: "Available" });
      if (res.assets) {
        setAvailableAssets(res.assets);
      }
    } catch (err) {
      console.error("Failed to fetch assets", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.assignAsset({
        ...formData,
        employeeId,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to assign asset");
    } finally {
      setLoading(false);
    }
  };

  const filteredAssets = availableAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Asset">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Search Asset
          </label>
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-text-muted"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Select Asset <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.assetId}
            onChange={(e) =>
              setFormData({ ...formData, assetId: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            required
            size={5} // Show multiple items
          >
            <option value="">Select an asset...</option>
            {filteredAssets.map((asset) => (
              <option key={asset._id} value={asset._id}>
                {asset.name} ({asset.assetCode}) - {asset.model}
              </option>
            ))}
          </select>
          {filteredAssets.length === 0 && (
            <p className="text-xs text-text-muted mt-1">
              No available assets found matching your search.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Issue Date"
            type="date"
            value={formData.issueDate}
            onChange={(e) =>
              setFormData({ ...formData, issueDate: e.target.value })
            }
            required
          />
          <Input
            label="Expected Return (Optional)"
            type="date"
            value={formData.expectedReturnDate}
            onChange={(e) =>
              setFormData({ ...formData, expectedReturnDate: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Condition at Issue
          </label>
          <Select
            value={formData.conditionAtIssue}
            onChange={(value) =>
              setFormData({ ...formData, conditionAtIssue: value as string })
            }
            options={[
              { value: "New", label: "New" },
              { value: "Good", label: "Good" },
              { value: "Used", label: "Used" },
              { value: "Damaged", label: "Damaged" },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            disabled={!formData.assetId}
          >
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ReturnAssetModal = ({ isOpen, onClose, onSuccess, assignment }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    returnDate: new Date().toISOString().split("T")[0],
    conditionAtReturn: assignment.conditionAtIssue || "Good",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.returnAsset(assignment._id, {
        returnDate: formData.returnDate,
        conditionAtReturn: formData.conditionAtReturn,
        notes: formData.notes,
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to return asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Return ${assignment.assetId.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium">
              Passing Asset: {assignment.assetId.assetCode}
            </p>
            <p>
              Issued on: {new Date(assignment.issueDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Input
          label="Return Date"
          type="date"
          value={formData.returnDate}
          onChange={(e) =>
            setFormData({ ...formData, returnDate: e.target.value })
          }
          required
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Condition at Return
          </label>
          <Select
            value={formData.conditionAtReturn}
            onChange={(value) =>
              setFormData({ ...formData, conditionAtReturn: value as string })
            }
            options={[
              { value: "New", label: "New" },
              { value: "Good", label: "Good" },
              { value: "Used", label: "Used" },
              { value: "Damaged", label: "Damaged" },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Notes (Optional damage comments etc.)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Confirm Return
          </Button>
        </div>
      </form>
    </Modal>
  );
};
