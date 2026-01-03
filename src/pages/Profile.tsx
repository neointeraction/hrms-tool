import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/common/Modal";
import { useAuth } from "../context/AuthContext";
import { apiService, ASSET_BASE_URL } from "../services/api.service";
import { formatDate } from "../utils/dateUtils";
import {
  User,
  Mail,
  Briefcase,
  Building2,
  Save,
  MapPin,
  Calendar,
  Phone,
  IdCard,
  Heart,
  X,
  Lock,
  Camera,
  Globe,
  Award,
  BookOpen,
  Users2,
  AlertTriangle,
  Monitor,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { DatePicker } from "../components/common/DatePicker";
import { Input } from "../components/common/Input";
import { DocumentsTab } from "../features/employee/components/DocumentsTab";
import { AssetsTab } from "../features/employee/components/AssetsTab";
import { ChangePasswordModal } from "../components/common/ChangePasswordModal";
import { cn } from "../utils/cn";
import { Select } from "../components/common/Select";
import { Textarea } from "../components/common/Textarea";

const ALL_TABS = [
  "Basic Info",
  "Work Info",
  "Hierarchy",
  "Personal",
  "Identity",
  "Contact",
  "Bank Details",
  "Documents",
  "Assets",
  "Additional",
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  /*
   * Pre-filtering tabs based on modules.
   * "Documents" tab in profile should be accessible to everyone for their own docs,
   * regardless of the administrative "documents" module.
   */
  const TABS = ALL_TABS;

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employees] = useState<any[]>([]);

  const [profileData, setProfileData] = useState({
    // Basic
    employeeId: user?.id || "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    nickName: "",
    email: user?.email || "",

    // Work
    department: user?.department || "",
    location: "",
    designation: user?.designation || "",
    role: user?.role || "",
    shift: "",
    employmentType: "",
    employeeStatus: "Active",
    sourceOfHire: "",
    dateOfJoining: "",
    totalExperience: "",
    reportingManager: "",
    reportingManagerName: "",

    // Personal
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    aboutMe: "",
    expertise: "",

    // Identity
    uan: "",
    pan: "",
    aadhaar: "",

    // Contact
    workPhone: "",
    extension: "",
    seatingLocation: "",
    presentAddress: "",
    permanentAddress: "",
    personalMobile: "",
    personalEmail: "",

    // Additional
    workExperience: [],
    education: [],
    customFields: {},

    // Bank Details
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
    },
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current user details first (for basic auth/user info)
        const userResponse = await apiService.getCurrentUser();

        // Fetch specific employee profile for this user
        const employeeRecord = await apiService.getMyEmployeeProfile();

        if (employeeRecord) {
          setEmployeeId(employeeRecord._id);
          setProfileData({
            employeeId: employeeRecord.employeeId || "",
            firstName: employeeRecord.firstName || "",
            lastName: employeeRecord.lastName || "",
            nickName: employeeRecord.nickName || "",
            email: employeeRecord.email || "",
            department: employeeRecord.department || "",
            location: employeeRecord.location || "",
            designation: employeeRecord.designation || "",
            role: employeeRecord.role || "",
            shift: employeeRecord.shiftId?.name || "General Shift",
            employmentType: employeeRecord.employmentType || "",
            employeeStatus: employeeRecord.employeeStatus || "Active",
            sourceOfHire: employeeRecord.sourceOfHire || "",
            dateOfJoining: employeeRecord.dateOfJoining
              ? new Date(employeeRecord.dateOfJoining)
                  .toISOString()
                  .split("T")[0]
              : "",
            totalExperience: employeeRecord.totalExperience || "",
            reportingManager:
              employeeRecord.reportingManager?._id ||
              employeeRecord.reportingManager ||
              "",
            reportingManagerName: employeeRecord.reportingManager?.firstName
              ? `${employeeRecord.reportingManager.firstName} ${
                  employeeRecord.reportingManager.lastName || ""
                }`
              : "",
            dateOfBirth: employeeRecord.dateOfBirth
              ? new Date(employeeRecord.dateOfBirth).toISOString().split("T")[0]
              : "",
            gender: employeeRecord.gender || "",
            maritalStatus: employeeRecord.maritalStatus || "",
            aboutMe: employeeRecord.aboutMe || "",
            expertise: employeeRecord.expertise || "",
            uan: employeeRecord.uan || "",
            pan: employeeRecord.pan || "",
            aadhaar: employeeRecord.aadhaar || "",
            workPhone: employeeRecord.workPhone || "",
            extension: employeeRecord.extension || "",
            seatingLocation: employeeRecord.seatingLocation || "",
            presentAddress: employeeRecord.presentAddress || "",
            permanentAddress: employeeRecord.permanentAddress || "",
            personalMobile: employeeRecord.personalMobile || "",
            personalEmail: employeeRecord.personalEmail || "",
            workExperience: employeeRecord.workExperience || [],
            education: employeeRecord.education || [],
            customFields: employeeRecord.customFields || {},
            bankDetails: employeeRecord.bankDetails || {
              accountName: "",
              accountNumber: "",
              bankName: "",
              ifscCode: "",
            },
          });

          if (employeeRecord.profilePicture) {
            setPreviewUrl(
              employeeRecord.profilePicture.startsWith("http")
                ? employeeRecord.profilePicture
                : `${ASSET_BASE_URL}/${employeeRecord.profilePicture}`
            );
          }
        } else {
          // Fallback if no employee record (e.g. pure Admin user)
          console.warn("No employee record found for current user");
          // We can pre-fill from user object if needed, but Profile page implies Employee profile.
          setProfileData((prev) => ({
            ...prev,
            email: userResponse.user.email,
            firstName: userResponse.user.name?.split(" ")[0] || "",
            lastName:
              userResponse.user.name?.split(" ").slice(1).join(" ") || "",
          }));
        }
      } catch (err: any) {
        console.error("Failed to fetch employee data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!employeeId) {
      alert("Employee ID not found. Cannot update profile.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();

      Object.keys(profileData).forEach((key) => {
        const value = (profileData as any)[key];
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === "bankDetails" || key === "customFields") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      await apiService.updateEmployee(employeeId, formData);
      setIsEditing(false);
      await refreshUser();
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      alert(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
  };

  const handlePasswordChange = async (data: any) => {
    await apiService.updateCurrentUser(data);
    setShowSuccessModal(true); // Re-using success modal or create new one?
    // The existing success modal says "Profile Updated!", which is generic enough.
  };

  const handleBankDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev: any) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleArrayChange = (
    arrayName: string,
    index: number,
    field: string,
    value: any
  ) => {
    setProfileData((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName: string, initialItem: any) => {
    setProfileData((prev: any) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], initialItem],
    }));
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    setProfileData((prev: any) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_: any, i: number) => i !== index),
    }));
  };

  const renderField = (
    label: string,
    name: string,
    value: string,
    icon?: any,
    type = "text",
    readOnly = false
  ) => {
    const Icon = icon;
    return (
      <div className="group">
        <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          {Icon && <Icon size={14} className="text-brand-primary" />}
          {label}
        </label>
        {isEditing ? (
          type === "date" ? (
            <DatePicker
              name={name}
              value={value}
              onChange={handleChange}
              disabled={readOnly}
              className={readOnly ? "opacity-75 cursor-not-allowed" : ""}
            />
          ) : (
            <Input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              className="bg-bg-main"
              disabled={readOnly}
            />
          )
        ) : (
          <p className="text-text-primary text-sm font-medium leading-relaxed break-words min-h-[24px]">
            {type === "date" ? (
              value ? (
                formatDate(value)
              ) : (
                <span className="text-text-disabled">Not Set</span>
              )
            ) : (
              value || <span className="text-text-disabled">Not Set</span>
            )}
          </p>
        )}
      </div>
    );
  };

  const renderTextArea = (label: string, name: string, value: string) => {
    return (
      <div className="col-span-1 md:col-span-2 group">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
          {label}
        </label>
        {isEditing ? (
          <Textarea
            name={name}
            value={value}
            onChange={handleChange}
            className="bg-bg-main"
            rows={4}
          />
        ) : (
          <p className="text-text-primary text-sm whitespace-pre-wrap leading-relaxed bg-bg-main/50 p-4 rounded-lg border border-border/50">
            {value || (
              <span className="text-text-disabled">No Description</span>
            )}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen pb-8 animate-in fade-in duration-500 bg-gray-50/30 dark:bg-bg-main">
      {/* Header with Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
            <p className="text-text-secondary mt-1">
              Manage your personal information
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isEditing ? (
              <>
                <Button
                  variant="secondary"
                  leftIcon={<Lock size={16} />}
                  onClick={() => setShowChangePasswordModal(true)}
                >
                  Change Password
                </Button>
                <Button
                  className="shadow-sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="bg-bg-card border border-border shadow-sm hover:bg-bg-hover"
                  onClick={handleCancel}
                  disabled={saving}
                  leftIcon={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  className="shadow-sm"
                  onClick={handleSave}
                  disabled={saving}
                  isLoading={saving}
                  leftIcon={!saving && <Save size={16} />}
                >
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
            <p className="font-medium">Failed to load profile</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Profile Summary Card - Full Width Top */}
        <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-bg-card shadow-lg overflow-hidden bg-brand-secondary flex items-center justify-center text-white text-4xl font-bold dark:border-border">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {profileData.firstName?.[0]}
                    {profileData.lastName?.[0]}
                  </span>
                )}
              </div>
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <Camera className="text-white drop-shadow-lg" size={32} />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-text-secondary font-medium text-lg mt-1">
                    {profileData.designation}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="text-xs font-semibold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full inline-block">
                      {profileData.role}
                    </div>
                    <div
                      className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                        profileData.employeeStatus === "Active"
                          ? "text-green-700 bg-green-50 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                          : "text-gray-700 bg-gray-50 border border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20"
                      }`}
                    >
                      {profileData.employeeStatus}
                    </div>
                  </div>
                </div>

                {/* Key Details Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 md:bg-gray-50/50 md:p-4 md:rounded-lg md:border md:border-border dark:md:bg-white/5">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 dark:bg-blue-900/20 dark:text-blue-400">
                      <IdCard size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Employee ID
                      </p>
                      <span className="font-medium text-text-primary">
                        {profileData.employeeId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0 dark:bg-purple-900/20 dark:text-purple-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Joined On
                      </p>
                      <span className="font-medium text-text-primary">
                        {profileData.dateOfJoining
                          ? formatDate(profileData.dateOfJoining)
                          : "Not Set"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 dark:bg-green-900/20 dark:text-green-400">
                      <Users2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Reporting To
                      </p>
                      <span
                        className="font-medium text-text-primary truncate max-w-[120px] block"
                        title={profileData.reportingManagerName}
                      >
                        {profileData.reportingManagerName || "None"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shrink-0 dark:bg-orange-900/20 dark:text-orange-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Location
                      </p>
                      <span
                        className="font-medium text-text-primary truncate max-w-[120px] block"
                        title={profileData.location}
                      >
                        {profileData.location || "Not Set"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 shrink-0 dark:bg-pink-900/20 dark:text-pink-400">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Email
                      </p>
                      <span
                        className="font-medium text-text-primary truncate max-w-[120px] block"
                        title={profileData.email}
                      >
                        {profileData.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 dark:bg-indigo-900/20 dark:text-indigo-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-xs text-text-muted font-medium">
                        Work Phone
                      </p>
                      <span className="font-medium text-text-primary">
                        {profileData.workPhone || "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Vertical Tabs Navigation */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-bg-card rounded-xl shadow-sm border border-border p-3 sticky top-6">
              <nav className="space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all group flex items-center justify-between",
                      activeTab === tab
                        ? "bg-brand-primary text-white shadow-sm"
                        : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6 min-h-[600px]">
              {activeTab === "Basic Info" && (
                <div className="space-y-6">
                  <SectionHeader title="Basic Details" icon={User} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {renderField(
                      "First Name",
                      "firstName",
                      profileData.firstName
                    )}
                    {renderField("Last Name", "lastName", profileData.lastName)}
                    {renderField("Nick Name", "nickName", profileData.nickName)}
                    {renderField(
                      "Email",
                      "email",
                      profileData.email,
                      Mail,
                      "email",
                      true
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Work Info" && (
                <div className="space-y-6">
                  <SectionHeader title="Employment Details" icon={Briefcase} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {renderField(
                      "Department",
                      "department",
                      profileData.department,
                      Building2,
                      "text",
                      true
                    )}
                    {renderField(
                      "Location",
                      "location",
                      profileData.location,
                      MapPin,
                      "text",
                      true
                    )}
                    {renderField(
                      "Designation",
                      "designation",
                      profileData.designation,
                      Award,
                      "text",
                      true
                    )}
                    {renderField(
                      "Role",
                      "role",
                      profileData.role,
                      Users2,
                      "text",
                      true
                    )}
                    {renderField(
                      "Shift",
                      "shift",
                      profileData.shift,
                      Clock, // Using Clock icon logic or similar, I need to check if Clock is imported. It is imported.
                      "text",
                      true
                    )}
                    {renderField(
                      "Employment Type",
                      "employmentType",
                      profileData.employmentType,
                      undefined,
                      "text",
                      true
                    )}
                    {renderField(
                      "Employee Status",
                      "employeeStatus",
                      profileData.employeeStatus,
                      AlertTriangle,
                      "text",
                      true
                    )}
                    {renderField(
                      "Source of Hire",
                      "sourceOfHire",
                      profileData.sourceOfHire,
                      Globe,
                      "text",
                      true
                    )}
                    {renderField(
                      "Date of Joining",
                      "dateOfJoining",
                      profileData.dateOfJoining,
                      Calendar,
                      "date",
                      true
                    )}
                    {renderField(
                      "Total Experience",
                      "totalExperience",
                      profileData.totalExperience,
                      BookOpen,
                      "text",
                      true
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Hierarchy" && (
                <div className="space-y-6">
                  <SectionHeader title="Reporting Structure" icon={Users2} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="group">
                      <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                        <Users2 size={14} className="text-brand-primary" />
                        Reporting Manager
                      </label>
                      {isEditing ? (
                        <div className="relative">
                          <Select
                            name="reportingManager"
                            value={profileData.reportingManager || ""}
                            onChange={(value) =>
                              handleChange({
                                target: { name: "reportingManager", value },
                              } as any)
                            }
                            options={[
                              { value: "", label: "Select Manager" },
                              ...employees
                                .filter((emp) => emp._id !== employeeId)
                                .map((emp) => ({
                                  value: emp._id,
                                  label: `${emp.firstName} ${emp.lastName} (${emp.employeeId})`,
                                })),
                            ]}
                            disabled={true}
                            triggerClassName="bg-bg-main opacity-75 cursor-not-allowed"
                          />
                        </div>
                      ) : (
                        <p className="text-text-primary text-sm font-medium leading-relaxed">
                          {profileData.reportingManagerName || (
                            <span className="text-text-disabled">None</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Personal" && (
                <div className="space-y-6">
                  <SectionHeader title="Personal Information" icon={Heart} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {renderField(
                      "Date of Birth",
                      "dateOfBirth",
                      profileData.dateOfBirth,
                      Calendar,
                      "date"
                    )}
                    {renderField("Gender", "gender", profileData.gender)}
                    {renderField(
                      "Marital Status",
                      "maritalStatus",
                      profileData.maritalStatus
                    )}
                    <div className="col-span-full border-t border-border my-2"></div>
                    {renderTextArea("About Me", "aboutMe", profileData.aboutMe)}
                    {renderTextArea(
                      "Expertise / Ask Me About",
                      "expertise",
                      profileData.expertise
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Contact" && (
                <div className="space-y-6">
                  <SectionHeader title="Contact Information" icon={Phone} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {renderField(
                      "Work Phone",
                      "workPhone",
                      profileData.workPhone
                    )}
                    {renderField(
                      "Extension",
                      "extension",
                      profileData.extension
                    )}
                    {renderField(
                      "Seating Location",
                      "seatingLocation",
                      profileData.seatingLocation,
                      MapPin
                    )}
                    {renderField(
                      "Personal Mobile",
                      "personalMobile",
                      profileData.personalMobile
                    )}
                    {renderField(
                      "Personal Email",
                      "personalEmail",
                      profileData.personalEmail,
                      Mail
                    )}
                    <div className="col-span-full border-t border-border my-2"></div>
                    {renderTextArea(
                      "Present Address",
                      "presentAddress",
                      profileData.presentAddress
                    )}
                    {renderTextArea(
                      "Permanent Address",
                      "permanentAddress",
                      profileData.permanentAddress
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Identity" && (
                <div className="space-y-6">
                  <SectionHeader title="Identity Documents" icon={IdCard} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    {renderField("UAN", "uan", profileData.uan)}
                    {renderField("PAN", "pan", profileData.pan)}
                    {renderField("Aadhaar", "aadhaar", profileData.aadhaar)}
                  </div>
                </div>
              )}

              {activeTab === "Bank Details" && (
                <div className="space-y-6">
                  <SectionHeader
                    title="Financial Information"
                    icon={Building2}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                    <InputField
                      label="Account Name"
                      name="accountName"
                      value={profileData.bankDetails?.accountName}
                      onChange={handleBankDetailChange}
                      isEditing={isEditing}
                    />
                    <InputField
                      label="Account Number"
                      name="accountNumber"
                      value={profileData.bankDetails?.accountNumber}
                      onChange={handleBankDetailChange}
                      isEditing={isEditing}
                    />
                    <InputField
                      label="Bank Name"
                      name="bankName"
                      value={profileData.bankDetails?.bankName}
                      onChange={handleBankDetailChange}
                      isEditing={isEditing}
                    />
                    <InputField
                      label="IFSC Code"
                      name="ifscCode"
                      value={profileData.bankDetails?.ifscCode}
                      onChange={handleBankDetailChange}
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              )}

              {activeTab === "Documents" && (
                <DocumentsTab employeeId={employeeId || ""} />
              )}

              {activeTab === "Assets" && (
                <div className="space-y-6">
                  <SectionHeader title="My Assets" icon={Monitor} />
                  <AssetsTab employeeId={employeeId || ""} readOnly={true} />
                </div>
              )}

              {activeTab === "Additional" && (
                <div className="space-y-6">
                  <SectionHeader
                    title="Additional Information"
                    icon={BookOpen}
                  />

                  {/* Work Experience */}
                  <div className="bg-gray-50 dark:bg-gray-800/10 rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wide">
                        Work Experience
                      </h3>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            addArrayItem("workExperience", {
                              companyName: "",
                              jobTitle: "",
                              fromDate: "",
                              toDate: "",
                              description: "",
                            })
                          }
                          leftIcon={<Plus size={14} />}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                    {(profileData.workExperience || []).length === 0 ? (
                      <p className="text-sm text-text-secondary italic">
                        No work experience added.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profileData.workExperience.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="bg-bg-main border border-border rounded-lg p-4 relative"
                            >
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem("workExperience", index)
                                  }
                                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                  label="Company"
                                  name="companyName"
                                  value={item.companyName}
                                  onChange={(e: any) =>
                                    handleArrayChange(
                                      "workExperience",
                                      index,
                                      "companyName",
                                      e.target.value
                                    )
                                  }
                                  isEditing={isEditing}
                                />
                                <InputField
                                  label="Job Title"
                                  name="jobTitle"
                                  value={item.jobTitle}
                                  onChange={(e: any) =>
                                    handleArrayChange(
                                      "workExperience",
                                      index,
                                      "jobTitle",
                                      e.target.value
                                    )
                                  }
                                  isEditing={isEditing}
                                />
                                <div className="group">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                                    From Date
                                  </label>
                                  {isEditing ? (
                                    <DatePicker
                                      name="fromDate"
                                      value={
                                        item.fromDate
                                          ? item.fromDate.split("T")[0]
                                          : ""
                                      }
                                      onChange={(e: any) =>
                                        handleArrayChange(
                                          "workExperience",
                                          index,
                                          "fromDate",
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    <p className="text-text-primary text-sm font-medium leading-relaxed">
                                      {item.fromDate
                                        ? formatDate(item.fromDate)
                                        : "Not Set"}
                                    </p>
                                  )}
                                </div>
                                <div className="group">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                                    To Date
                                  </label>
                                  {isEditing ? (
                                    <DatePicker
                                      name="toDate"
                                      value={
                                        item.toDate
                                          ? item.toDate.split("T")[0]
                                          : ""
                                      }
                                      onChange={(e: any) =>
                                        handleArrayChange(
                                          "workExperience",
                                          index,
                                          "toDate",
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    <p className="text-text-primary text-sm font-medium leading-relaxed">
                                      {item.toDate
                                        ? formatDate(item.toDate)
                                        : "Not Set"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education */}
                  <div className="bg-gray-50 dark:bg-gray-800/10 rounded-lg p-4 border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wide">
                        Education
                      </h3>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            addArrayItem("education", {
                              instituteName: "",
                              degree: "",
                              specialization: "",
                              dateOfCompletion: "",
                            })
                          }
                          leftIcon={<Plus size={14} />}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                    {(profileData.education || []).length === 0 ? (
                      <p className="text-sm text-text-secondary italic">
                        No education details added.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {profileData.education.map(
                          (item: any, index: number) => (
                            <div
                              key={index}
                              className="bg-bg-main border border-border rounded-lg p-4 relative"
                            >
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem("education", index)
                                  }
                                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                  label="Institute"
                                  name="instituteName"
                                  value={item.instituteName}
                                  onChange={(e: any) =>
                                    handleArrayChange(
                                      "education",
                                      index,
                                      "instituteName",
                                      e.target.value
                                    )
                                  }
                                  isEditing={isEditing}
                                />
                                <InputField
                                  label="Degree"
                                  name="degree"
                                  value={item.degree}
                                  onChange={(e: any) =>
                                    handleArrayChange(
                                      "education",
                                      index,
                                      "degree",
                                      e.target.value
                                    )
                                  }
                                  isEditing={isEditing}
                                />
                                <InputField
                                  label="Specialization"
                                  name="specialization"
                                  value={item.specialization}
                                  onChange={(e: any) =>
                                    handleArrayChange(
                                      "education",
                                      index,
                                      "specialization",
                                      e.target.value
                                    )
                                  }
                                  isEditing={isEditing}
                                />
                                <div className="group">
                                  <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                                    Completion Date
                                  </label>
                                  {isEditing ? (
                                    <DatePicker
                                      name="dateOfCompletion"
                                      value={
                                        item.dateOfCompletion
                                          ? item.dateOfCompletion.split("T")[0]
                                          : ""
                                      }
                                      onChange={(e: any) =>
                                        handleArrayChange(
                                          "education",
                                          index,
                                          "dateOfCompletion",
                                          e.target.value
                                        )
                                      }
                                    />
                                  ) : (
                                    <p className="text-text-primary text-sm font-medium leading-relaxed">
                                      {item.dateOfCompletion
                                        ? formatDate(item.dateOfCompletion)
                                        : "Not Set"}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {!isEditing && (
          <div className="mt-8 border border-red-200 rounded-xl overflow-hidden bg-white shadow-sm dark:bg-bg-card dark:border-red-900/50">
            <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 dark:bg-red-900/10 dark:border-red-900/30">
              <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 dark:text-red-400">
                <AlertTriangle
                  className="text-red-600 dark:text-red-400"
                  size={20}
                />
                Danger Zone
              </h3>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-text-primary">
                  Resign from your position
                </h4>
                <p className="text-sm text-gray-500 mt-1 max-w-xl dark:text-text-secondary">
                  Initiating this action will start the formal resignation
                  process. This action cannot be undone once approved.
                </p>
              </div>
              <Button
                variant="danger"
                className="shrink-0 bg-red-600 border border-red-600 text-white hover:bg-red-700 hover:border-red-700 shadow-sm dark:hover:bg-red-800"
                onClick={() => navigate("/resignation/submit")}
              >
                Submit Resignation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Profile Updated"
        maxWidth="max-w-sm"
        hideHeader
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save size={24} />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Profile Updated!
          </h3>
          <p className="text-text-secondary text-sm mb-6">
            Your profile changes have been saved successfully.
          </p>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSubmit={handlePasswordChange}
      />
    </div>
  );
}

// Helper Components
const SectionHeader = ({ title, icon: Icon, className }: any) => (
  <div
    className={cn(
      "flex items-center gap-2 mb-4 pb-2 border-b border-border",
      className
    )}
  >
    {Icon && <Icon size={18} className="text-brand-primary" />}
    <h3 className="text-base font-semibold text-text-primary">{title}</h3>
  </div>
);

const InputField = ({ label, name, value, onChange, isEditing }: any) => (
  <div className="group">
    <label className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
      {label}
    </label>
    {isEditing ? (
      <Input
        name={name}
        value={value}
        onChange={onChange}
        className="bg-bg-main"
      />
    ) : (
      <p className="text-text-primary text-sm font-medium leading-relaxed">
        {value || (
          <span className="text-text-disabled text-xs normal-case">
            Not Set
          </span>
        )}
      </p>
    )}
  </div>
);

const ProfileSkeleton = () => (
  <div className="min-h-screen pb-8 animate-pulse bg-gray-50/30 dark:bg-bg-main">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded dark:bg-gray-700" />
          <div className="h-4 w-64 bg-gray-100 rounded dark:bg-gray-800" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-gray-200 rounded-lg dark:bg-gray-700" />
          <div className="h-9 w-32 bg-gray-200 rounded-lg dark:bg-gray-700" />
        </div>
      </div>

      {/* Header Card Skeleton */}
      <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 shrink-0 dark:bg-gray-700" />
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="space-y-3 text-center md:text-left">
                <div className="h-8 w-64 bg-gray-200 rounded mx-auto md:mx-0 dark:bg-gray-700" />
                <div className="h-5 w-48 bg-gray-100 rounded mx-auto md:mx-0 dark:bg-gray-800" />
                <div className="h-6 w-24 bg-gray-100 rounded-full mx-auto md:mx-0 dark:bg-gray-800" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700" />
              <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700" />
              <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-bg-card rounded-xl shadow-sm border border-border p-3 h-96">
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-lg w-full dark:bg-gray-800"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-9">
          <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6 h-[600px]">
            <div className="h-6 w-48 bg-gray-200 rounded mb-8 dark:bg-gray-700" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-100 rounded dark:bg-gray-800" />
                  <div className="h-10 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-800" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
