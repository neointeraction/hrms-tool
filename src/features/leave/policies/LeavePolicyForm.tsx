import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Plus, CheckCircle, Save } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Select } from "../../../components/common/Select";
import { Textarea } from "../../../components/common/Textarea";

interface LeavePolicyFormProps {
  policyId: string | null;
  onBack: () => void;
}

const steps = ["Basic Info", "Allocation", "Eligibility", "Rules", "Review"];

export default function LeavePolicyForm({
  policyId,
  onBack,
}: LeavePolicyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [msg, setMsg] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      type: "Annual",
      category: "Paid",
      description: "",
      allocation: {
        cycle: "Yearly",
        count: 12,
        proRata: false,
        carryForward: false,
        maxCarryForward: 0,
        encashment: false,
        maxEncashment: 0,
      },
      eligibility: {
        applyTo: [], // Departments
        minTenure: 0,
        gender: "All",
      },
      rules: {
        minNotice: 0,
        maxConsecutive: 30,
        requiresApproval: true,
      },
      status: "Active",
    },
  });

  useEffect(() => {
    if (policyId) {
      apiService.getLeavePolicy(policyId).then((res) => {
        if (res.policy) reset(res.policy);
      });
    }
  }, [policyId, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (policyId) {
        await apiService.updateLeavePolicy(policyId, data);
        setMsg("Policy updated successfully");
      } else {
        await apiService.createLeavePolicy(data);
        setMsg("Policy created successfully");
      }
      setTimeout(onBack, 1500);
    } catch (error: any) {
      alert("Failed to save policy: " + error.message);
    }
  };

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
        <h2 className="text-2xl font-bold text-text-primary">
          {policyId ? "Edit Leave Policy" : "Create Leave Policy"}
        </h2>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center px-8">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-col items-center relative z-10">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                index <= currentStep
                  ? "bg-brand-primary text-white"
                  : "bg-surface-highlight text-text-secondary"
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-xs mt-2 font-medium ${
                index <= currentStep
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
        {/* Simple visualization provided by layout, connecting lines assumed via css or ignored for simplicity */}
      </div>

      <div className="bg-bg-panel border border-border rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Policy Name"
                  {...register("name", { required: "Name is required" })}
                  error={errors.name?.message}
                />
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Leave Type"
                      options={[
                        { value: "Annual", label: "Annual" },
                        { value: "Sick", label: "Sick" },
                        { value: "Casual", label: "Casual" },
                        { value: "Maternity", label: "Maternity" },
                        { value: "Paternity", label: "Paternity" },
                        { value: "Unpaid", label: "Unpaid" },
                        { value: "Custom", label: "Custom" },
                      ]}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Category"
                      options={[
                        { value: "Paid", label: "Paid" },
                        { value: "Unpaid", label: "Unpaid" },
                        { value: "Restricted", label: "Restricted" },
                        { value: "Comp-Off", label: "Comp-Off" },
                      ]}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Status"
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                        { value: "Draft", label: "Draft" },
                      ]}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <Textarea label="Description" {...register("description")} />
            </div>
          )}

          {/* Step 2: Allocation */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Allocation Rules
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="allocation.cycle"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Cycle"
                      options={[
                        { value: "Yearly", label: "Yearly" },
                        { value: "Monthly", label: "Monthly" },
                        { value: "Quarterly", label: "Quarterly" },
                      ]}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Input
                  label="Leave Count"
                  type="number"
                  {...register("allocation.count", { valueAsNumber: true })}
                />
              </div>

              <div className="flex flex-col gap-4 p-4 bg-bg-main rounded-md border border-border">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("allocation.proRata")}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    Pro-rated for new joiners
                  </span>
                </label>

                <div className="flex-col space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("allocation.carryForward")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">
                      Carry Forward Allowed
                    </span>
                  </label>
                  {watch("allocation.carryForward") && (
                    <Input
                      label="Max Carry Forward Days"
                      type="number"
                      className="ml-6 w-1/2"
                      {...register("allocation.maxCarryForward", {
                        valueAsNumber: true,
                      })}
                    />
                  )}
                </div>

                <div className="flex-col space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register("allocation.encashment")}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">
                      Encashment Allowed
                    </span>
                  </label>
                  {watch("allocation.encashment") && (
                    <Input
                      label="Max Encashable Days"
                      type="number"
                      className="ml-6 w-1/2"
                      {...register("allocation.maxEncashment", {
                        valueAsNumber: true,
                      })}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Eligibility - Simplified for prototype */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Eligibility
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="eligibility.gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Gender"
                      options={["All", "Male", "Female", "Other"].map((g) => ({
                        value: g,
                        label: g,
                      }))}
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Input
                  label="Minimum Tenure (Months)"
                  type="number"
                  {...register("eligibility.minTenure", {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                Note: Department and Location restrictions can be added in
                advanced settings.
              </div>
            </div>
          )}

          {/* Step 4: Rules */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-lg font-semibold text-text-primary">
                Application Rules
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Minimum Notice Period (Days)"
                  type="number"
                  {...register("rules.minNotice", { valueAsNumber: true })}
                />
                <Input
                  label="Max Consecutive Days"
                  type="number"
                  {...register("rules.maxConsecutive", { valueAsNumber: true })}
                />
              </div>
              <div className="p-4 bg-bg-main rounded-md border border-border">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register("rules.requiresApproval")}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">
                    Requires Manager Approval
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center justify-center flex-col text-center space-y-2">
                <CheckCircle className="text-green-500 w-12 h-12" />
                <h3 className="text-xl font-bold">Ready to Publish?</h3>
                <p className="text-text-secondary max-w-sm">
                  Review your settings below. Once published, this policy will
                  be available to eligible employees.
                </p>
              </div>

              <div className="bg-bg-main p-4 rounded-lg text-sm space-y-1">
                <p>
                  <span className="font-semibold">Name:</span> {watch("name")}
                </p>
                <p>
                  <span className="font-semibold">Type:</span> {watch("type")} (
                  {watch("category")})
                </p>
                <p>
                  <span className="font-semibold">Count:</span>{" "}
                  {watch("allocation.count")} / {watch("allocation.cycle")}
                </p>
              </div>

              {msg && (
                <div className="p-3 bg-green-100 text-green-700 rounded text-center font-medium">
                  {msg}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                rightIcon={<Plus size={16} />}
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                isLoading={isSubmitting}
                leftIcon={<Save size={16} />}
              >
                {policyId ? "Update Policy" : "Publish Policy"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
