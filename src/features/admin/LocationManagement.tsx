import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  Users,
} from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Modal } from "../../components/common/Modal";
import { Table } from "../../components/common/Table";

import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Skeleton } from "../../components/common/Skeleton";

interface LocationStats {
  total: number;
  active: number;
  inactive: number;
  locationCounts: Record<string, number>;
}

const LocationSkeleton = () => (
  <div className="space-y-6 animate-in fade-in duration-500">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    {/* Stats Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>

    {/* Table Skeleton */}
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex gap-4">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-6 w-1/4" />
        </div>
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function LocationManagement() {
  const [locations, setLocations] = useState<any[]>([]);
  const [stats, setStats] = useState<LocationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    isHeadquarters: false,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const [data, statsData] = await Promise.all([
        apiService.getLocations(),
        apiService.getLocationStats(),
      ]);
      setLocations(data);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to fetch locations", error);
      // alert("Failed to load locations"); // Silent fail for fetch
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await apiService.updateLocation(editingLocation._id, formData);
        setSuccessMessage("Location updated successfully");
        setIsSuccessModalOpen(true);
      } else {
        await apiService.createLocation(formData);
        setSuccessMessage("Location created successfully");
        setIsSuccessModalOpen(true);
      }
      setIsModalOpen(false);
      fetchLocations();
      resetForm();
    } catch (error: any) {
      alert(error.message || "Failed to save location");
    }
  };

  const handleDelete = (id: string) => {
    setLocationToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;

    try {
      await apiService.deleteLocation(locationToDelete);
      setIsDeleteModalOpen(false);
      setSuccessMessage("Location deleted successfully");
      setIsSuccessModalOpen(true);
      fetchLocations();
      setLocationToDelete(null);
    } catch (error: any) {
      setIsDeleteModalOpen(false);
      alert(error.message || "Failed to delete location");
    }
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || "",
      city: location.city || "",
      country: location.country || "",
      isHeadquarters: location.isHeadquarters || false,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      country: "",
      isHeadquarters: false,
    });
  };

  const columns = [
    {
      header: "Location Name",
      accessorKey: "name",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
            <MapPin size={18} />
          </div>
          <div>
            <div className="font-medium text-text-primary">{row.name}</div>
            {row.isHeadquarters && (
              <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                Headquarters
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "City",
      accessorKey: "city",
    },
    {
      header: "Country",
      accessorKey: "country",
    },
    {
      header: "Address",
      accessorKey: "address",
      render: (row: any) => (
        <span className="text-sm text-text-secondary truncate max-w-xs block">
          {row.address || "-"}
        </span>
      ),
    },
    {
      header: "Employees",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Users size={16} className="text-text-secondary" />
          <span className="text-text-primary font-medium">
            {stats?.locationCounts[row.name] || 0}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "Active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 hover:bg-bg-hover rounded-lg transition-colors text-text-secondary hover:text-brand-primary"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-text-secondary hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LocationSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Location Management
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your organization's office locations
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus size={18} />}
        >
          Add Location
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Locations
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.total}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-status-success/10 rounded-lg text-status-success">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Active</p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.active}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-text-secondary/10 rounded-lg text-text-secondary">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Inactive
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {stats.inactive}
              </p>
            </div>
          </div>

          <div className="bg-bg-card p-4 rounded-xl border border-border shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">
                Total Assigned
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {Object.values(stats.locationCounts).reduce((a, b) => a + b, 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      <Table
        data={locations}
        columns={columns}
        emptyMessage="No locations found. Add your first office location."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingLocation ? "Edit Location" : "Add Location"}
        maxWidth="max-w-md"
        footer={
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLocation ? "Update Location" : "Add Location"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Headquarters, New York Office"
            required
          />
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="e.g. New York"
          />
          <Input
            label="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="e.g. USA"
          />
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Address
            </label>
            <textarea
              className="w-full px-3 py-2 bg-bg-main border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 text-text-primary"
              rows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Full address"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isHeadquarters"
              checked={formData.isHeadquarters}
              onChange={(e) =>
                setFormData({ ...formData, isHeadquarters: e.target.checked })
              }
              className="rounded border-border text-brand-primary focus:ring-brand-primary"
            />
            <label
              htmlFor="isHeadquarters"
              className="text-sm text-text-primary"
            >
              This is the Headquarters
            </label>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message="Are you sure you want to delete this location? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onConfirm={() => setIsSuccessModalOpen(false)}
        title="Success"
        message={successMessage}
        variant="success"
        confirmText="OK"
        showCancel={false}
      />
    </div>
  );
}
