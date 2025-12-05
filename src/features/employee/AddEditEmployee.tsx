import { useState, useEffect } from "react";
import { Modal } from "../../components/common/Modal";
import { apiService } from "../../services/api.service";
import { Plus, Trash2 } from "lucide-react";

interface AddEditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: any;
  viewMode?: boolean;
}

const TABS = [
  "Basic Info",
  "Work Info",
  "Hierarchy",
  "Personal",
  "Identity",
  "Contact",
  "Separation",
  "Additional",
];

export default function AddEditEmployee({
  isOpen,
  onClose,
  employee,
  viewMode = false,
}: AddEditEmployeeProps) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

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
  });

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      if (employee) {
        setFormData({
          ...employee,
          reportingManager:
            employee.reportingManager?._id || employee.reportingManager || "",
          dateOfJoining: employee.dateOfJoining
            ? employee.dateOfJoining.split("T")[0]
            : "",
          dateOfBirth: employee.dateOfBirth
            ? employee.dateOfBirth.split("T")[0]
            : "",
          dateOfExit: employee.dateOfExit
            ? employee.dateOfExit.split("T")[0]
            : "",
        });
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
        });
      }
    }
  }, [isOpen, employee]);

  const fetchDropdowns = async () => {
    try {
      const [rolesData, employeesData] = await Promise.all([
        apiService.getRoles(),
        apiService.getEmployees(),
      ]);
      setRoles(rolesData);
      setManagers(employeesData);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
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
      if (employee) {
        await apiService.updateEmployee(employee._id, formData);
      } else {
        await apiService.createEmployee(formData);
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
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {options ? (
        <select
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={viewMode}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          disabled={viewMode}
          required={required}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
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
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-border mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {/* Basic Info */}
            {activeTab === "Basic Info" && (
              <div className="grid grid-cols-2 gap-4">
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
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!employee}
                      placeholder="Enter password for new user"
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
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
                {renderInput("Designation", "designation")}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Reporting Manager
                  </label>
                  <select
                    name="reportingManager"
                    value={formData.reportingManager}
                    onChange={handleChange}
                    disabled={viewMode}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
                  >
                    <option value="">Select Manager</option>
                    {managers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
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
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 disabled:bg-gray-100"
                    rows={2}
                  />
                </div>
              </div>
            )}

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
                        <input
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
                          type="date"
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
                          type="date"
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
                          className="border p-1 rounded"
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
                        <input
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
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
                          className="border p-1 rounded"
                          disabled={viewMode}
                        />
                        <input
                          type="date"
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
                          className="border p-1 rounded"
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

        {/* Footer */}
        {!viewMode && (
          <div className="pt-4 border-t border-border flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-gray-50 font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Employee"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
