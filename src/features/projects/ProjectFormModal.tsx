import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";

import { Input } from "../../components/common/Input";
import { DatePicker } from "../../components/common/DatePicker";
import { Modal } from "../../components/common/Modal";
import { Checkbox } from "../../components/common/Checkbox";
import { Select } from "../../components/common/Select";
import { Textarea } from "../../components/common/Textarea";

interface ProjectFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // For Edit Mode
}

export default function ProjectFormModal({
  onClose,
  onSuccess,
  initialData,
}: ProjectFormModalProps) {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    manager: "",
    status: "Active", // Default status
    startDate: "",
    endDate: "",
    budget: 0,
    members: [] as string[],
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadClients();
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        client: initialData.client || "",
        description: initialData.description || "",
        manager: initialData.manager?._id || initialData.manager || "",
        status: initialData.status || "Active",
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split("T")[0]
          : "",
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split("T")[0]
          : "",
        budget: initialData.budget || 0,
        members: initialData.members
          ? initialData.members.map((m: any) => m._id || m)
          : [],
      });
    }
  }, [initialData]);

  const loadEmployees = async () => {
    try {
      const data: any = await apiService.getEmployees();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const loadClients = async () => {
    try {
      const data = await apiService.getClients();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients");
    }
  };

  const handleMemberToggle = (employeeId: string) => {
    setFormData((prev) => {
      const isSelected = prev.members.includes(employeeId);
      if (isSelected) {
        return {
          ...prev,
          members: prev.members.filter((id) => id !== employeeId),
        };
      } else {
        return {
          ...prev,
          members: [...prev.members, employeeId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.manager) {
      alert("Please select a Project Manager");
      return;
    }
    // Also validate client if needed, but it's string.

    try {
      setLoading(true);
      if (isEditMode) {
        await apiService.updateProject(initialData._id, formData);
      } else {
        await apiService.createProject(formData);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      alert(
        isEditMode ? "Failed to update project" : "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? "Edit Project" : "Create New Project"}
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Project"
              : "Create Project"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Project Name *"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        {/* Status Field (Only visible in Edit Mode) - Optional: Or always visible? Let's make it always visible but usually Active for new. */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Select
              label="Client Name"
              value={formData.client}
              onChange={(value) =>
                setFormData({ ...formData, client: value as string })
              }
              options={clients.map((client) => ({
                label: client.name,
                value: client.name, // Or client._id if backend expects ID, but preserving existing behavior of storing name if strict relation not enforced? Project Model check needed? Assuming name string for now based on existing code.
                // Wait, user requested "client dropdown". Ideally it should store ID if we want relation. But existing code `formData.client` is string. Backend Project model likely stores string 'client'.
                // If I change it to ID, I might break existing projects display if they expect a name.
                // Let's store NAME for now to be safe with existing schema, unless I check Project Model.
                // Checking previous code: `initialData.client` was just a string input.
                // Storing Name is safer for backward compatibility unless refactoring Project Model too.
              }))}
              helperText='Select a client or manage clients in "Client Management".'
            />
          </div>
          <div>
            <Select
              label="Status"
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as string })
              }
              options={[
                { value: "Active", label: "Active" },
                { value: "Completed", label: "Completed" },
                { value: "On Hold", label: "On Hold" },
                { value: "Cancelled", label: "Cancelled" },
              ]}
            />
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Project Manager *"
                required
                value={formData.manager}
                onChange={(value) =>
                  setFormData({ ...formData, manager: value as string })
                }
                options={employees.map((m) => ({
                  value: m.user?._id || m._id,
                  label: `${m.firstName} ${m.lastName}`,
                }))}
                helperText="Select the person responsible for this project."
              />
            </div>
            <div>
              <Input
                label="Budget (₹)"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: Number(e.target.value) })
                }
                placeholder="0"
                helperText="Total allocated project budget."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members ({formData.members.length})
          </label>
          <div className="border border-border rounded-lg p-2 max-h-40 overflow-y-auto space-y-2">
            {employees.length === 0 ? (
              <p className="text-xs text-text-secondary text-center py-2">
                No employees found.
              </p>
            ) : (
              employees.map((emp) => {
                const empId = emp.user?._id || emp._id;
                return (
                  <div
                    key={empId}
                    className="flex items-center gap-2 p-2 hover:bg-bg-hover rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.members.includes(empId)}
                      onChange={() => handleMemberToggle(empId)}
                      label={
                        <span className="text-sm text-text-primary">
                          {emp.firstName} {emp.lastName}{" "}
                          <span className="text-text-secondary text-xs">
                            ({emp.designation})
                          </span>
                        </span>
                      }
                    />
                  </div>
                );
              })
            )}
          </div>
          <p className="mt-1 text-xs text-text-muted">
            Select employees to assign to this project.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <DatePicker
              label="Start Date *"
              name="startDate"
              required
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <DatePicker
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <Textarea
            label="Description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>
      </form>
    </Modal>
  );
}
