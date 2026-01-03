import { useState, useEffect } from "react";
import { API_BASE_URL, apiService } from "../../services/api.service";
import { Modal } from "../../components/common/Modal";
import { ConfirmationModal } from "../../components/common/ConfirmationModal";
import { Check, X, Eye, FileText, Download } from "lucide-react";
import { Table } from "../../components/common/Table";
import { Tooltip } from "../../components/common/Tooltip";
import { Button } from "../../components/common/Button";

export default function OnboardingApproval() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "info" | "success";
    confirmText?: string;
    showCancel?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
    onConfirm: () => {},
  });

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const showSuccess = (msg: string) => {
    setModalConfig({
      isOpen: true,
      title: "Success",
      message: msg,
      variant: "success",
      showCancel: false,
      confirmText: "OK",
      onConfirm: closeModal,
    });
  };

  const showError = (msg: string) => {
    setModalConfig({
      isOpen: true,
      title: "Error",
      message: msg,
      variant: "danger",
      showCancel: false,
      confirmText: "OK",
      onConfirm: closeModal,
    });
  };

  const fetchOnboardingEmployees = async () => {
    try {
      // Use apiService to get employees (it handles auth headers automatically)
      const data = await apiService.getEmployees();

      const list = Array.isArray(data)
        ? data.filter((e: any) =>
            ["Invited", "Onboarding", "Review"].includes(e.employeeStatus)
          )
        : [];
      setEmployees(list);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingEmployees();
  }, []);

  const executeApprove = async () => {
    if (!selectedEmp) return;
    setIsProcessing(true);
    closeModal(); // Close confirmation modal

    try {
      // We need to add approveOnboarding to api.service or use raw fetch with correct header if ad-hoc
      // Let's assume we add it or use raw fetch with correct token key "authToken"
      // Checking api.service.ts, 'authToken' is the key.
      const token = localStorage.getItem("authToken");

      const res = await fetch(
        `${API_BASE_URL}/onboarding/approve/${selectedEmp._id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      showSuccess("Employee Approved Successfully");
      setSelectedEmp(null);
      fetchOnboardingEmployees();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveClick = () => {
    setModalConfig({
      isOpen: true,
      title: "Approve Employee",
      message:
        "Are you sure you want to approve this employee? A user account will be created.",
      variant: "success",
      confirmText: "Approve & Activate",
      showCancel: true,
      onConfirm: executeApprove,
    });
  };

  const handleReject = async () => {
    if (!selectedEmp) return;
    if (!rejectReason) {
      showError("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${API_BASE_URL}/onboarding/reject/${selectedEmp._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      showSuccess("Employee Returned for Changes");
      setSelectedEmp(null);
      setShowRejectInput(false);
      setRejectReason("");
      fetchOnboardingEmployees();
    } catch (err: any) {
      showError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading requests...</div>
    );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <Table
          columns={[
            {
              header: "Name",
              accessorKey: "firstName",
              render: (emp) => (
                <div className="font-medium text-text-primary">
                  {emp.firstName} {emp.lastName}
                </div>
              ),
            },
            {
              header: "Email",
              accessorKey: "email",
            },
            {
              header: "Status",
              accessorKey: "employeeStatus",
              render: (emp) => (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    emp.employeeStatus === "Review"
                      ? "bg-amber-100 text-amber-700"
                      : emp.employeeStatus === "Invited"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {emp.employeeStatus}
                </span>
              ),
            },
            {
              header: "Progress",
              render: (emp) => {
                const step = emp.onboarding?.currentStep || 1;
                const totalSteps = 4;
                const percentage = Math.min((step / totalSteps) * 100, 100);

                return (
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-text-primary">
                        Step {step} of {totalSteps}
                      </span>
                      <span className="text-text-tertiary">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              },
            },
            {
              header: "Actions",
              className: "text-right",
              render: (emp) => (
                <div className="flex justify-end">
                  <Tooltip content="Review Application">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="p-2 text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </Tooltip>
                </div>
              ),
            },
          ]}
          data={employees}
          isLoading={loading}
          emptyMessage="No pending onboarding requests."
        />
      </div>
      {/* Review Modal */}
      {selectedEmp && (
        <Modal
          isOpen={!!selectedEmp}
          onClose={() => setSelectedEmp(null)}
          title="Review Onboarding"
          maxWidth="max-w-3xl"
          footer={
            <div className="w-full">
              {showRejectInput ? (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-red-800 mb-2">
                    Reason for Return
                  </label>
                  <textarea
                    className="w-full p-2 border border-red-200 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Uploaded documents are blurry. Please re-upload."
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setShowRejectInput(false)}
                      className="bg-white hover:bg-white/80"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleReject}
                      isLoading={isProcessing}
                    >
                      Confirm Return
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="secondary"
                    onClick={() => setShowRejectInput(true)}
                    leftIcon={<X size={16} />}
                  >
                    Request Changes
                  </Button>
                  <Button
                    onClick={handleApproveClick}
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    leftIcon={<Check size={18} />}
                  >
                    Approve & Activate
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-8">
            <div className="border-b pb-4 mb-4">
              <p className="text-sm text-text-secondary">
                Applicant:{" "}
                <span className="font-semibold text-gray-900">
                  {selectedEmp.firstName} {selectedEmp.lastName}
                </span>{" "}
                • {selectedEmp.email}
              </p>
            </div>

            {/* Personal Details */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-600 rounded-r-full"></span>
                Personal Details
              </h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                    Email
                  </span>
                  {selectedEmp.email}
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                    Mobile
                  </span>
                  {selectedEmp.personalMobile || selectedEmp.mobile || "-"}
                </div>
                <div>
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                    Date of Birth
                  </span>
                  {selectedEmp.dateOfBirth
                    ? new Date(selectedEmp.dateOfBirth).toLocaleDateString()
                    : selectedEmp.dob
                    ? new Date(selectedEmp.dob).toLocaleDateString()
                    : "-"}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                    Address
                  </span>
                  {selectedEmp.presentAddress || selectedEmp.address || "-"}
                </div>
              </div>
            </section>

            {/* Bank Details */}
            {selectedEmp.bankDetails && (
              <section>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-violet-600 rounded-r-full"></span>
                  Bank Details
                </h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                      Bank Name
                    </span>
                    {selectedEmp.bankDetails.bankName || "-"}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                      Account Number
                    </span>
                    {selectedEmp.bankDetails.accountNumber || "-"}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                      IFSC Code
                    </span>
                    {selectedEmp.bankDetails.ifscCode || "-"}
                  </div>
                  <div>
                    <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">
                      Holder Name
                    </span>
                    {selectedEmp.bankDetails.accountName || "-"}
                  </div>
                </div>
              </section>
            )}

            {/* Documents */}
            <section>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-violet-600 rounded-r-full"></span>
                Submitted Documents
              </h4>
              {selectedEmp.onboarding?.documents?.length > 0 ? (
                <ul className="grid grid-cols-1 gap-3">
                  {selectedEmp.onboarding.documents.map(
                    (doc: any, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                            <FileText size={20} />
                          </div>
                          <div>
                            <span className="font-medium text-sm text-gray-900 block">
                              {doc.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              Uploaded recently
                            </span>
                          </div>
                        </div>
                        <a
                          href={`${API_BASE_URL}/${doc.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-200 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-all shadow-sm"
                        >
                          <Download size={14} /> View
                        </a>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm">
                    No documents uploaded.
                  </p>
                </div>
              )}
            </section>
          </div>
        </Modal>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmText={modalConfig.confirmText}
        showCancel={modalConfig.showCancel}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
}
