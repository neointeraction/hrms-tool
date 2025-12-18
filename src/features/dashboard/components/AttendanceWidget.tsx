import { useState, useEffect } from "react";
import {
  Clock,
  Coffee,
  LogOut,
  Loader2,
  Play,
  Activity,
  TrendingUp,
} from "lucide-react";
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
      <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border">
        <Skeleton className="h-6 w-1/3 rounded mb-4" />
        <Skeleton className="h-32 w-full rounded-xl mb-4" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center border border-brand-primary/20">
              <Clock className="text-brand-primary" size={20} />
            </div>
            Time Tracking
          </h2>
          {status === "clocked-in" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 dark:bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 dark:bg-green-600"></span>
              </span>
              LIVE
            </span>
          )}
        </div>

        {/* Status Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-5 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {status === "clocked-out" && <Clock size={24} />}
                {status === "clocked-in" && (
                  <Activity size={24} className="animate-pulse" />
                )}
                {status === "on-break" && <Coffee size={24} />}
              </div>
              <div>
                <p className="text-white/80 text-xs">
                  {status === "clocked-out" && "Not Working"}
                  {status === "clocked-in" && "Current Session"}
                  {status === "on-break" && "On Break"}
                </p>
                <div className="text-3xl font-mono font-bold tracking-wider">
                  {sessionDuration}
                </div>
              </div>
            </div>

            {status === "clocked-out" && (
              <p className="text-center text-white/90 text-sm mb-4">
                Start your day by clocking in
              </p>
            )}

            {/* Total Today inside card */}
            <div className="border-t border-white/20 pt-3 flex items-center justify-between">
              <p className="text-white/80 text-xs flex items-center gap-1.5">
                <TrendingUp size={14} />
                Total Today
              </p>
              <p className="text-white font-bold font-mono text-sm">
                {todayHours}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {status === "clocked-out" && (
            <button
              onClick={handleClockIn}
              disabled={actionLoading}
              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Play size={18} />
              )}
              Clock In
            </button>
          )}

          {status === "clocked-in" && (
            <>
              <button
                onClick={handleStartBreak}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Coffee size={18} />
                )}
                Break
              </button>
              <button
                onClick={() => setShowClockOutModal(true)}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md"
              >
                {actionLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <LogOut size={18} />
                )}
                Clock Out
              </button>
            </>
          )}

          {status === "on-break" && (
            <button
              onClick={handleEndBreak}
              disabled={actionLoading}
              className="col-span-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-md"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Play size={18} />
              )}
              Resume Work
            </button>
          )}
        </div>
      </div>

      {/* Clock Out Modal */}
      {showClockOutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-border">
            <div className="p-6 border-b border-border bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10">
              <h3 className="font-bold text-xl text-text-primary flex items-center gap-2">
                <LogOut size={24} className="text-brand-primary" />
                Clock Out
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                Great work today! Share what you accomplished
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                  <TrendingUp size={16} />
                  Today's Accomplishments
                </label>
                <textarea
                  value={completedTasks}
                  onChange={(e) => setCompletedTasks(e.target.value)}
                  placeholder="• Completed tasks&#10;• Fixed bugs&#10;• Attended meetings..."
                  className="w-full p-3 border border-border rounded-xl bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[100px] text-sm text-text-primary resize-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowClockOutModal(false)}
                  className="px-6 py-2.5 border border-border rounded-lg text-text-secondary hover:bg-bg-hover text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClockOut}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white rounded-lg hover:opacity-90 text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
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
