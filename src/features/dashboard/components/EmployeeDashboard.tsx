import PayrollSummaryWidget from "./PayrollSummaryWidget";
// import { cn } from "../../../utils/cn";
import { useAuth } from "../../../context/AuthContext";
// import { apiService } from "../../../services/api.service";
import UpcomingHolidayWidget from "./UpcomingHolidayWidget";
import AttendanceWidget from "./AttendanceWidget";
import LeaveWidget from "./LeaveWidget";
import { useGreeting } from "../../../hooks/useGreeting";
import FeedbackWidget from "../../../components/dashboard/FeedbackWidget";
import AppreciationWidget from "../../../components/dashboard/AppreciationWidget";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const greeting = useGreeting();
  /*
   * Timer logic removed as it's currently unused in the UI.
   * To implement a check-in timer, add the UI elements and uncomment this logic.
   */
  // const [isCheckedIn, setIsCheckedIn] = useState(true);
  // const [timer, setTimer] = useState(0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            {greeting}, {user?.name.split(" ")[0]}! 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Here's your dashboard for today,{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <AppreciationWidget />
      </div>

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("attendance") &&
            user.accessibleModules?.includes("attendance"))) && (
          <AttendanceWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("leave") &&
            user.accessibleModules?.includes("leave"))) && <LeaveWidget />}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("leave") &&
            user.accessibleModules?.includes("leave"))) && (
          <UpcomingHolidayWidget />
        )}
        {(!user?.tenantId ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          typeof user.tenantId === "string" ||
          !user.tenantId.limits ||
          (user.tenantId.limits.enabledModules.includes("payroll") &&
            user.accessibleModules?.includes("payroll"))) && (
          <PayrollSummaryWidget />
        )}
        <FeedbackWidget />
      </div>
    </div>
  );
}
