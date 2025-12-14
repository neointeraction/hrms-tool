import { useAuth } from "../../../context/AuthContext";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import PayrollSummaryWidget from "./PayrollSummaryWidget";
import { useGreeting } from "../../../hooks/useGreeting";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";

export default function HRDashboard() {
  const { user } = useAuth();
  const greeting = useGreeting();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {greeting}, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-1">HR Operations Overview</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("attendance")) && (
          <AttendanceWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("leave")) && (
          <LeaveWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("leave")) && (
          <UpcomingHolidayWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("payroll")) && (
          <PayrollSummaryWidget />
        )}
        <FeedbackWidget />
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          user.tenantId.limits.enabledModules.includes("social")) && (
          <AppreciationWidget />
        )}
      </div>
    </div>
  );
}
