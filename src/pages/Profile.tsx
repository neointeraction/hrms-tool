import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService, ASSET_BASE_URL } from "../services/api.service";
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
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  Users2,
  Landmark,
} from "lucide-react";
import { Button } from "../components/common/Button";
import { DatePicker } from "../components/common/DatePicker";
import { ConfirmationModal } from "../components/common/ConfirmationModal";

const TABS = [
  "Basic Info",
  "Work Info",
  "Personal",
  "Contact",
  "Identity",
  "Bank Details",
  "Additional",
];

export default function Profile() {
  const { user, refreshUser } = useAuth();
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

  // Fetch employee data on component mount
  useEffect(() => {
    const fetchEmployeeData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current user's employee record
        const response = await apiService.getCurrentUser();
        const userId = response.user.id || response.user._id;

        console.log("Profile: Current User ID:", userId);

        // Fetch all employees and find the current user's record
        const employeesResponse: any = await apiService.getEmployees();
        const allEmployees = Array.isArray(employeesResponse)
          ? employeesResponse
          : employeesResponse.employees || [];

        console.log("Profile: Total Employees:", allEmployees.length);

        const employeeRecord = allEmployees.find(
          (emp: any) =>
            (emp.user?._id || emp.user) === userId ||
            (emp.user?._id || emp.user)?.toString() === userId?.toString()
        );

        console.log(
          "Profile: Found Employee Record:",
          employeeRecord ? "Yes" : "No"
        );

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
            bankDetails: employeeRecord.bankDetails || {
              accountName: "",
              accountNumber: "",
              bankName: "",
              ifscCode: "",
            },
          });

          if (employeeRecord.profilePicture) {
            setPreviewUrl(`${ASSET_BASE_URL}/${employeeRecord.profilePicture}`);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch employee data:", err);
        setError(err.message || "Failed to load profile data");
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

      // Append all profile data
      Object.keys(profileData).forEach((key) => {
        const value = (profileData as any)[key];
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === "bankDetails") {
          formData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Append file if selected
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      await apiService.updateEmployee(employeeId, formData);
      setIsEditing(false);

      // Update global user state (Header, etc.)
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
    // Reset to original values
    setIsEditing(false);
    setSelectedFile(null);
    // Ideally revert previewUrl to original, but we need to store original URL.
    // For simplicity, we just keep current preview or could refetch.
  };

  const handleArrayChange = (
    arrayName: string,
    index: number,
    field: string,
    value: any
  ) => {
    setProfileData((prev) => {
      const newArray = [...(prev as any)[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName: string, initialItem: any) => {
    setProfileData((prev) => ({
      ...prev,
      [arrayName]: [...(prev as any)[arrayName], initialItem],
    }));
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    setProfileData((prev) => ({
      ...prev,
      [arrayName]: (prev as any)[arrayName].filter(
        (_: any, i: number) => i !== index
      ),
    }));
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

  const renderField = (
    label: string,
    name: string,
    value: string,
    icon?: any,
    type = "text"
  ) => {
    const Icon = icon;
    return (
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          {Icon && <Icon size={16} />}
          {label}
        </label>
        {isEditing ? (
          type === "date" ? (
            <DatePicker name={name} value={value} onChange={handleChange} />
          ) : (
            <input
              type={type}
              name={name}
              value={value}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          )
        ) : (
          <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
            {value || "N/A"}
          </p>
        )}
      </div>
    );
  };

  const renderTextArea = (label: string, name: string, value: string) => {
    return (
      <div className="col-span-2">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
        {isEditing ? (
          <textarea
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            rows={3}
          />
        ) : (
          <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg whitespace-pre-wrap">
            {value || "N/A"}
          </p>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <span className="ml-3 text-text-secondary">Loading profile...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Failed to load profile</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Profile Content */}
      {!loading && !error && (
        <>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                My Profile
              </h1>
              <p className="text-text-secondary mt-1">
                Manage your personal information
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving}
                  leftIcon={<X size={16} />}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  isLoading={saving}
                  leftIcon={!saving && <Save size={16} />}
                >
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Avatar Section */}
            <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border lg:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-brand-secondary flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-4 relative group">
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

                  {isEditing && (
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <span className="text-white text-xs font-medium">
                        Change Photo
                      </span>
                    </label>
                  )}
                </div>
                {/* ... Rest of avatar section */}
                <h3 className="text-lg font-semibold text-text-primary text-center">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-text-secondary capitalize">
                  {profileData.designation || user?.role}
                </p>
                <div className="mt-4 w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Employee ID</span>
                    <span className="font-medium text-text-primary">
                      {profileData.employeeId}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {profileData.employeeStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Role</span>
                    <span className="font-medium text-text-primary capitalize">
                      {profileData.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="lg:col-span-3 bg-bg-card rounded-lg shadow-sm border border-border">
              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Basic Info */}
                {activeTab === "Basic Info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                      "First Name",
                      "firstName",
                      profileData.firstName,
                      User
                    )}
                    {renderField(
                      "Last Name",
                      "lastName",
                      profileData.lastName,
                      User
                    )}
                    {renderField("Nick Name", "nickName", profileData.nickName)}
                    {renderField(
                      "Email Address",
                      "email",
                      profileData.email,
                      Mail,
                      "email"
                    )}
                  </div>
                )}

                {/* Work Info */}
                {activeTab === "Work Info" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                      "Department",
                      "department",
                      profileData.department,
                      Building2
                    )}
                    {renderField(
                      "Location",
                      "location",
                      profileData.location,
                      MapPin
                    )}
                    {renderField(
                      "Designation",
                      "designation",
                      profileData.designation,
                      Briefcase
                    )}
                    {renderField(
                      "Employment Type",
                      "employmentType",
                      profileData.employmentType
                    )}
                    {renderField(
                      "Source of Hire",
                      "sourceOfHire",
                      profileData.sourceOfHire
                    )}
                    {renderField(
                      "Date of Joining",
                      "dateOfJoining",
                      profileData.dateOfJoining,
                      Calendar,
                      "date"
                    )}
                    {renderField(
                      "Total Experience",
                      "totalExperience",
                      profileData.totalExperience
                    )}
                    {/* Reporting Manager - Custom Dropdown */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                        <Users2 size={16} />
                        Reporting Manager
                      </label>
                      {isEditing ? (
                        <select
                          name="reportingManager"
                          value={profileData.reportingManager || ""}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        >
                          <option value="">Select Manager</option>
                          {employees
                            .filter((emp) => emp._id !== employeeId)
                            .map((emp) => (
                              <option key={emp._id} value={emp._id}>
                                {emp.firstName} {emp.lastName} ({emp.employeeId}
                                )
                              </option>
                            ))}
                        </select>
                      ) : (
                        <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
                          {profileData.reportingManagerName || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Personal */}
                {activeTab === "Personal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      profileData.maritalStatus,
                      Heart
                    )}
                    {renderTextArea("About Me", "aboutMe", profileData.aboutMe)}
                    {renderTextArea(
                      "Expertise / Ask Me",
                      "expertise",
                      profileData.expertise
                    )}
                  </div>
                )}

                {/* Contact */}
                {activeTab === "Contact" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField(
                      "Work Phone",
                      "workPhone",
                      profileData.workPhone,
                      Phone
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
                      profileData.personalMobile,
                      Phone
                    )}
                    {renderField(
                      "Personal Email",
                      "personalEmail",
                      profileData.personalEmail,
                      Mail,
                      "email"
                    )}
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
                )}

                {/* Identity */}
                {activeTab === "Identity" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField("UAN", "uan", profileData.uan, IdCard)}
                    {renderField("PAN", "pan", profileData.pan, IdCard)}
                    {renderField(
                      "Aadhaar",
                      "aadhaar",
                      profileData.aadhaar,
                      IdCard
                    )}
                  </div>
                )}

                {/* Bank Details */}
                {activeTab === "Bank Details" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                        <User size={16} />
                        Account Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="accountName"
                          value={
                            (profileData as any).bankDetails?.accountName || ""
                          }
                          onChange={handleBankDetailChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      ) : (
                        <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
                          {(profileData as any).bankDetails?.accountName ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                        <IdCard size={16} />
                        Account Number
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="accountNumber"
                          value={
                            (profileData as any).bankDetails?.accountNumber ||
                            ""
                          }
                          onChange={handleBankDetailChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      ) : (
                        <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
                          {(profileData as any).bankDetails?.accountNumber ||
                            "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                        <Landmark size={16} />
                        Bank Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="bankName"
                          value={
                            (profileData as any).bankDetails?.bankName || ""
                          }
                          onChange={handleBankDetailChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      ) : (
                        <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
                          {(profileData as any).bankDetails?.bankName || "N/A"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
                        <Landmark size={16} />
                        IFSC Code
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="ifscCode"
                          value={
                            (profileData as any).bankDetails?.ifscCode || ""
                          }
                          onChange={handleBankDetailChange}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                        />
                      ) : (
                        <p className="text-text-primary px-3 py-2 bg-bg-main rounded-lg">
                          {(profileData as any).bankDetails?.ifscCode || "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional */}
                {activeTab === "Additional" && (
                  <div className="space-y-6">
                    {/* Work Experience */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                          <Briefcase size={18} />
                          Work Experience
                        </h3>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              addArrayItem("workExperience", {
                                companyName: "",
                                jobTitle: "",
                                fromDate: "",
                                toDate: "",
                                description: "",
                              })
                            }
                            className="text-brand-primary text-sm flex items-center gap-1 hover:text-brand-secondary"
                          >
                            <Plus size={16} /> Add Experience
                          </button>
                        )}
                      </div>
                      {profileData.workExperience.length === 0 ? (
                        <p className="text-text-secondary text-sm">
                          No work experience added yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {profileData.workExperience.map(
                            (exp: any, idx: number) =>
                              isEditing ? (
                                <div
                                  key={idx}
                                  className="border border-border rounded-lg p-4 relative"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayItem("workExperience", idx)
                                    }
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <div className="grid grid-cols-2 gap-3">
                                    <input
                                      type="text"
                                      placeholder="Company Name"
                                      value={exp.companyName || ""}
                                      onChange={(e) =>
                                        handleArrayChange(
                                          "workExperience",
                                          idx,
                                          "companyName",
                                          e.target.value
                                        )
                                      }
                                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Job Title"
                                      value={exp.jobTitle || ""}
                                      onChange={(e) =>
                                        handleArrayChange(
                                          "workExperience",
                                          idx,
                                          "jobTitle",
                                          e.target.value
                                        )
                                      }
                                      className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                    />
                                    <DatePicker
                                      placeholder="From Date"
                                      value={
                                        exp.fromDate
                                          ? new Date(exp.fromDate)
                                              .toISOString()
                                              .split("T")[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        handleArrayChange(
                                          "workExperience",
                                          idx,
                                          "fromDate",
                                          e.target.value
                                        )
                                      }
                                    />

                                    <DatePicker
                                      placeholder="To Date"
                                      value={
                                        exp.toDate
                                          ? new Date(exp.toDate)
                                              .toISOString()
                                              .split("T")[0]
                                          : ""
                                      }
                                      onChange={(e) =>
                                        handleArrayChange(
                                          "workExperience",
                                          idx,
                                          "toDate",
                                          e.target.value
                                        )
                                      }
                                    />

                                    <textarea
                                      placeholder="Description"
                                      value={exp.description || ""}
                                      onChange={(e) =>
                                        handleArrayChange(
                                          "workExperience",
                                          idx,
                                          "description",
                                          e.target.value
                                        )
                                      }
                                      className="col-span-2 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                      rows={2}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div
                                  key={idx}
                                  className="border border-border rounded-lg p-4 bg-bg-main"
                                >
                                  <div className="font-medium text-text-primary">
                                    {exp.jobTitle || "N/A"}
                                  </div>
                                  <div className="text-sm text-text-secondary">
                                    {exp.companyName || "N/A"}
                                  </div>
                                  <div className="text-xs text-text-muted mt-1">
                                    {exp.fromDate
                                      ? new Date(
                                          exp.fromDate
                                        ).toLocaleDateString()
                                      : "N/A"}{" "}
                                    -{" "}
                                    {exp.toDate
                                      ? new Date(
                                          exp.toDate
                                        ).toLocaleDateString()
                                      : "Present"}
                                  </div>
                                  {exp.description && (
                                    <div className="text-sm text-text-secondary mt-2">
                                      {exp.description}
                                    </div>
                                  )}
                                </div>
                              )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Education */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                          <GraduationCap size={18} />
                          Education
                        </h3>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              addArrayItem("education", {
                                instituteName: "",
                                degree: "",
                                specialization: "",
                                dateOfCompletion: "",
                              })
                            }
                            className="text-brand-primary text-sm flex items-center gap-1 hover:text-brand-secondary"
                          >
                            <Plus size={16} /> Add Education
                          </button>
                        )}
                      </div>
                      {profileData.education.length === 0 ? (
                        <p className="text-text-secondary text-sm">
                          No education records added yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {profileData.education.map((edu: any, idx: number) =>
                            isEditing ? (
                              <div
                                key={idx}
                                className="border border-border rounded-lg p-4 relative"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem("education", idx)
                                  }
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Institute Name"
                                    value={edu.instituteName || ""}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        "education",
                                        idx,
                                        "instituteName",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Degree"
                                    value={edu.degree || ""}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        "education",
                                        idx,
                                        "degree",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Specialization"
                                    value={edu.specialization || ""}
                                    onChange={(e) =>
                                      handleArrayChange(
                                        "education",
                                        idx,
                                        "specialization",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                  />
                                  <input
                                    type="date"
                                    placeholder="Date of Completion"
                                    value={
                                      edu.dateOfCompletion
                                        ? new Date(edu.dateOfCompletion)
                                            .toISOString()
                                            .split("T")[0]
                                        : ""
                                    }
                                    onChange={(e) =>
                                      handleArrayChange(
                                        "education",
                                        idx,
                                        "dateOfCompletion",
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div
                                key={idx}
                                className="border border-border rounded-lg p-4 bg-bg-main"
                              >
                                <div className="font-medium text-text-primary">
                                  {edu.degree || "N/A"}
                                </div>
                                <div className="text-sm text-text-secondary">
                                  {edu.instituteName || "N/A"}
                                </div>
                                <div className="text-xs text-text-muted mt-1">
                                  {edu.specialization || "N/A"} -{" "}
                                  {edu.dateOfCompletion
                                    ? new Date(
                                        edu.dateOfCompletion
                                      ).toLocaleDateString()
                                    : "N/A"}
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

          <ConfirmationModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            onConfirm={() => setShowSuccessModal(false)}
            title="Success"
            message="Profile updated successfully!"
            confirmText="OK"
            variant="info" // Changed from success to info to match type definition
            showCancel={false}
          />
        </>
      )}
    </div>
  );
}
