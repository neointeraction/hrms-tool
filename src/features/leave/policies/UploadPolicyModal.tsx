import { useState } from "react";
import { useForm } from "react-hook-form";
import { UploadCloud } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { Modal } from "../../../components/common/Modal";

interface UploadPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadPolicyModal({
  isOpen,
  onClose,
}: UploadPolicyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSubmit = async (data: any) => {
    if (!selectedFile) {
      alert("Please select a document to upload.");
      return;
    }

    try {
      // Construct a default policy payload with the file
      const payload = {
        name: data.name,
        description: data.description,
        status: "Active",
        type: "Custom",
        category: "Unpaid", // Default to unpaid or informational
        visibleToEmployees: true, // Always visible

        // Default Allocation (0 days as it's just a doc)
        allocation: {
          cycle: "Yearly",
          count: 0,
          proRata: false,
          carryForward: false,
          maxCarryForward: 0,
          encashment: false,
          maxEncashment: 0,
        },

        // Default Eligibility
        eligibility: {
          employeeTypes: ["Permanent", "Contract", "Intern", "Induction"], // Apply to all common types
          gender: "All",
          minTenure: 0,
        },

        // Default Rules
        rules: {
          minNotice: 0,
          maxConsecutive: 365,
          requiresApproval: false,
          allowHalfDay: false,
          allowNegative: false,
        },

        docs: {
          mandatory: false,
          requiredAfter: 0,
        },
      };

      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("data", JSON.stringify(payload));

      await apiService.createLeavePolicy(formData);
      reset();
      setSelectedFile(null);
      onClose();
    } catch (error: any) {
      alert("Failed to upload policy: " + error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Policy Document"
      maxWidth="max-w-lg"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            leftIcon={<UploadCloud size={16} />}
          >
            Upload
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Policy Name"
          placeholder="e.g. Employee Handbook 2024"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-primary">
            Description
          </label>
          <Textarea
            placeholder="Brief description..."
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Document (PDF/Image) <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center bg-bg-main hover:bg-bg-hover transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                }
              }}
              className="hidden"
              id="policy-doc-upload"
            />
            <label
              htmlFor="policy-doc-upload"
              className="cursor-pointer flex flex-col items-center gap-2 text-center"
            >
              <UploadCloud size={32} className="text-brand-primary/50" />
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-brand-primary">
                    Click to upload
                  </p>
                  <p className="text-xs text-text-secondary">
                    PDF, JPG, PNG up to 10MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
