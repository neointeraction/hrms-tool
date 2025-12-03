import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function LeaveManagement() {
  const [currentDate] = useState(new Date(2025, 5, 7)); // June 7, 2025
  const [showToast, setShowToast] = useState(false);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const { days, firstDay } = getDaysInMonth(currentDate);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Leave & Attendance
        </h1>
        <button className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-secondary transition-colors">
          My Leave History
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">
              {currentDate.toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-bg-hover rounded-full text-text-secondary">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 hover:bg-bg-hover rounded-full text-text-secondary">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-text-secondary py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1;
              const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              );
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday = day === 7; // June 7th
              const isHoliday = day === 29; // Bakrid

              return (
                <div
                  key={day}
                  className={cn(
                    "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-colors relative group",
                    isWeekend
                      ? "bg-bg-main text-text-muted"
                      : "hover:bg-brand-primary/5 text-text-primary",
                    isToday &&
                      "bg-brand-primary text-white hover:bg-brand-primary",
                    isHoliday &&
                      "bg-brand-accent text-white hover:bg-brand-accent"
                  )}
                >
                  {day}
                  {isHoliday && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      Bakrid
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Apply Form */}
        <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Apply for Leave
          </h2>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Leave Type
              </label>
              <select className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all">
                <option>Casual Leave</option>
                <option>Sick Leave</option>
                <option>Privilege Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  From
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  To
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Reason
              </label>
              <textarea
                className="w-full rounded-md border-border bg-bg-main px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                rows={4}
                placeholder="Enter reason for leave..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-brand-primary text-white py-2 rounded-lg hover:bg-brand-secondary transition-colors font-medium shadow-lg shadow-brand-primary/20"
            >
              Apply Leave
            </button>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={cn(
          "fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl transform transition-all duration-300 flex items-center gap-3 z-50",
          showToast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        )}
      >
        <div className="bg-status-success rounded-full p-1">
          <CalendarIcon size={14} className="text-white" />
        </div>
        <p className="font-medium">Leave Request Sent to Manager</p>
      </div>
    </div>
  );
}
