import { useState, useEffect } from "react";
import { Clock, Coffee, LogOut, Loader2, Play } from "lucide-react";
import { Skeleton } from "../../../components/common/Skeleton";
import { apiService } from "../../../services/api.service";

export default function AttendanceWidget() {
  const [status, setStatus] = useState<
    "clocked-out" | "clocked-in" | "on-break"
  >("clocked-out");
  const [timeEntry, setTimeEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");
  const [todayHours, setTodayHours] = useState<string>("00:00");

  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState("");

  const fetchAttendanceData = async () => {
    try {
      // 1. Fetch Status
      const statusData = await apiService.getAttendanceStatus();
      setStatus(statusData.status);
      setTimeEntry(statusData.timeEntry);

      // 2. Fetch History for Today to calculate Total Hours
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const historyData = await apiService.getAttendanceHistory({
        startDate: startOfDay,
        endDate: endOfDay,
      });

      const logs = Array.isArray(historyData)
        ? historyData
        : historyData.entries || historyData.history || [];

      calculateTotalHours(logs, statusData.status, statusData.timeEntry);
    } catch (err) {
      console.error("Failed to fetch attendance widget data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    // Refresh status periodically
    const interval = setInterval(fetchAttendanceData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Live session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === "clocked-in" && timeEntry?.clockIn) {
      interval = setInterval(() => {
        const start = new Date(timeEntry.clockIn).getTime();
        const now = new Date().getTime();
        const diff = now - start;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setSessionDuration(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setSessionDuration("00:00:00");
    }

    return () => clearInterval(interval);
  }, [status, timeEntry]);

  const calculateTotalHours = (
    logs: any[],
    currentStatus: string,
    currentTimeEntry: any
  ) => {
    let totalMilliseconds = 0;

    logs.forEach((log: any) => {
      if (log.clockIn && log.clockOut) {
        const start = new Date(log.clockIn).getTime();
        const end = new Date(log.clockOut).getTime();
        totalMilliseconds += end - start;
      }
    });

    // Add current session if clocked in
    if (currentStatus === "clocked-in" && currentTimeEntry?.clockIn) {
      const start = new Date(currentTimeEntry.clockIn).getTime();
      const now = new Date().getTime();
      totalMilliseconds += now - start;
    }

    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
    );
    setTodayHours(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
    );
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const data = await apiService.clockIn();
      setStatus("clocked-in");
      setTimeEntry(data.timeEntry);
      fetchAttendanceData(); // Refresh to update totals
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setActionLoading(true);
    try {
      const data = await apiService.startBreak();
      setStatus("on-break");
      setTimeEntry(data.timeEntry);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      const data = await apiService.endBreak();
      setStatus("clocked-in");
      setTimeEntry(data.timeEntry);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmClockOut = async () => {
    setActionLoading(true);
    try {
      await apiService.clockOut(completedTasks);
      setStatus("clocked-out");
      setTimeEntry(null);
      setSessionDuration("00:00:00");
      setShowClockOutModal(false);
      setCompletedTasks("");
      fetchAttendanceData(); // Refresh totals
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
        <Skeleton className="h-6 w-1/3 rounded mb-4" />
        <Skeleton className="h-20 w-full rounded" />
      </div>
    );
  }

  const isCheckedIn = status === "clocked-in";
  const isOnBreak = status === "on-break";

  return (
    <div className="bg-bg-card rounded-lg shadow-sm border border-border overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          isCheckedIn
            ? "from-indigo-500 to-purple-500"
            : isOnBreak
            ? "from-yellow-400 to-orange-400"
            : "from-gray-400 to-gray-300"
        }`}
      />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-lg ${
              isCheckedIn
                ? "bg-indigo-100 text-indigo-600"
                : isOnBreak
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <Clock size={24} />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Time Tracking</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Live Session Card */}
          <div
            className={`relative overflow-hidden rounded-xl p-5 border transition-all duration-300 ${
              isCheckedIn
                ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                : isOnBreak
                ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
                : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
            }`}
          >
            <div className="relative z-10 flex flex-row justify-between items-center">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">
                  {isOnBreak ? "On Break" : "Current Session"}
                </p>
                <h3
                  className={`text-3xl font-mono font-bold tracking-tight ${
                    isCheckedIn
                      ? "text-indigo-700"
                      : isOnBreak
                      ? "text-yellow-700"
                      : "text-gray-400"
                  }`}
                >
                  {sessionDuration}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {isCheckedIn && (
                  <>
                    <span className="flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                      Live
                    </span>
                  </>
                )}
                {isOnBreak && (
                  <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                    Paused
                  </span>
                )}
              </div>
            </div>

            {/* Background decoration */}
            <div
              className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-[0.05] ${
                isCheckedIn
                  ? "bg-indigo-500"
                  : isOnBreak
                  ? "bg-yellow-500"
                  : "bg-gray-500"
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === "clocked-out" && (
              <button
                onClick={handleClockIn}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                Clock In
              </button>
            )}

            {status === "clocked-in" && (
              <>
                <button
                  onClick={handleStartBreak}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Coffee size={16} />
                  )}
                  Break
                </button>
                <button
                  onClick={() => setShowClockOutModal(true)}
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
                >
                  {actionLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <LogOut size={16} />
                  )}
                  Clock Out
                </button>
              </>
            )}

            {status === "on-break" && (
              <button
                onClick={handleEndBreak}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                Resume Work
              </button>
            )}
          </div>

          {/* Total Work Hours Footnote */}
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-text-secondary">Total Today</p>
            <p className="text-sm font-bold text-text-primary">
              {todayHours} hrs
            </p>
          </div>
        </div>
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-bg-card rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-border">
            <div className="p-4 border-b border-border bg-bg-main">
              <h3 className="font-semibold text-text-primary">Clock Out</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Today's Completed Tasks
                </label>
                <textarea
                  value={completedTasks}
                  onChange={(e) => setCompletedTasks(e.target.value)}
                  placeholder="Summary of what you worked on today..."
                  className="w-full p-2 border border-border rounded-lg bg-bg-card focus:outline-none focus:border-brand-primary min-h-[100px] text-sm text-text-primary resize-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowClockOutModal(false)}
                  className="px-4 py-2 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClockOut}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2"
                >
                  {actionLoading && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  Confirm Clock Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
