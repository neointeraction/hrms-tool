import { useState, useEffect } from "react";
import { Modal } from "../../components/common/Modal";
import { apiService, ASSET_BASE_URL } from "../../services/api.service";
import { PasswordInput } from "../../components/common/PasswordInput";
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  User,
  Briefcase,
  Network,
  UserCircle,
  Fingerprint,
  Phone,
  Landmark,
  LogOut,
  Grid,
  Monitor,
} from "lucide-react";
import { Select } from "../../components/common/Select";
import { DatePicker } from "../../components/common/DatePicker";
import { Input } from "../../components/common/Input";
import { DocumentsTab } from "./components/DocumentsTab";
import { AssetsTab } from "./components/AssetsTab";
import { useAuth } from "../../context/AuthContext";

interface AddEditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
  viewMode?: boolean;
}

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
  "Separation",
  "Additional",
];

const TAB_ICONS: Record<string, React.ElementType> = {
  "Basic Info": User,
  "Work Info": Briefcase,
  Hierarchy: Network,
  Personal: UserCircle,
  Identity: Fingerprint,
  Contact: Phone,
  "Bank Details": Landmark,
  Documents: FileText,
  Assets: Monitor,
  Separation: LogOut,
  Additional: Grid,
};

export default function AddEditEmployee({
  isOpen,
  onClose,
  employee,
  viewMode = false,
}: AddEditEmployeeProps) {
  const { user } = useAuth();

  const TABS = ALL_TABS.filter((tab) => {
    if (
      tab === "Documents" &&
      !user?.accessibleModules?.includes("documents")
    ) {
      return false;
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    // Basic
    employeeId: "",
    firstName: "",
    lastName: "",
    nickName: "",
    email: "",
    password: "", // For new employees
    // Work
    department: "",
    location: "",
    designation: "",
    designationId: "",
    shiftId: "",
    role: "",
    employmentType: "",
    employeeStatus: "Active",
    sourceOfHire: "",
    dateOfJoining: "",
    totalExperience: "",
    // Hierarchy
    reportingManager: "",
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
    // Separation
    dateOfExit: "",
    // Arrays
    workExperience: [],
    education: [],
    dependents: [],
    // Bank Details
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      if (employee) {
        setFormData({
          ...employee,
          reportingManager:
            employee.reportingManager?._id || employee.reportingManager || "",
          designationId: employee.designationId || "",
          shiftId: employee.shiftId?._id || employee.shiftId || "",
          dateOfJoining: employee.dateOfJoining
            ? employee.dateOfJoining.split("T")[0]
            : "",
          dateOfBirth: employee.dateOfBirth
            ? employee.dateOfBirth.split("T")[0]
            : "",
          dateOfExit: employee.dateOfExit
            ? employee.dateOfExit.split("T")[0]
            : "",
          bankDetails: employee.bankDetails || {
            accountName: "",
            accountNumber: "",
            bankName: "",
            ifscCode: "",
          },
        });
        if (employee.profilePicture) {
          setImagePreview(
            employee.profilePicture.startsWith("http")
              ? employee.profilePicture
              : `${ASSET_BASE_URL}/${employee.profilePicture}`
          );
        }
      } else {
        // Reset form
        setFormData({
          employeeId: "",
          firstName: "",
          lastName: "",
          nickName: "",
          email: "",
          password: "",
          department: "",
          location: "",
          designation: "",
          designationId: "",
          shiftId: "",
          role: "",
          employmentType: "",
          employeeStatus: "Active",
          sourceOfHire: "",
          dateOfJoining: "",
          totalExperience: "",
          reportingManager: "",
          dateOfBirth: "",
          gender: "",
          maritalStatus: "",
          aboutMe: "",
          expertise: "",
          uan: "",
          pan: "",
          aadhaar: "",
          workPhone: "",
          extension: "",
          seatingLocation: "",
          presentAddress: "",
          permanentAddress: "",
          personalMobile: "",
          personalEmail: "",
          dateOfExit: "",
          workExperience: [],
          education: [],
          dependents: [],
          bankDetails: {
            accountName: "",
            accountNumber: "",
            bankName: "",
            ifscCode: "",
          },
        });
        setProfileImage(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, employee]);

  const fetchDropdowns = async () => {
    try {
      console.log("Fetching roles and employees...");
      // Safely extract data whether it's an array or a response object
      const extractData = (response: any) => {
        if (Array.isArray(response)) return response;
        if (response && Array.isArray(response.data)) return response.data;
        if (response && Array.isArray(response.roles)) return response.roles; // Special case for roles
        if (response && Array.isArray(response.employees))
          return response.employees; // Special case for employees
        return [];
      };

      try {
        const rolesRes = await apiService.getRoles();
        setRoles(extractData(rolesRes));
      } catch (e) {
        console.error("Failed to fetch roles", e);
      }

      try {
        const empRes = await apiService.getEmployees();
        setManagers(extractData(empRes));
      } catch (e) {
        console.error("Failed to fetch employees", e);
      }

      try {
        const desRes = await apiService.getDesignations();
        setDesignations(extractData(desRes));
      } catch (e) {
        console.error("Failed to fetch designations", e);
      }

      try {
        const shiftsRes = await apiService.getShifts();
        setShifts(extractData(shiftsRes));
      } catch (e) {
        console.error("Failed to fetch shifts", e);
      }
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    // Note: If we want to remove existing image from backend, logic would be more complex (e.g. set a flag).
    // For now, this just clears the new selection.
  };

  const handleArrayChange = (
    arrayName: string,
    index: number,
    field: string,
    value: any
  ) => {
    setFormData((prev: any) => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName: string, initialItem: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], initialItem],
    }));
  };

  const removeArrayItem = (arrayName: string, index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create FormData
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        // Skip system fields and populated objects that shouldn't be sent back
        if (
          [
            "user",
            "_id",
            "__v",
            "addedTime",
            "modifiedTime",
            "addedBy",
            "modifiedBy",
          ].includes(key)
        ) {
          return;
        }

        if (Array.isArray(formData[key])) {
          // For arrays, we might need strict JSON stringify or loop
          // Simple array handling:
          data.append(key, JSON.stringify(formData[key]));
        } else if (key === "bankDetails") {
          data.append(key, JSON.stringify(formData[key]));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (profileImage) {
        data.append("profilePicture", profileImage);
      }

      if (employee) {
        await apiService.updateEmployee(employee._id, data);
      } else {
        await apiService.createEmployee(data);
      }
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to save employee");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    name: string,
    type = "text",
    required = false,
    options?: string[]
  ) => (
    <div>
      {options ? (
        <Select
          label={label}
          required={required}
          value={formData[name]}
          onChange={(value) => handleChange({ target: { name, value } })}
          options={options.map((opt) => ({ value: opt, label: opt }))}
          disabled={viewMode}
          className="disabled:opacity-60"
        />
      ) : type === "date" ? (
        <DatePicker
          label={label}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={viewMode}
          required={required}
        />
      ) : (
        <Input
          label={label}
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={viewMode}
          required={required}
          className="disabled:opacity-60"
        />
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        viewMode
          ? "View Employee"
          : employee
          ? "Edit Employee"
          : "Add New Employee"
      }
      maxWidth="max-w-6xl"
      bodyClassName="flex flex-col md:flex-row h-full overflow-hidden p-0"
      footer={
        !viewMode ? (
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Employee"}
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 bg-bg-main/30 border-b md:border-b-0 md:border-r border-border overflow-x-auto md:overflow-y-auto shrink-0 flex md:flex-col p-2 space-y-1">
        {TABS.map((tab) => {
          const Icon = TAB_ICONS[tab] || User;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all group flex items-center justify-between ${
                activeTab === tab
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                {tab}
              </div>
              {activeTab === tab && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Info */}
            {activeTab === "Basic Info" && (
              <div className="grid grid-cols-2 gap-4">
                {/* Profile Picture Upload - Top of Basic Tab */}
                <div className="col-span-2 flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 rounded-full bg-bg-main border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        {!viewMode && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </>
                    ) : (
                      <Upload className="text-gray-400" size={24} />
                    )}
                  </div>
                  {!viewMode && (
                    <div>
                      <input
                        type="file"
                        id="profileUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="profileUpload"
                        className="cursor-pointer px-4 py-2 bg-bg-card border border-border rounded-lg hover:bg-bg-hover text-sm font-medium transition-colors text-text-primary"
                      >
                        {imagePreview ? "Change Photo" : "Upload Photo"}
                      </label>
                      <p className="text-xs text-text-secondary mt-1">
                        PNG, JPG or GIF. Max 5MB.
                      </p>
                    </div>
                  )}
                </div>

                {renderInput("Employee ID", "employeeId", "text", true)}
                {renderInput("First Name", "firstName", "text", true)}
                {renderInput("Last Name", "lastName", "text", true)}
                {renderInput("Nick Name", "nickName")}
                {renderInput("Email Address", "email", "email", true)}
                {!employee && (
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <PasswordInput
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!employee}
                      placeholder="Enter password for new user"
                      className="bg-bg-card"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Work Info */}
            {activeTab === "Work Info" && (
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Department", "department", "text", false, [
                  "Engineering",
                  "HR",
                  "Sales",
                  "Marketing",
                  "Finance",
                ])}
                {renderInput("Location", "location", "text", false, [
                  "New York",
                  "London",
                  "Remote",
                  "Bangalore",
                ])}
                <div>
                  <Select
                    label="Designation"
                    value={formData.designationId}
                    onChange={(value) =>
                      handleChange({ target: { name: "designationId", value } })
                    }
                    options={designations.map((d) => ({
                      value: d._id,
                      label: d.name,
                    }))}
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                <div>
                  <Select
                    label="Role"
                    value={formData.role}
                    onChange={(value) =>
                      handleChange({ target: { name: "role", value } })
                    }
                    options={roles.map((r) => ({
                      value: r.name,
                      label: r.name,
                    }))}
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                <div>
                  <Select
                    label="Shift"
                    value={formData.shiftId}
                    onChange={(value) =>
                      handleChange({ target: { name: "shiftId", value } })
                    }
                    options={shifts.map((s) => ({
                      value: s._id,
                      label: `${s.name} (${s.startTime} - ${s.endTime})`,
                    }))}
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                {renderInput(
                  "Employment Type",
                  "employmentType",
                  "text",
                  false,
                  ["Permanent", "Contract", "Intern", "Freelancer", "Part-Time"]
                )}
                {renderInput(
                  "Employee Status",
                  "employeeStatus",
                  "text",
                  false,
                  [
                    "Active",
                    "Probation",
                    "On Leave",
                    "Notice Period",
                    "Terminated",
                    "Resigned",
                  ]
                )}
                {renderInput("Source of Hire", "sourceOfHire", "text", false, [
                  "Recruitment",
                  "Referral",
                  "Direct",
                  "Campus",
                  "Vendor",
                ])}
                {renderInput("Date of Joining", "dateOfJoining", "date")}
                {renderInput("Total Experience", "totalExperience")}
              </div>
            )}

            {/* Hierarchy */}
            {activeTab === "Hierarchy" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Select
                    label="Reporting Manager"
                    value={formData.reportingManager}
                    onChange={(value) =>
                      handleChange({
                        target: { name: "reportingManager", value },
                      })
                    }
                    options={managers.map((m) => ({
                      value: m._id,
                      label: `${m.firstName} ${m.lastName}`,
                    }))}
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* Personal */}
            {activeTab === "Personal" && (
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Date of Birth", "dateOfBirth", "date")}
                {renderInput("Gender", "gender", "text", false, [
                  "Male",
                  "Female",
                  "Other",
                ])}
                {renderInput("Marital Status", "maritalStatus", "text", false, [
                  "Single",
                  "Married",
                  "Divorced",
                  "Widowed",
                ])}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    About Me
                  </label>
                  <textarea
                    name="aboutMe"
                    value={formData.aboutMe}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-bg-main bg-bg-card text-text-primary"
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Expertise / Ask Me
                  </label>
                  <textarea
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-bg-main bg-bg-card text-text-primary"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Identity */}
            {activeTab === "Identity" && (
              <div className="grid grid-cols-2 gap-4">
                {renderInput("UAN", "uan")}
                {renderInput("PAN", "pan")}
                {renderInput("Aadhaar", "aadhaar")}
              </div>
            )}

            {/* Contact */}
            {activeTab === "Contact" && (
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Work Phone", "workPhone")}
                {renderInput("Extension", "extension")}
                {renderInput("Seating Location", "seatingLocation")}
                {renderInput("Personal Mobile", "personalMobile")}
                {renderInput("Personal Email", "personalEmail", "email")}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Present Address
                  </label>
                  <textarea
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-bg-main bg-bg-card text-text-primary"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Permanent Address
                  </label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-bg-main bg-bg-card text-text-primary"
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Bank Details */}
            {activeTab === "Bank Details" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Account Holder Name
                  </label>
                  <Input
                    value={formData.bankDetails?.accountName || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          accountName: e.target.value,
                        },
                      }))
                    }
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Account Number
                  </label>
                  <Input
                    value={formData.bankDetails?.accountNumber || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          accountNumber: e.target.value,
                        },
                      }))
                    }
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Bank Name
                  </label>
                  <Input
                    value={formData.bankDetails?.bankName || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          bankName: e.target.value,
                        },
                      }))
                    }
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    IFSC / SWIFT Code
                  </label>
                  <Input
                    value={formData.bankDetails?.ifscCode || ""}
                    onChange={(e) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        bankDetails: {
                          ...prev.bankDetails,
                          ifscCode: e.target.value,
                        },
                      }))
                    }
                    disabled={viewMode}
                    className="disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === "Documents" &&
              (employee ? (
                <DocumentsTab
                  employeeId={employee._id}
                  readOnly={viewMode}
                  roleName={formData.role}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <FileText size={48} className="mb-4 text-text-muted" />
                  <p className="text-lg font-medium">
                    Please save the employee first
                  </p>
                  <p className="text-sm">
                    Documents can only be uploaded for existing employees.
                  </p>
                </div>
              ))}

            {/* Assets */}
            {activeTab === "Assets" &&
              (employee ? (
                <AssetsTab employeeId={employee._id} readOnly={viewMode} />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <Monitor size={48} className="mb-4 text-text-muted" />
                  <p className="text-lg font-medium">
                    Please save the employee first
                  </p>
                  <p className="text-sm">
                    Assets can only be assigned to existing employees.
                  </p>
                </div>
              ))}

            {/* Separation */}
            {activeTab === "Separation" && (
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Date of Exit", "dateOfExit", "date")}
              </div>
            )}

            {/* Additional */}
            {activeTab === "Additional" && (
              <div className="space-y-6">
                {/* Work Experience */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Work Experience</h3>
                    {!viewMode && (
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
                        className="text-brand-primary text-sm flex items-center gap-1"
                      >
                        <Plus size={16} /> Add
                      </button>
                    )}
                  </div>
                  {formData.workExperience.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border p-3 rounded mb-2 relative"
                    >
                      {!viewMode && (
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("workExperience", index)
                          }
                          className="absolute top-2 right-2 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Company"
                          value={item.companyName}
                          onChange={(e) =>
                            handleArrayChange(
                              "workExperience",
                              index,
                              "companyName",
                              e.target.value
                            )
                          }
                          className="w-full"
                          disabled={viewMode}
                        />
                        <Input
                          placeholder="Job Title"
                          value={item.jobTitle}
                          onChange={(e) =>
                            handleArrayChange(
                              "workExperience",
                              index,
                              "jobTitle",
                              e.target.value
                            )
                          }
                          className="w-full"
                          disabled={viewMode}
                        />
                        <DatePicker
                          placeholder="From"
                          value={
                            item.fromDate ? item.fromDate.split("T")[0] : ""
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "workExperience",
                              index,
                              "fromDate",
                              e.target.value
                            )
                          }
                          disabled={viewMode}
                        />

                        <DatePicker
                          placeholder="To"
                          value={item.toDate ? item.toDate.split("T")[0] : ""}
                          onChange={(e) =>
                            handleArrayChange(
                              "workExperience",
                              index,
                              "toDate",
                              e.target.value
                            )
                          }
                          disabled={viewMode}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Education</h3>
                    {!viewMode && (
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
                        className="text-brand-primary text-sm flex items-center gap-1"
                      >
                        <Plus size={16} /> Add
                      </button>
                    )}
                  </div>
                  {formData.education.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="border p-3 rounded mb-2 relative"
                    >
                      {!viewMode && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("education", index)}
                          className="absolute top-2 right-2 text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Institute"
                          value={item.instituteName}
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              index,
                              "instituteName",
                              e.target.value
                            )
                          }
                          className="w-full"
                          disabled={viewMode}
                        />
                        <Input
                          placeholder="Degree"
                          value={item.degree}
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              index,
                              "degree",
                              e.target.value
                            )
                          }
                          className="w-full"
                          disabled={viewMode}
                        />
                        <Input
                          placeholder="Specialization"
                          value={item.specialization}
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              index,
                              "specialization",
                              e.target.value
                            )
                          }
                          className="w-full"
                          disabled={viewMode}
                        />
                        <DatePicker
                          placeholder="Completion Date"
                          value={
                            item.dateOfCompletion
                              ? item.dateOfCompletion.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleArrayChange(
                              "education",
                              index,
                              "dateOfCompletion",
                              e.target.value
                            )
                          }
                          disabled={viewMode}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
