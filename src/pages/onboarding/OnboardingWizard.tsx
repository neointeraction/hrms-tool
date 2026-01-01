import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../services/api.service";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { Textarea } from "../../components/common/Textarea";
import {
  Loader2,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Upload,
  AlertCircle,
  FileText,
  Building2,
  User,
  Send,
} from "lucide-react";

export default function OnboardingWizard() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [empName, setEmpName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  // Form States
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    mobile: "",
    dob: "",
    address: "",
    pan: "",
    aadhaar: "",
    bankDetails: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      ifscCode: "",
    },
  });

  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/onboarding/validate/${token}`);
        if (!res.ok) throw new Error("Invalid or expired link");
        const emp = await res.json();
        setEmpName(emp.firstName);
        setFormData((prev) => ({
          ...prev,
          firstName: emp.firstName,
          lastName: emp.lastName,
          personalEmail: emp.email,
          mobile: emp.personalMobile || "",
          dob: emp.dateOfBirth
            ? new Date(emp.dateOfBirth).toISOString().split("T")[0]
            : "", // Format YYYY-MM-DD
          address: emp.presentAddress || "",
          pan: emp.pan || "",
          aadhaar: emp.aadhaar || "",
          bankDetails: {
            accountName: emp.bankDetails?.accountName || "",
            accountNumber: emp.bankDetails?.accountNumber || "",
            bankName: emp.bankDetails?.bankName || "",
            ifscCode: emp.bankDetails?.ifscCode || "",
          },
        }));
        if (emp.onboarding?.documents) {
          setUploadedDocs(emp.onboarding.documents);
        }
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    validateToken();
  }, [token]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docName?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    if (docName) {
      data.append("docName", docName);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/upload/${token}`, {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setUploadedDocs(result.documents);
      // alert("File uploaded successfully!"); // Optional: remove alert for smoother UX
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveStep = async (
    step: number,
    stepData: any,
    isFinal = false
  ) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/onboarding/save/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step,
          data: stepData,
          isFinalSubmission: isFinal,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");

      if (isFinal) {
        // Show success state
        setCurrentStep(5);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Documents", icon: FileText },
    { id: 3, label: "Bank Details", icon: Building2 },
    { id: 4, label: "Review", icon: CheckCircle },
  ];

  if (loading)
    return (
      <div className="flex h-96 items-center justify-center flex-col gap-4">
        <Loader2 className="animate-spin text-violet-600" size={40} />
        <p className="text-gray-500">Loading your profile...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 text-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 max-w-md mx-auto">{error}</p>
      </div>
    );

  // Success Step
  if (currentStep === 5) {
    return (
      <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 text-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            All Set, {formData.firstName}!
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-lg">
            Your onboarding information has been submitted securely. Our HR team
            will review your profile and approve your account shortly.
          </p>
        </div>
        <div className="pt-8">
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="mx-auto"
          >
            Go to Login Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="text-center mb-10 pt-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome aboard, {empName} 👋
        </h1>
        <p className="text-gray-500">
          Complete these few steps to set up your employee profile.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-12 relative px-4">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full"></div>
        <div
          className="absolute top-1/2 left-0 h-1 bg-violet-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        ></div>

        <div className="flex justify-between items-center max-w-3xl mx-auto">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center group cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-4 ${
                    isActive
                      ? "bg-violet-600 text-white border-violet-100 shadow-lg shadow-violet-200 scale-110"
                      : isCompleted
                      ? "bg-violet-600 text-white border-white"
                      : "bg-white text-gray-400 border-gray-100"
                  }`}
                >
                  {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                </div>
                <span
                  className={`text-xs mt-2 font-medium transition-colors ${
                    isActive
                      ? "text-violet-700"
                      : isCompleted
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-1 md:p-4">
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                value={formData.firstName}
                disabled
                className="bg-gray-50"
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={(e) =>
                  setFormData({ ...formData, dob: e.target.value })
                }
              />
              <Input
                label="Mobile Number"
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
              <div className="col-span-1 md:col-span-2">
                <Textarea
                  label="Current Residential Address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Street address, City, State, Zip Code"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100">
              <Button onClick={() => handleSaveStep(1, formData)}>
                Next Step <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-blue-50 border border-blue-100 text-blue-700 p-4 rounded-xl flex gap-3 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Required Documents</p>
                <p>
                  Please upload clear scanned copies of your Aadhar Card, PAN
                  Card, and Highest Education Certificate.
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 hover:border-violet-400 hover:bg-violet-50/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                disabled={isUploading}
              />
              <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {isUploading ? (
                  <Loader2 className="animate-spin" size={32} />
                ) : (
                  <Upload size={32} />
                )}
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                {isUploading
                  ? "Uploading..."
                  : "Click to upload or drag files here"}
              </p>
              <p className="text-sm text-gray-500">
                Supported: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>

            {uploadedDocs.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Uploaded Files
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {uploadedDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-violet-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {doc.name}
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full">
                        Uploaded
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ChevronLeft size={18} className="mr-2" /> Back
              </Button>
              <Button
                onClick={() => handleSaveStep(2, { documents: uploadedDocs })}
              >
                Next Step <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Bank Account Number"
                value={formData.bankDetails.accountNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      accountNumber: e.target.value,
                    },
                  }))
                }
                placeholder="Enter full account number"
              />
              <Input
                label="IFSC Code"
                value={formData.bankDetails.ifscCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      ifscCode: e.target.value.toUpperCase(),
                    },
                  }))
                }
                placeholder="e.g. HDFC0001234"
              />
              <Input
                label="Bank Name"
                value={formData.bankDetails.bankName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      bankName: e.target.value,
                    },
                  }))
                }
                placeholder="e.g. HDFC Bank"
              />
              <Input
                label="Account Holder Name"
                value={formData.bankDetails.accountName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    bankDetails: {
                      ...prev.bankDetails,
                      accountName: e.target.value,
                    },
                  }))
                }
                placeholder="As per bank records"
              />
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ChevronLeft size={18} className="mr-2" /> Back
              </Button>
              <Button
                onClick={() =>
                  handleSaveStep(3, { bankDetails: formData.bankDetails })
                }
              >
                Next Step <ChevronRight size={18} className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Name</span>{" "}
                    {formData.firstName} {formData.lastName}
                  </div>
                  <div>
                    <span className="text-gray-500 block">DOB</span>{" "}
                    {formData.dob || "-"}
                  </div>
                  <div>
                    <span className="text-gray-500 block">Mobile</span>{" "}
                    {formData.mobile || "-"}
                  </div>
                  <div>
                    <span className="text-gray-500 block">Address</span>{" "}
                    <span className="truncate block">
                      {formData.address || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  Bank Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Bank</span>{" "}
                    {formData.bankDetails.bankName || "-"}
                  </div>
                  <div>
                    <span className="text-gray-500 block">Account No</span>{" "}
                    {formData.bankDetails.accountNumber || "-"}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3">
                  Documents
                </h3>
                <p className="text-sm text-gray-600">
                  {uploadedDocs.length} files uploaded
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-gray-100">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                <ChevronLeft size={18} className="mr-2" /> Back
              </Button>
              <Button
                onClick={() => handleSaveStep(4, {}, true)}
                className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} className="mr-2" />
                )}
                Submit Onboarding
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
