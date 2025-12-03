import { useState, useEffect } from "react";
import { Plus, Clock, AlertTriangle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "../../utils/cn";

const timeEntrySchema = z.object({
  client: z.string().min(1, "Client is required"),
  project: z.string().min(1, "Project is required"),
  task: z.string().min(1, "Task is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const timesheetSchema = z.object({
  entries: z.array(timeEntrySchema),
  overtimeReason: z.string().optional(),
});

type TimesheetFormValues = z.infer<typeof timesheetSchema>;

const MOCK_CLIENTS = ["Acme Corp", "Globex", "Soylent Corp"];
const MOCK_PROJECTS = ["Website Redesign", "Mobile App", "Backend API"];

export default function Timesheet() {
  const [totalHours, setTotalHours] = useState(0);
  const [showOvertimeReason, setShowOvertimeReason] = useState(false);

  const { register, control, watch, handleSubmit } =
    useForm<TimesheetFormValues>({
      resolver: zodResolver(timesheetSchema),
      defaultValues: {
        entries: [
          {
            client: "",
            project: "",
            task: "",
            startTime: "09:00",
            endTime: "17:00",
          },
        ],
        overtimeReason: "",
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "entries",
  });

  const entries = watch("entries");
  const overtimeReason = watch("overtimeReason");

  useEffect(() => {
    let total = 0;
    entries.forEach((entry) => {
      if (entry.startTime && entry.endTime) {
        const start = new Date(`1970-01-01T${entry.startTime}`);
        const end = new Date(`1970-01-01T${entry.endTime}`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (diff > 0) total += diff;
      }
    });
    setTotalHours(total);
    setShowOvertimeReason(total > 9);
  }, [entries]);

  const onSubmit = (data: TimesheetFormValues) => {
    if (totalHours > 9 && !data.overtimeReason) return;
    console.log("Submitted:", data);
    alert("Timesheet submitted successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Timesheet Management
        </h1>
        <div className="text-right">
          <p className="text-sm text-text-secondary">Today</p>
          <p className="text-lg font-semibold text-brand-primary">
            June 07, 2025
          </p>
        </div>
      </div>

      <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-bg-main/50 rounded-lg"
              >
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Client
                  </label>
                  <select
                    {...register(`entries.${index}.client`)}
                    className="w-full rounded-md border-border bg-bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  >
                    <option value="">Select Client</option>
                    {MOCK_CLIENTS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Project
                  </label>
                  <select
                    {...register(`entries.${index}.project`)}
                    className="w-full rounded-md border-border bg-bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                  >
                    <option value="">Select Project</option>
                    {MOCK_PROJECTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Task
                  </label>
                  <input
                    type="text"
                    {...register(`entries.${index}.task`)}
                    className="w-full rounded-md border-border bg-bg-card px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                    placeholder="Task description"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    {...register(`entries.${index}.startTime`)}
                    className="w-full rounded-md border-border bg-bg-card px-2 py-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    {...register(`entries.${index}.endTime`)}
                    className="w-full rounded-md border-border bg-bg-card px-2 py-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>
                <div className="md:col-span-1 flex justify-center pb-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-status-error hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                client: "",
                project: "",
                task: "",
                startTime: "",
                endTime: "",
              })
            }
            className="flex items-center gap-2 text-brand-primary hover:text-brand-secondary font-medium"
          >
            <Plus size={20} />
            Add Entry
          </button>

          <div className="border-t border-border pt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Clock size={24} className="text-text-secondary" />
                <span className="text-lg font-medium text-text-primary">
                  Total Hours:
                </span>
              </div>
              <span
                className={cn(
                  "text-3xl font-bold font-mono transition-colors duration-300",
                  totalHours > 9 ? "text-status-warning" : "text-brand-primary"
                )}
              >
                {totalHours.toFixed(2)} hrs
              </span>
            </div>

            <div
              className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                showOvertimeReason
                  ? "max-h-40 opacity-100 mb-6"
                  : "max-h-0 opacity-0"
              )}
            >
              <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 text-status-warning">
                  <AlertTriangle size={18} />
                  <span className="font-medium">Overtime Reason Required</span>
                </div>
                <textarea
                  {...register("overtimeReason")}
                  className="w-full rounded-md border-status-warning/30 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-status-warning/20 focus:border-status-warning transition-all"
                  placeholder="Please explain why you worked overtime today..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={totalHours > 9 && !overtimeReason}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium text-white transition-all",
                  totalHours > 9 && !overtimeReason
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-brand-primary hover:bg-brand-secondary shadow-lg shadow-brand-primary/20"
                )}
              >
                Submit Timesheet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
