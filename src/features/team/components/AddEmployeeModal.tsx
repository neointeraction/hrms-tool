import { useState } from "react";

import { PasswordInput } from "../../../components/common/PasswordInput";
import { apiService } from "../../../services/api.service";
import type { RegisterUserData } from "../../../services/api.service";
import { Select } from "../../../components/common/Select";
import { Input } from "../../../components/common/Input";
import { Modal } from "../../../components/common/Modal";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeModalProps) {
  const [formData, setFormData] = useState<RegisterUserData>({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiService.registerUser(formData);
      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        employeeId: "",
        department: "",
        role: "",
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after short delay
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Employee"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleSubmit({ preventDefault: () => {} } as React.FormEvent)
            }
            className="px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm">
            Employee added successfully!
          </div>
        )}

        <div>
          <Input
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        <div>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="employee@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Minimum 6 characters"
          />
        </div>

        <div>
          <Input
            label="Employee ID"
            type="text"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            required
            placeholder="EMP001"
          />
        </div>

        <div>
          <Select
            label="Department"
            required
            value={formData.department}
            onChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                department: value as string,
              }))
            }
            options={[
              { value: "Engineering", label: "Engineering" },
              { value: "IT", label: "IT" },
              { value: "Design", label: "Design" },
              { value: "Product", label: "Product" },
              { value: "Marketing", label: "Marketing" },
              { value: "Sales", label: "Sales" },
              { value: "HR", label: "HR" },
              { value: "Finance", label: "Finance" },
              { value: "Operations", label: "Operations" },
            ]}
          />
        </div>

        <div>
          <Select
            label="Role"
            required
            value={formData.role}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, role: value as string }))
            }
            options={[
              { value: "Admin", label: "Admin" },
              { value: "HR", label: "HR" },
              { value: "Accountant", label: "Accountant" },
              { value: "Project Manager", label: "Project Manager" },
              { value: "Employee", label: "Employee" },
              { value: "Intern", label: "Intern" },
              { value: "Consultant", label: "Consultant" },
            ]}
          />
        </div>
      </form>
    </Modal>
  );
}
