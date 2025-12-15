import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Award, Trash2, Upload, Edit2, X } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../services/api.service";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { Modal } from "../components/common/Modal";
import { Select } from "../components/common/Select";
import { Input } from "../components/common/Input";

interface Badge {
  _id: string;
  title: string;
  icon: string;
}

interface Appreciation {
  _id: string;
  sender: { firstName: string; lastName: string };
  recipient: { firstName: string; lastName: string };
  badge: Badge;
  message: string;
  createdAt: string;
}

interface EmployeeOption {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  firstName: string;
  lastName: string;
}

export default function Appreciation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdminOrHR = user?.role === "Admin" || user?.role === "HR";

  // Data State
  const [badges, setBadges] = useState<Badge[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [colleagues, setColleagues] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Send Appreciation State
  const [selectedColleague, setSelectedColleague] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Admin Badge Management State
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newBadgeTitle, setNewBadgeTitle] = useState("");
  const [newBadgeFile, setNewBadgeFile] = useState<File | null>(null);
  const [badgeUploading, setBadgeUploading] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [badgesData, appreciationsData, employeesData] = await Promise.all([
        apiService.getBadges(),
        apiService.getAppreciations(),
        apiService.getEmployees(),
      ]);

      setBadges(badgesData);
      setAppreciations(appreciationsData);
      setColleagues(
        employeesData.filter(
          (emp: any) => emp.user && emp.user._id !== user?.id
        )
      );
    } catch (error) {
      console.error("Failed to fetch appreciation data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedColleague || !selectedBadge) return;

    try {
      setSending(true);
      await apiService.createAppreciation({
        recipientId: selectedColleague,
        badgeId: selectedBadge,
        message,
      });
      setShowSuccessModal(true);
      // Reset form
      setSelectedColleague("");
      setSelectedBadge("");
      setMessage("");
      // Refresh list
      const updatedAppreciations = await apiService.getAppreciations();
      setAppreciations(updatedAppreciations);
    } catch (error) {
      console.error("Failed to send appreciation", error);
    } finally {
      setSending(false);
    }
  };

  const handleBadgeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBadgeTitle || (!newBadgeFile && !editingBadgeId)) return;

    try {
      setBadgeUploading(true);
      const formData = new FormData();
      formData.append("title", newBadgeTitle);
      if (newBadgeFile) {
        formData.append("icon", newBadgeFile);
      }

      if (editingBadgeId) {
        await apiService.updateBadge(editingBadgeId, formData);
      } else {
        await apiService.createBadge(formData);
      }

      // Refresh badges
      const updatedBadges = await apiService.getBadges();
      setBadges(updatedBadges);

      // Reset management form
      setNewBadgeTitle("");
      setNewBadgeFile(null);
      setEditingBadgeId(null);
    } catch (error) {
      console.error("Failed to save badge", error);
    } finally {
      setBadgeUploading(false);
    }
  };

  const handleEditClick = (badge: Badge) => {
    setEditingBadgeId(badge._id);
    setNewBadgeTitle(badge.title);
    setNewBadgeFile(null); // Keep existing unless changed
  };

  const handleCancelEdit = () => {
    setEditingBadgeId(null);
    setNewBadgeTitle("");
    setNewBadgeFile(null);
  };

  const handleDeleteClick = (badgeId: string) => {
    setBadgeToDelete(badgeId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBadge = async () => {
    if (!badgeToDelete) return;

    try {
      await apiService.deleteBadge(badgeToDelete);
      setBadges(badges.filter((b) => b._id !== badgeToDelete));
      setShowDeleteConfirm(false);
      setBadgeToDelete(null);
    } catch (error) {
      console.error("Failed to delete badge", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/miscellaneous")}
            leftIcon={<ChevronLeft size={20} />}
            style={{ paddingRight: "0", paddingLeft: "0" }}
          />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Appreciation Center
            </h1>
            <p className="text-text-secondary">
              Recognize and celebrate your colleagues
            </p>
          </div>
        </div>
        {isAdminOrHR && (
          <Button
            onClick={() => setIsManageModalOpen(true)}
            leftIcon={<Award size={18} />}
          >
            Manage Badges
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Appreciation Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Award className="text-brand-primary" size={20} />
              Send Appreciation
            </h2>

            <form onSubmit={handleSendAppreciation} className="space-y-4">
              <div>
                <Select
                  label="Recipient"
                  value={selectedColleague}
                  onChange={(val) => setSelectedColleague(val as string)}
                  options={colleagues.map((emp) => ({
                    value: emp.user._id,
                    label: `${emp.firstName} ${emp.lastName}`,
                  }))}
                  placeholder="Select a colleague..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Select Badge
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                  {badges.map((badge) => (
                    <div
                      key={badge._id}
                      onClick={() => setSelectedBadge(badge._id)}
                      className={`cursor-pointer rounded-lg p-2 border transition-all flex flex-col items-center gap-1 text-center ${
                        selectedBadge === badge._id
                          ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary"
                          : "border-border hover:border-brand-primary/50"
                      }`}
                    >
                      <img
                        src={
                          badge.icon.startsWith("http")
                            ? badge.icon
                            : `${ASSET_BASE_URL}${badge.icon}`
                        }
                        alt={badge.title}
                        className="w-8 h-8 object-contain"
                      />
                      <span className="text-[10px] font-medium truncate w-full">
                        {badge.title}
                      </span>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <div className="col-span-3 text-center py-4 text-xs text-text-muted">
                      No badges available.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Why are you appreciating them?"
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none h-24"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={sending || !selectedColleague || !selectedBadge}
                isLoading={sending}
              >
                Send Appreciation
              </Button>
            </form>
          </div>
        </div>

        {/* Recent Appreciations Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Recent Appreciations
          </h2>

          <div className="space-y-4">
            {appreciations.map((appr) => (
              <div
                key={appr._id}
                className="bg-bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2"
              >
                {/* Badge Icon */}
                <div className="flex-shrink-0 bg-brand-primary/5 rounded-full p-2 border border-brand-primary/10">
                  {appr.badge ? (
                    <img
                      src={
                        appr.badge.icon.startsWith("http")
                          ? appr.badge.icon
                          : `${ASSET_BASE_URL}${appr.badge.icon}`
                      }
                      alt={appr.badge.title}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Award className="w-5 h-5 text-text-muted opacity-50" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-text-primary font-medium text-base truncate">
                        <span className="font-bold text-brand-primary">
                          {appr.recipient.firstName} {appr.recipient.lastName}
                        </span>
                        <span className="text-text-secondary font-normal mx-1">
                          recieved
                        </span>
                        <span className="font-semibold text-text-primary">
                          {appr.badge?.title || "Unknown Badge"}
                        </span>
                      </p>
                      <p className="text-sm text-text-secondary mt-0.5 truncate">
                        from {appr.sender.firstName} {appr.sender.lastName}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap pt-1">
                      {new Date(appr.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {appr.message && (
                    <div className="mt-2 bg-bg-main p-3 rounded-lg text-sm text-text-secondary italic border border-border/50 break-words">
                      "{appr.message}"
                    </div>
                  )}
                </div>
              </div>
            ))}

            {appreciations.length === 0 && !loading && (
              <div className="text-center py-12 text-text-secondary bg-bg-main rounded-xl border border-border border-dashed">
                <Award size={32} className="mx-auto mb-2 opacity-50" />
                <p>No appreciations yet. Be the first to recognize someone!</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12 text-text-secondary">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin: Manage Badges Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Manage Badges"
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add New Badge Form */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-semibold text-text-primary">
                {editingBadgeId ? "Edit Badge" : "Add New Badge"}
              </h3>
              {editingBadgeId && (
                <button
                  onClick={handleCancelEdit}
                  className="text-xs flex items-center gap-1 text-text-secondary hover:text-text-primary"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleBadgeUpload} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Badge Title
                </label>
                <Input
                  value={newBadgeTitle}
                  onChange={(e) => setNewBadgeTitle(e.target.value)}
                  placeholder="e.g. Star Performer"
                  className="bg-bg-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Icon (SVG/PNG)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-bg-main hover:bg-bg-hover transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {newBadgeFile ? (
                        <>
                          <p className="mb-2 text-sm text-brand-primary font-semibold">
                            {newBadgeFile.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-text-muted" />
                          <p className="mb-2 text-sm text-text-secondary">
                            <span className="font-semibold">
                              Click to upload
                            </span>
                          </p>
                          <p className="text-xs text-text-muted">
                            SVG, PNG (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && setNewBadgeFile(e.target.files[0])
                      }
                      required={!editingBadgeId}
                    />
                  </label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={badgeUploading}
                isLoading={badgeUploading}
              >
                {editingBadgeId ? "Update Badge" : "Upload Badge"}
              </Button>
            </form>
          </div>

          {/* List Existing Badges */}
          <div className="space-y-4">
            <h3 className="font-semibold text-text-primary border-b border-border pb-2">
              Existing Badges
            </h3>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
              {badges.map((badge) => (
                <div
                  key={badge._id}
                  className="flex items-center justify-between p-3 bg-bg-main rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        badge.icon.startsWith("http")
                          ? badge.icon
                          : `${ASSET_BASE_URL}${badge.icon}`
                      }
                      alt={badge.title}
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {badge.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(badge)}
                      className="p-1.5 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(badge._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {badges.length === 0 && (
                <p className="text-sm text-text-muted text-center py-4">
                  No badges added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBadgeToDelete(null);
        }}
        onConfirm={confirmDeleteBadge}
        title="Delete Badge?"
        message="Are you sure? This will not remove past appreciations but will prevent new ones."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Appreciation Sent!"
        message="Your appreciation badge has been successfully delivered to your colleague."
        confirmText="Awesome!"
        variant="success"
        showCancel={false}
      />
    </div>
  );
}
