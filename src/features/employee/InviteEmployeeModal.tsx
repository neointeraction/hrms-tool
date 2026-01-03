import { useState, useEffect } from "react";
import { Mail, User, CheckCircle } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Button } from "../../components/common/Button";

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Employee",
    salary: "",
    joiningDate: "",
    designation: "",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchDesignations();
      // Reset state when opening
      setShowSuccess(false);
      setData({
        firstName: "",
        lastName: "",
        email: "",
        role: "Employee",
        salary: "",
        joiningDate: "",
        designation: "",
      });
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const res = await apiService.getRoles();
      setRoles(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await apiService.getDesignations();
      setDesignations(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiService.inviteEmployee(data);
      setShowSuccess(true);
      onSuccess();
      // Don't close immediately, let user see success modal
    } catch (err: any) {
      alert(err.message); // Keeping error alert involved for now, or could use toast
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  if (showSuccess) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Invitation Sent"
        maxWidth="max-w-sm"
        footer={
          <div className="flex justify-center w-full">
            <Button onClick={handleClose}>Done</Button>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Invitation Sent Successfully!
          </h3>
          <p className="text-sm text-text-secondary">
            An email has been sent to <strong>{data.email}</strong> with
            onboarding instructions
            {data.salary && " and their offer letter"}.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Employee"
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={loading}
            leftIcon={<Mail size={16} />}
            isLoading={loading}
          >
            Send Invitation
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ... existing form content ... */}
        <p className="text-sm text-text-secondary mb-4">
          Send an onboarding invitation via email. The candidate will receive a
          unique link to submit their details.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={data.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            required
            placeholder="John"
            leftIcon={<User size={16} />}
          />
          <Input
            label="Last Name"
            value={data.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            required
            placeholder="Doe"
            leftIcon={<User size={16} />}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={data.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          placeholder="john@company.com"
          leftIcon={<Mail size={16} />}
        />

        <Select
          label="Role"
          value={data.role}
          onChange={(value) => handleChange("role", String(value))}
          options={[
            { value: "Employee", label: "Employee" },
            { value: "Manager", label: "Manager" },
            ...roles
              .filter((r) => r.name !== "Employee" && r.name !== "Manager")
              .map((r) => ({ value: r.name, label: r.name })),
          ]}
        />

        <div className="border-t border-border pt-4 mt-2">
          <p className="text-sm font-medium text-text-primary mb-3">
            Offer Details (Optional)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Salary (CTC)"
              type="number"
              value={data.salary}
              onChange={(e) => handleChange("salary", e.target.value)}
              placeholder="e.g. 1200000"
              leftIcon={<span className="text-xs font-bold px-1">₹</span>}
            />
            <Input
              label="Joining Date"
              type="date"
              value={data.joiningDate}
              onChange={(e) => handleChange("joiningDate", e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Select
              label="Designation"
              value={data.designation}
              onChange={(value) => handleChange("designation", String(value))}
              options={designations.map((d) => ({
                value: d.name,
                label: d.name,
              }))}
              placeholder="Select Designation"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
