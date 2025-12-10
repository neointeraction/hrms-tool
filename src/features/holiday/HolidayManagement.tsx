import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/api.service";
import { Calendar, Trash2, Plus } from "lucide-react";
import { format } from "date-fns";
import { Table, type Column } from "../../components/common/Table";
import { DatePicker } from "../../components/common/DatePicker";

import { useMemo } from "react";

interface Holiday {
  _id: string;
  name: string;
  date: string;
  day: string;
  year: number;
  type: string;
}

interface HolidayManagementProps {
  isModal?: boolean;
}

export default function HolidayManagement({
  isModal = false,
}: HolidayManagementProps) {
  const { user } = useAuth();
  const isAdminOrHR = user?.role === "Admin" || user?.role === "HR";

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: "",
    date: "",
    type: "Public",
  });

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHolidays(2025); // Default to current/next year or generic
      setHolidays(data);
      setError("");
    } catch (err: any) {
      setError("Failed to load holidays");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.addHoliday(newHoliday);
      setNewHoliday({ name: "", date: "", type: "Public" });
      setIsAdding(false);
      fetchHolidays();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;
    try {
      await apiService.deleteHoliday(id);
      fetchHolidays();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const columns = useMemo<Column<Holiday>[]>(
    () => [
      {
        header: "Date",
        accessorKey: "date",
        render: (holiday) => (
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-brand-primary opacity-70" />
            <span>{format(new Date(holiday.date), "do MMM yyyy")}</span>
          </div>
        ),
      },
      {
        header: "Day",
        accessorKey: "day",
      },
      {
        header: "Holiday Name",
        accessorKey: "name",
        render: (holiday) => {
          const isNoHoliday = holiday.name.toLowerCase().includes("no holiday");
          return (
            <span className="font-medium">
              {holiday.name}
              {isNoHoliday && (
                <span className="ml-2 text-xs bg-status-warning/20 text-status-warning px-2 py-0.5 rounded-full">
                  Not Observed
                </span>
              )}
            </span>
          );
        },
      },
      {
        header: "Type",
        accessorKey: "type",
        render: (holiday) => (
          <span
            className={`text-xs px-2 py-1 rounded-full border ${
              holiday.type === "Public"
                ? "bg-status-success/10 text-status-success border-status-success/20"
                : "bg-bg-main text-text-secondary border-border"
            }`}
          >
            {holiday.type}
          </span>
        ),
      },
      ...(isAdminOrHR
        ? [
            {
              header: "Actions",
              className: "text-right",
              render: (holiday: Holiday) => (
                <div className="text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(holiday._id);
                    }}
                    className="text-text-muted hover:text-status-error p-2 rounded-full hover:bg-status-error/10 transition-colors"
                    title="Delete Holiday"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            } as Column<Holiday>,
          ]
        : []),
    ],
    [isAdminOrHR]
  );

  return (
    <div className="space-y-6">
      {/* Header - Hide if in Modal */}
      {!isModal && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Holiday List
            </h1>
            <p className="text-text-secondary">
              Official holidays for the current year
            </p>
            {error && <p className="text-status-error text-sm mt-1">{error}</p>}
          </div>

          {isAdminOrHR && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-secondary transition-colors"
            >
              <Plus size={18} />
              Add Holiday
            </button>
          )}
        </div>
      )}

      {/* If in modal, show Add button and Error differently or rely on parent? 
          Actually, let's keep the Add button accessible in modal too, maybe just simpler.
      */}
      {isModal && isAdminOrHR && (
        <div className="flex justify-between items-center mb-4">
          {error && <p className="text-status-error text-sm">{error}</p>}
          {!error && <span />} {/* Spacer */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 bg-brand-primary text-white px-3 py-1.5 text-sm rounded-lg hover:bg-brand-secondary transition-colors"
          >
            <Plus size={16} />
            Add Holiday
          </button>
        </div>
      )}

      {/* Add Form */}
      {isAdding && isAdminOrHR && (
        <form
          onSubmit={handleAddHoliday}
          className="bg-bg-card p-4 rounded-lg border border-border shadow-sm flex flex-wrap gap-4 items-end animate-in slide-in-from-top-2"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">
              Holiday Name
            </label>
            <input
              required
              type="text"
              className="w-full p-2 rounded border border-border bg-bg-main"
              value={newHoliday.name}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, name: e.target.value })
              }
              placeholder="e.g. Independence Day"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Date</label>
            <DatePicker
              required
              className="w-full p-2 rounded border border-border bg-bg-main"
              value={newHoliday.date}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, date: e.target.value })
              }
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full p-2 rounded border border-border bg-bg-main"
              value={newHoliday.type}
              onChange={(e) =>
                setNewHoliday({ ...newHoliday, type: e.target.value })
              }
            >
              <option value="Public">Public Holiday</option>
              <option value="Optional">Optional</option>
              <option value="Weekend">Weekend</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-status-success text-white rounded hover:bg-status-success/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-bg-hover text-text-primary rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <Table columns={columns} data={holidays} isLoading={loading} />
    </div>
  );
}
