import { useState, useEffect } from "react";
import { Clock, Coffee, LogIn, LogOut, Loader2 } from "lucide-react";
import { apiService } from "../../../services/api.service";

export default function ClockInOut() {
  const [status, setStatus] = useState<
    "clocked-out" | "clocked-in" | "on-break"
  >("clocked-out");
  const [timeEntry, setTimeEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch current status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Update elapsed time every second when clocked in
  useEffect(() => {
    if (status !== "clocked-out" && timeEntry?.clockIn) {
      const interval = setInterval(() => {
        const start = new Date(timeEntry.clockIn).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, timeEntry]);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getAttendanceStatus();
      setStatus(data.status);
      setTimeEntry(data.timeEntry);
    } catch (error: any) {
      console.error("Failed to fetch status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      const data = await apiService.clockIn();
      setStatus("clocked-in");
      setTimeEntry(data.timeEntry);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await apiService.clockOut();
      setStatus("clocked-out");
      setTimeEntry(null);
      setElapsedTime(0);
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Status Card */}
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white rounded-lg p-8 text-center shadow-lg">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock size={32} />
          <h2 className="text-2xl font-bold">
            {status === "clocked-out" && "Not Clocked In"}
            {status === "clocked-in" && "Currently Working"}
            {status === "on-break" && "On Break"}
          </h2>
        </div>

        {status !== "clocked-out" && (
          <div className="space-y-2">
            <p className="text-white/90 text-sm">
              Clocked in at{" "}
              {timeEntry?.clockIn
                ? new Date(timeEntry.clockIn).toLocaleTimeString()
                : "N/A"}
            </p>
            <div className="text-5xl font-mono font-bold tracking-wider">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-white/80 text-sm">Hours worked today</p>
          </div>
        )}

        {status === "clocked-out" && (
          <p className="text-white/90 mt-2">
            Click below to start your workday
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        {status === "clocked-out" && (
          <button
            onClick={handleClockIn}
            disabled={actionLoading}
            className="col-span-2 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <LogIn size={20} />
            )}
            Clock In
          </button>
        )}

        {status === "clocked-in" && (
          <>
            <button
              onClick={handleStartBreak}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Coffee size={20} />
              )}
              Start Break
            </button>
            <button
              onClick={handleClockOut}
              disabled={actionLoading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <LogOut size={20} />
              )}
              Clock Out
            </button>
          </>
        )}

        {status === "on-break" && (
          <>
            <button
              onClick={handleEndBreak}
              disabled={actionLoading}
              className="col-span-2 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Coffee size={20} />
              )}
              End Break
            </button>
          </>
        )}
      </div>

      {/* Today's Summary */}
      {timeEntry && (
        <div className="bg-bg-main rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-text-primary mb-3">
            Today's Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-secondary">Clock In</p>
              <p className="font-medium text-text-primary">
                {new Date(timeEntry.clockIn).toLocaleTimeString()}
              </p>
            </div>
            {timeEntry.clockOut && (
              <div>
                <p className="text-text-secondary">Clock Out</p>
                <p className="font-medium text-text-primary">
                  {new Date(timeEntry.clockOut).toLocaleTimeString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-text-secondary">Total Breaks</p>
              <p className="font-medium text-text-primary">
                {timeEntry.breaks?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-text-secondary">Break Time</p>
              <p className="font-medium text-text-primary">
                {timeEntry.totalBreakMinutes || 0} min
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
