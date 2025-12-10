import { useState, useEffect } from "react";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { DatePicker } from "../../../components/common/DatePicker";

export default function TimeHistory() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow to include today
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    fetchHistory();
  }, [dateRange]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      console.log("Fetching history with date range:", dateRange);
      const data = await apiService.getAttendanceHistory(dateRange);
      console.log("Received attendance history:", data);
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-bg-main border border-border rounded-lg p-4">
        <h3 className="font-semibold text-text-primary mb-3">Date Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <DatePicker
              label="From"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <DatePicker
              label="To"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* History List */}
      {entries.length === 0 ? (
        <div className="text-center py-12 text-text-secondary">
          <Calendar size={48} className="mx-auto mb-3 opacity-50" />
          <p>No attendance records found for this period</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="bg-bg-main border border-border rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-brand-primary" />
                  <span className="font-semibold text-text-primary">
                    {new Date(entry.clockIn).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    entry.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {entry.status === "completed" ? "Completed" : "Active"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-text-secondary mb-1">Clock In</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-green-600" />
                    <span className="font-medium text-text-primary">
                      {new Date(entry.clockIn).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Clock Out</p>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-red-600" />
                    <span className="font-medium text-text-primary">
                      {entry.clockOut
                        ? new Date(entry.clockOut).toLocaleTimeString()
                        : "In Progress"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-text-secondary mb-1">Total Hours</p>
                  <span className="font-bold text-brand-primary">
                    {entry.totalHours
                      ? formatDuration(entry.totalHours)
                      : "0h 0m"}
                  </span>
                </div>
              </div>

              {entry.breaks && entry.breaks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-text-secondary mb-2">
                    Breaks: {entry.breaks.length} ({entry.totalBreakMinutes} min
                    total)
                  </p>
                </div>
              )}

              {entry.completedTasks && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-text-secondary mb-1">
                    Completed Tasks:
                  </p>
                  <p className="text-sm text-text-primary whitespace-pre-wrap">
                    {entry.completedTasks}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
