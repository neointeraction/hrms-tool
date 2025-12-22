import { useState } from "react";
import { Plus, List, CheckSquare, FileText, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";
import LeaveBalance from "./LeaveBalance";
import LeaveList from "./LeaveList";
import LeaveApproval from "./LeaveApproval";
import ApplyLeaveModal from "./ApplyLeaveModal";
import LeavePolicyList from "./policies/LeavePolicyList";
import HolidayModal from "../holiday/HolidayModal";
import HRLeaveOverview from "./HRLeaveOverview";

export default function LeaveDashboard() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "my-leaves" | "approvals" | "policies" | "overview"
  >("my-leaves");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);

  const canApprove = hasPermission("leave:approve");

  const canManagePolicies = hasPermission("leave:manage_policies");

  const canViewPolicies = true; // All authenticated users can view policies

  const canViewOverview = hasPermission("leave:view_all");

  return (
    <>
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
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsHolidayModalOpen(true)}
              leftIcon={<Calendar size={20} />}
            >
              View Holidays
            </Button>
            {hasPermission("leave:apply") && (
              <Button
                onClick={() => setIsApplyModalOpen(true)}
                leftIcon={<Plus size={20} />}
              >
                Apply for Leave
              </Button>
            )}
          </div>
        </div>

        {activeTab === "my-leaves" ||
        (!canManagePolicies && activeTab !== "policies") ? (
          <LeaveBalance />
        ) : null}

        <div className="flex border-b border-border overflow-x-auto">
          <button
            onClick={() => setActiveTab("my-leaves")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "my-leaves"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <List size={18} />
            My Leaves
          </button>
          {canApprove && (
            <button
              onClick={() => setActiveTab("approvals")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "approvals"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <CheckSquare size={18} />
              Approvals
            </button>
          )}
          {canViewPolicies && (
            <button
              onClick={() => setActiveTab("policies")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "policies"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <FileText size={18} />
              Policies
            </button>
          )}
          {canViewOverview && (
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <FileText size={18} />
              Overview
            </button>
          )}
        </div>

        <div className="mt-4">
          {activeTab === "my-leaves" && <LeaveList />}
          {activeTab === "approvals" && <LeaveApproval />}
          {activeTab === "policies" && <LeavePolicyList />}
          {activeTab === "overview" && <HRLeaveOverview />}
        </div>
      </div>

      {isApplyModalOpen && (
        <ApplyLeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {isHolidayModalOpen && (
        <HolidayModal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
        />
      )}
    </>
  );
}
