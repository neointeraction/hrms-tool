import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
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
    // members not implemented in simple form yet
  });
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      // Ideally endpoint filters by role, but reusing getEmployees
      const data = await apiService.getEmployees();
      // Ideally filter for PM role, but filtering by all for flexibility in MVP
      setManagers(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiService.createProject({
        ...formData,
        // members: [] // Optional
      });
      onSuccess();
    } catch (err) {
      alert("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            Create New Project
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <Input
              label="Project Name *"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, manager: e.target.value })
              }
              options={managers.map((m) => ({
                value: m.user?._id || m._id,
                label: `${m.firstName} ${m.lastName}`,
              }))}
              helperText="Select the person responsible for this project and task assignment."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                label="End Date"
                type="date"
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
        <div className="p-4 border-t border-border flex justify-end gap-3 mt-auto">
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
      </div>
    </div>
  );
}
