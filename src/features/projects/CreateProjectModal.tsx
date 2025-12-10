import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { DatePicker } from "../../components/common/DatePicker";
import { Modal } from "../../components/common/Modal";

import { Select } from "../../components/common/Select";

import { Textarea } from "../../components/common/Textarea";

interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProjectModal({
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    manager: "",
    startDate: "",
    endDate: "",
    members: [] as string[],
  });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data: any = await apiService.getEmployees();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error("Failed to load users");
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
    try {
      setLoading(true);
      await apiService.createProject(formData);
      onSuccess();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Project"
      maxWidth="max-w-lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            isLoading={loading}
          >
            Create Project
          </Button>
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

        <div>
          <Input
            label="Client Name"
            type="text"
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
          />
        </div>

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
                  <label
                    key={empId}
                    className="flex items-center gap-2 p-2 hover:bg-bg-hover rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.members.includes(empId)}
                      onChange={() => handleMemberToggle(empId)}
                      className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-text-primary">
                      {emp.firstName} {emp.lastName}{" "}
                      <span className="text-text-secondary text-xs">
                        ({emp.designation})
                      </span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
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
