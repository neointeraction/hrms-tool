import { useEffect, useState } from "react";
import { format } from "date-fns";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Calendar, Clock, UserX } from "lucide-react";

interface EmployeeOnLeave {
  _id: string;
  employee: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    designation?: string;
    department?: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
}

export default function EmployeesOnLeave() {
  const [employees, setEmployees] = useState<EmployeeOnLeave[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeesOnLeave = async () => {
      try {
        const data = await apiService.getEmployeesOnLeave();
        setEmployees(data || []);
      } catch (error) {
        console.error("Failed to fetch employees on leave:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesOnLeave();
  }, []);

  const getLeaveTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "sick":
        return "bg-status-error/10 text-status-error border-status-error/20";
      case "casual":
        return "bg-brand-primary/10 text-brand-primary border-brand-primary/20";
      case "privilege":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      default:
        return "bg-status-info/10 text-status-info border-status-info/20";
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border animate-pulse h-64">
        <div className="h-6 w-1/3 bg-bg-main rounded mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-bg-main"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-bg-main rounded"></div>
                <div className="h-3 w-1/3 bg-bg-main rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl shadow-sm border border-border flex flex-col h-full bg-white">
      <div className="p-6 border-b border-border flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <UserX className="text-brand-primary" size={20} />
            Who's on Leave Today
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Overview of unavailable team members
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg-main text-text-primary border border-border">
          {employees.length} Active
        </span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-bg-main/50 rounded-lg border-2 border-dashed border-border/50">
            <div className="p-4 bg-white rounded-full shadow-sm mb-3">
              <UserX className="text-text-muted" size={24} />
            </div>
            <p className="text-sm font-medium text-text-primary">
              Everyone is present!
            </p>
            <p className="text-xs text-text-secondary mt-1">
              No employees are on leave today.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((leave) => (
              <div
                key={leave._id}
                className="group flex items-center p-3 rounded-lg hover:bg-bg-hover border border-transparent hover:border-border transition-all duration-200"
              >
                {/* Avatar */}
                <div className="relative mr-4">
                  {leave.employee.profilePicture ? (
                    <img
                      src={`${ASSET_BASE_URL}/${leave.employee.profilePicture}`}
                      alt={leave.employee.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-sm font-bold border border-brand-primary/20">
                      {leave.employee.firstName?.[0]}
                      {leave.employee.lastName?.[0]}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-status-error border-2 border-white"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary truncate">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </h3>
                      <p className="text-xs text-text-secondary truncate mt-0.5">
                        {leave.employee.designation || "Employee"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-md border ${getLeaveTypeColor(
                        leave.type
                      )}`}
                    >
                      {leave.type}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-4 text-xs text-text-secondary">
                    <div className="flex items-center gap-1.5 bg-bg-main px-2 py-1 rounded text-text-muted">
                      <Calendar size={12} />
                      <span>
                        Until {format(new Date(leave.endDate), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 ">
                      <Clock size={12} />
                      <span>
                        {leave.totalDays} of {leave.totalDays} days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {employees.length > 0 && (
        <div className="p-3 border-t border-border bg-bg-main/30 rounded-b-xl">
          <button className="w-full text-xs font-medium text-brand-primary hover:text-brand-secondary transition-colors text-center py-1">
            View Leave Calendar →
          </button>
        </div>
      )}
    </div>
  );
}
