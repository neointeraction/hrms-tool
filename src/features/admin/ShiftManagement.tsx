import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { Clock, Plus, Pencil, Trash2, Search, Filter } from "lucide-react";
import { Modal } from "../../components/common/Modal";
import { Input } from "../../components/common/Input";
import { Select } from "../../components/common/Select";
import { Table } from "../../components/common/Table";

import { Tooltip } from "../../components/common/Tooltip";

interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  gracePeriod: number;
  workingDays: string[];
  status: "active" | "inactive";
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ShiftManagement() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    breakDuration: 0,
    gracePeriod: 0,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    status: "active",
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getShifts();
      setShifts(data);
    } catch (error) {
      console.error("Failed to fetch shifts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleEdit = (shift: Shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakDuration: shift.breakDuration,
      gracePeriod: shift.gracePeriod,
      workingDays: shift.workingDays,
      status: shift.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await apiService.deleteShift(id);
        fetchShifts();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShift) {
        await apiService.updateShift(editingShift._id, formData);
      } else {
        await apiService.createShift(formData);
      }
      setIsModalOpen(false);
      fetchShifts();
      resetForm();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEditingShift(null);
    setFormData({
      name: "",
      startTime: "",
      endTime: "",
      breakDuration: 0,
      gracePeriod: 0,
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      status: "active",
    });
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => {
      const days = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const filteredShifts = shifts.filter((shift) =>
    shift.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Shift Name", accessorKey: "name" as keyof Shift },
    {
      header: "Timings",
      render: (shift: Shift) => (
        <span className="flex items-center gap-2">
          <Clock size={14} className="text-text-secondary" />
          {shift.startTime} - {shift.endTime}
        </span>
      ),
    },
    {
      header: "Working Days",
      render: (shift: Shift) => (
        <div className="flex flex-wrap gap-1">
          {shift.workingDays.map((day) => (
            <span
              key={day}
              className="text-xs px-2 py-0.5 bg-bg-hover rounded text-text-secondary"
            >
              {day.slice(0, 3)}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Status",
      render: (shift: Shift) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            shift.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (shift: Shift) => (
        <div className="flex items-center gap-2">
          <Tooltip content="Edit Shift">
            <button
              onClick={() => handleEdit(shift)}
              className="p-1 text-text-secondary hover:text-brand-primary transition-colors"
            >
              <Pencil size={18} />
            </button>
          </Tooltip>

          <Tooltip content="Delete Shift">
            <button
              onClick={() => handleDelete(shift._id)}
              className="p-1 text-text-secondary hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Shift Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage work shifts and timings
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add Shift
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-bg-card p-4 rounded-lg border border-border">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            size={20}
          />
          <input
            type="text"
            placeholder="Search shifts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-main border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-text-primary"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:bg-bg-hover rounded-lg transition-colors border border-border">
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Shifts List */}
      <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
        <Table
          data={filteredShifts}
          columns={columns}
          isLoading={loading}
          emptyMessage="No shifts found. Create your first shift to get started."
        />
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShift ? "Edit Shift" : "Add New Shift"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Shift Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. General Shift, Night Shift"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
            <Input
              label="End Time"
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Break Duration (mins)"
              type="number"
              value={formData.breakDuration}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  breakDuration: parseInt(e.target.value) || 0,
                })
              }
            />
            <Input
              label="Grace Period (mins)"
              type="number"
              value={formData.gracePeriod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  gracePeriod: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Working Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.workingDays.includes(day)
                      ? "bg-brand-primary text-white"
                      : "bg-bg-hover text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(value) =>
                setFormData({ ...formData, status: value as any })
              }
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-text-secondary hover:bg-bg-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              {editingShift ? "Update Shift" : "Create Shift"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
