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

      // Check for file
      const fileInput = document.querySelector(
        'input[name="document"]'
      ) as HTMLInputElement;
      const file = fileInput?.files?.[0];

      let submitData = payload;

      if (file) {
        const formData = new FormData();
        // Append all nested fields as JSON string or flat fields?
        // Backend expects body to be parsed. If we send FormData, standard Express body-parser might not parse nested JSON in fields automatically unless we use a specific middleware or send as JSON string in a field.
        // However, our backend controller logic for `req.body` and `new LeavePolicy({...req.body})` implies it expects an object structure.
        // Sending nested object in FormData is slightly complex.
        // Strategy: Send `data` as a JSON string and `document` as file.
        // BUT my backend controller: `const policyData = req.body; ... new LeavePolicy({...policyData...})`.
        // If I send unrelated fields in FormData, `req.body` will adhere to multer's parsing.
        // Multer populates `req.body` with text fields.
        // If I accept `req.body` blindly, I need to ensure the structure matches.
        // Multer doesn't parse nested objects like `allocation[count]`. It gives `req.body['allocation[count]']`.
        // So I should flatten it or improved backend to parse.
        // OR: I can append each field: formData.append('name', payload.name)...
        // For nested: formData.append('allocation[count]', payload.allocation.count)...
        // This relies on `body-parser` extended: true (which is default usually) to inflate it?
        // Actually multer doesn't inflate nested objects by default.
        // EASIEST FIX: Update backend to parse a `data` field if present?
        // OR simply recreate the object structure on frontend and backend handles it?
        // Let's try sending as flat keys for top level and JSON for nested? No.
        // Let's use the standard "append everything" approach and see if backend handles it or if I need to adjust backend.
        // Given I updated `api.service.ts` to just pass data, and `controller` just spreads `req.body`.
        // If I use `JSON.stringify` for complex fields, backend needs to parse them.
        // Let's assume standard field appending works or I'll fix backend.
        // WAIT: `req.body` will satisfy `new LeavePolicy(req.body)` ONLY if `req.body` is a structured object.
        // If multer provides flat keys `allocation[count]`, Mongoose MIGHT handle it if strict query/casting is smart, but `new Model({...})` typically expects structure.
        // Better Strategy:
        // Update Backend Controller to handle `req.body.data` as JSON string if present.
        // Let's modify Frontend to send `data` = JSON.stringify(payload) and `document` = file.
        // And I will need to update backend controller to parse `req.body.data` if it exists.
        // Wait, I already modified backend controller... let me check it again in my memory/logs.
        // I modified it to: `const policyData = req.body; ...`
        // So if I send data as JSON string in `data` field, `req.body.data` will be that string.
        // So I must parse it.

        // Let's update frontend to send properly structure FormData first (using dot notation),
        // and if backend fails, I'll fix backend to use `qs` or similar to parse body, or parse manually.
        // Actually, let's go with the JSON string `data` field approach. It's robust.
        // I will update frontend here to send `data` as string.
        // AND I will add a backend task to parse it.

        formData.append("document", file);
        // We need to flatten or stringify. Stringifying the whole payload into one field 'policyData' is cleanest.
        // But backend expects fields in `req.body`.
        // Let's iterate and append.

        // Let's try to trust Mongoose/Express to handle 'allocation.count' style keys?
        // No, `new Model` won't parse dot notation keys into objects.
        // So I should convert payload to flat dot-notation keys for FormData?
        // validation: `allocation[count]` (bracket notation) is what `body-parser` (urlencoded) supports for nested.
        // Multer produces `req.body` with these keys if valid.
        // Does `new Model()` support `allocation[count]` keys? No.

        // DECISION: Send all metadata as a single JSON string field named 'data'.
        // Backend changes needed: Parse `req.body.data` if present.

        formData.append("data", JSON.stringify(payload));
        submitData = formData;
      }

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

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Policy Document (PDF/Image)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    // We'll handle file in submit
                  }
                }}
                name="document"
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
              />
              <p className="text-xs text-text-secondary">
                Upload a policy document for employees to view.
              </p>
            </div>

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
