import { useAuth } from "../../../context/AuthContext";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";
import { useGreeting } from "../../../hooks/useGreeting";

export default function ContractorDashboard() {
  const { user } = useAuth();
  const { text } = useGreeting();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
            {text}, {user?.name.split(" ")[0]}!{" "}
          </h1>
          <p className="text-text-secondary mt-1">Consultant Portal</p>
        </div>
        <AppreciationWidget />
      </div>

      {/* Standard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AttendanceWidget />
        <LeaveWidget />
        <UpcomingHolidayWidget />
        <PayrollSummaryWidget />
        <FeedbackWidget />
      </div>
    </div>
  );
}
