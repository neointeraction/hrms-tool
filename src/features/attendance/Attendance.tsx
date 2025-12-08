import { useState } from "react";
import { Clock, FileText, History, GitPullRequest } from "lucide-react";
import ClockInOut from "./components/ClockInOut";
import Timesheet from "./components/Timesheet";
import TimeHistory from "./components/TimeHistory";
import CorrectionRequests from "./components/CorrectionRequests";
import PendingApprovals from "./components/PendingApprovals";
import { useAuth } from "../../context/AuthContext";

const TABS = ["Clock In/Out", "Timesheets", "History", "Corrections"];

export default function Attendance() {
  const { user } = useAuth();
  const isManager = ["HR", "Project Manager"].includes(user?.role || "");

  // Add Pending Approvals tab for managers
  const tabs = isManager
    ? [
        "Clock In/Out",
        "Timesheets",
        "Pending Approvals",
        "History",
        "Corrections",
      ]
    : TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]); // Initialize with the first tab from the dynamic 'tabs' array

  const renderTabIcon = (tab: string) => {
    switch (tab) {
      case "Clock In/Out":
        return <Clock size={18} />;
      case "Timesheets":
        return <FileText size={18} />;
      case "Pending Approvals":
        return <GitPullRequest size={18} />;
      case "History":
        return <History size={18} />;
      case "Corrections":
        return <GitPullRequest size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Attendance & Time Tracking
        </h1>
        <p className="text-text-secondary mt-1">
          Track your time, manage timesheets, and request corrections
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-bg-card rounded-lg shadow-sm border border-border">
        <div className="flex overflow-x-auto border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-brand-primary text-brand-primary bg-brand-primary/5"
                  : "border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              }`}
            >
              {renderTabIcon(tab)}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "Clock In/Out" && <ClockInOut />}
          {activeTab === "Timesheets" && <Timesheet />}
          {activeTab === "Pending Approvals" && <PendingApprovals />}
          {activeTab === "History" && <TimeHistory />}
          {activeTab === "Corrections" && <CorrectionRequests />}
        </div>
      </div>
    </div>
  );
}
