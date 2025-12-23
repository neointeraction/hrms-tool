import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Save, Info } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Textarea } from "../../../components/common/Textarea";
import { Modal } from "../../../components/common/Modal";
import { Checkbox } from "../../../components/common/Checkbox";

// --- Simple Toggle Switch Component ---
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helpText?: string;
  className?: string;
}

const Toggle = ({
  label,
  checked,
  onChange,
  helpText,
  className = "",
}: ToggleProps) => (
  <div className={`flex items-center justify-between ${className}`}>
    <div className="flex flex-col">
      <span className="text-sm font-medium text-text-primary">{label}</span>
      {helpText && (
        <span className="text-xs text-text-secondary mt-0.5">{helpText}</span>
      )}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-brand-primary" : "bg-gray-200"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

// --- Checkbox Group Component ---
const CheckboxGroup = ({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
}) => {
  const toggleOption = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          checked={values.includes(option)}
          onChange={() => toggleOption(option)}
        />
      ))}
    </div>
  );
};

interface LeavePolicyFormProps {
  policyId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LeavePolicyForm({
  policyId,
  isOpen,
  onClose,
}: LeavePolicyFormProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      shortCode: "",
      description: "",
      status: "Active", // Active, Inactive

      // Accrual
      totalLeaves: 12,
      accrualType: "Monthly", // Yearly, Monthly, Pro-rata
      allowCarryForward: false,
      maxCarryForward: 0,
      allowHalfDay: false,
      allowNegative: false, // New field, assuming backend support added
      isPaid: true,

      // Applicability & Approval
      employeeTypes: ["Permanent"], // Array of strings
      requiresApproval: true,
      minNotice: 0,
      docRequired: false,
      docRequiredAfter: 3,
      visibleToEmployees: true, // Assuming backend support added
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (policyId && isOpen) {
      apiService.getLeavePolicy(policyId).then((res) => {
        if (res.policy) {
          const p = res.policy;
          // Map API response to Form State
          reset({
            name: p.name,
            shortCode: p.shortCode || "",
            description: p.description || "",
            status: p.status,

            totalLeaves:
              p.allocation?.cycle === "Monthly"
                ? p.allocation.count * 12
                : p.allocation?.count || 0,
            accrualType: p.allocation?.proRata
              ? "Pro-rata"
              : p.allocation?.cycle || "Yearly",
            allowCarryForward: p.allocation?.carryForward || false,
            maxCarryForward: p.allocation?.maxCarryForward || 0,
            allowHalfDay: p.rules?.allowHalfDay || false,
            allowNegative: p.rules?.allowNegative || false,
            isPaid: p.category === "Paid",

            employeeTypes: p.eligibility?.employeeTypes || [],
            requiresApproval: p.rules?.requiresApproval || false,
            minNotice: p.rules?.minNotice || 0,
            docRequired: p.docs?.mandatory || false,
            docRequiredAfter: p.docs?.requiredAfter || 0,
            visibleToEmployees: p.visibleToEmployees ?? true,
          });
        }
      });
    } else if (!policyId && isOpen) {
      reset({
        name: "",
        shortCode: "",
        description: "",
        status: "Active",
        totalLeaves: 12,
        accrualType: "Monthly",
        allowCarryForward: false,
        maxCarryForward: 0,
        allowHalfDay: false,
        allowNegative: false,
        isPaid: true,
        employeeTypes: ["Permanent"],
        requiresApproval: true,
        minNotice: 0,
        docRequired: false,
        docRequiredAfter: 3,
        visibleToEmployees: true,
      });
    }
  }, [policyId, isOpen, reset]);

  const onSubmit = async (data: any) => {
    try {
      const payload: any = {
        name: data.name,
        shortCode: data.shortCode,
        description: data.description,
        status: data.status,
        visibleToEmployees: data.visibleToEmployees,

        type: "Custom",
        category: data.isPaid ? "Paid" : "Unpaid",

        allocation: {
          cycle: data.accrualType === "Monthly" ? "Monthly" : "Yearly",
          count:
            data.accrualType === "Monthly"
              ? data.totalLeaves / 12
              : data.totalLeaves,
          proRata: data.accrualType === "Pro-rata",
          carryForward: data.allowCarryForward,
          maxCarryForward: data.allowCarryForward ? data.maxCarryForward : 0,
          encashment: false,
          maxEncashment: 0,
        },

        eligibility: {
          employeeTypes: data.employeeTypes,
          gender: "All",
          minTenure: 0,
        },

        rules: {
          minNotice: data.minNotice,
          maxConsecutive: 30,
          requiresApproval: data.requiresApproval,
          allowHalfDay: data.allowHalfDay,
          allowNegative: data.allowNegative,
        },

        docs: {
          mandatory: data.docRequired,
          requiredAfter: data.docRequired ? data.docRequiredAfter : 0,
        },
      };

      const submitData = payload; // Directly use payload, no file upload

      if (policyId) {
        await apiService.updateLeavePolicy(policyId, submitData);
      } else {
        await apiService.createLeavePolicy(submitData);
      }
      onClose();
    } catch (error: any) {
      alert("Failed to save policy: " + error.message);
    }
  };

  // Live Summary Text Calculation
  const getSummary = () => {
    const parts = [];
    parts.push(`${watchedValues.totalLeaves} leaves/year`);

    if (watchedValues.accrualType === "Monthly") {
      parts.push("credited monthly");
    } else if (watchedValues.accrualType === "Pro-rata") {
      parts.push("pro-rata accrual");
    } else {
      parts.push("credited yearly");
    }

    if (watchedValues.allowHalfDay) parts.push("half-day");
    if (watchedValues.requiresApproval) parts.push("approval req.");

    return parts.join(", ");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={policyId ? "Edit Leave Policy" : "Create Leave Policy"}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
          <div className="flex flex-col text-left w-full sm:w-auto">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-semibold">
              Summary
            </span>
            <span className="text-sm font-medium text-text-primary">
              {getSummary().charAt(0).toUpperCase() + getSummary().slice(1)}
            </span>
          </div>
          <div className="flex gap-3 w-full sm:w-auto justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              isLoading={isSubmitting}
              leftIcon={<Save size={16} />}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Leave Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <div className="h-5 w-1 bg-brand-primary rounded-full"></div>
            <h3 className="font-semibold text-base text-text-primary">
              Leave Details
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Leave Name"
              placeholder="e.g. Casual Leave"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />
            <Input
              label="Short Code"
              placeholder="e.g. CL"
              {...register("shortCode")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary">
              Description
            </label>
            <Textarea
              placeholder="Brief description visible to employees..."
              rows={2}
              {...register("description")}
            />
          </div>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Toggle
                label="Is it Active?"
                checked={field.value === "Active"}
                onChange={(val) => field.onChange(val ? "Active" : "Inactive")}
              />
            )}
          />
        </div>

        {/* Section 2: Accrual & Usage Rules */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <div className="h-5 w-1 bg-brand-primary rounded-full"></div>
            <h3 className="font-semibold text-base text-text-primary">
              Accrual & Usage
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <Input
              label="Total Leaves / Year"
              type="number"
              {...register("totalLeaves", { valueAsNumber: true, min: 0 })}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">
                Accrual Type
              </label>
              <div className="flex bg-bg-main p-1 rounded-md border border-border">
                {["Yearly", "Monthly", "Pro-rata"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setValue("accrualType", type)}
                    className={`flex-1 text-xs py-1.5 rounded-sm transition-all ${
                      watch("accrualType") === type
                        ? "bg-white shadow text-brand-primary font-medium"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {watch("accrualType") === "Monthly" && (
            <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded text-xs flex items-center gap-2">
              <Info size={14} />
              <span>
                {(watch("totalLeaves") / 12).toFixed(1)} days credited per month
              </span>
            </div>
          )}

          <div className="bg-bg-main rounded-md p-4 space-y-3 border border-border">
            <div className="flex justify-between items-center gap-4">
              <Controller
                name="allowCarryForward"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="Carry Forward"
                    checked={field.value || false}
                    onChange={field.onChange}
                    className="flex-1"
                  />
                )}
              />
              {watch("allowCarryForward") && (
                <div className="w-24">
                  <Input
                    placeholder="Max Days"
                    type="number"
                    className="h-8 text-sm"
                    {...register("maxCarryForward", { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>

            <hr className="border-border/50" />

            <Controller
              name="allowHalfDay"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Allow Half Day"
                  checked={field.value || false}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="allowNegative"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Allow Negative Balance"
                  checked={field.value || false}
                  onChange={field.onChange}
                />
              )}
            />

            <Controller
              name="isPaid"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Paid Leave"
                  checked={field.value || false}
                  onChange={field.onChange}
                  helpText={field.value ? "Salary is paid" : "Loss of Pay"}
                />
              )}
            />
          </div>
        </div>

        {/* Section 3: Applicability & Approval */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-2">
            <div className="h-5 w-1 bg-brand-primary rounded-full"></div>
            <h3 className="font-semibold text-base text-text-primary">
              Applicability & Approval
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Applicable Employee Types
            </label>
            <Controller
              name="employeeTypes"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  options={[
                    "Permanent",
                    "Contract",
                    "Intern",
                    "Freelancer",
                    "Part-Time",
                  ]}
                  values={field.value || []}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="bg-bg-main rounded-md p-4 space-y-3 border border-border">
            <Controller
              name="requiresApproval"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Approval Required"
                  checked={field.value || false}
                  onChange={field.onChange}
                />
              )}
            />

            <Input
              label="Min Notice Period (Days)"
              type="number"
              {...register("minNotice", { valueAsNumber: true })}
            />

            <hr className="border-border/50" />

            <div className="flex justify-between items-center gap-4">
              <Controller
                name="docRequired"
                control={control}
                render={({ field }) => (
                  <Toggle
                    label="Document Required"
                    checked={field.value || false}
                    onChange={field.onChange}
                    className="flex-1"
                  />
                )}
              />

              {watch("docRequired") && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    After days:
                  </span>
                  <div className="w-20">
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      {...register("docRequiredAfter", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>

            <hr className="border-border/50" />

            <Controller
              name="visibleToEmployees"
              control={control}
              render={({ field }) => (
                <Toggle
                  label="Visible to Employees"
                  checked={field.value || false}
                  onChange={field.onChange}
                  helpText={
                    !field.value ? "Hidden from employee dashboard" : ""
                  }
                />
              )}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
