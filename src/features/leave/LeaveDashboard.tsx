import { useState } from "react";
import { PlusCircle, List, CheckSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LeaveList from "./LeaveList";
import LeaveApproval from "./LeaveApproval";
import ApplyLeaveModal from "./ApplyLeaveModal";

export default function LeaveDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"my-leaves" | "approvals">(
    "my-leaves"
  );
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const canApprove =
    user?.role === "Admin" ||
    user?.role === "HR" ||
    user?.role === "Project Manager";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Leave Management
          </h1>
          <p className="text-text-secondary">
            Manage your leaves and approvals
          </p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
        >
          <PlusCircle size={20} />
          Apply for Leave
        </button>
      </div>

      {canApprove && (
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("my-leaves")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "my-leaves"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <List size={18} />
            My Leaves
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "approvals"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <CheckSquare size={18} />
            Approvals
          </button>
        </div>
      )}

      {activeTab === "my-leaves" ? <LeaveList /> : <LeaveApproval />}

      {isApplyModalOpen && (
        <ApplyLeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}
    </div>
  );
}
