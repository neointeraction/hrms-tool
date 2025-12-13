import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Skeleton } from "../../../components/common/Skeleton";
import { apiService } from "../../../services/api.service";

export default function AttendanceWidget() {
  const [status, setStatus] = useState<{
    isCheckedIn: boolean;
    clockInTime: string | null;
    lastActionTime: string | null;
  }>({
    isCheckedIn: false,
    clockInTime: null,
    lastActionTime: null,
  });

  const [todayHours, setTodayHours] = useState<string>("00:00");
  const [sessionDuration, setSessionDuration] = useState<string>("00:00:00");
  const [loading, setLoading] = useState(true);

  // Live session timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status.isCheckedIn && status.clockInTime) {
      interval = setInterval(() => {
        const start = new Date(status.clockInTime!).getTime();
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
  }, [status.isCheckedIn, status.clockInTime]);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(
          today.setHours(23, 59, 59, 999)
        ).toISOString();

        // Fetch Status
        const statusData = await apiService.getAttendanceStatus();
        // Backend returns "clocked-in" or "on-break", sometimes "checked-in" in older versions?
        // We should check for "clocked-in" as per the controller code seen.
        const isCheckedIn =
          statusData?.status === "clocked-in" ||
          statusData?.status === "checked-in" ||
          statusData?.isCheckedIn;

        // Determine latest clock in time - Fix: Access timeEntry.clockIn
        const clockInTime = isCheckedIn
          ? statusData?.timeEntry?.clockIn ||
            statusData?.lastActionTime ||
            statusData?.lastPunchTime
          : null;

        setStatus({
          isCheckedIn: !!isCheckedIn,
          clockInTime: clockInTime,
          lastActionTime:
            statusData?.lastActionTime || statusData?.lastPunchTime || null,
        });

        // Fetch History for Today to calculate hours
        const historyData = await apiService.getAttendanceHistory({
          startDate: startOfDay,
          endDate: endOfDay,
        });

        // Fix: backend returns { entries: [...] }
        const logs = Array.isArray(historyData)
          ? historyData
          : historyData.entries || historyData.history || [];

        // Calculate Total Hours (completed sessions + current session)
        let totalMilliseconds = 0;
        logs.forEach((log: any) => {
          if (log.clockIn && log.clockOut) {
            const start = new Date(log.clockIn).getTime();
            const end = new Date(log.clockOut).getTime();
            totalMilliseconds += end - start;
          } else if (log.clockIn && isCheckedIn) {
            const start = new Date(log.clockIn).getTime();
            const now = new Date().getTime();
            totalMilliseconds += now - start;
          }
        });

        const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor(
          (totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
        );
        setTodayHours(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`
        );
      } catch (err) {
        // console.error("Failed to fetch attendance widget data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
    const dataInterval = setInterval(fetchAttendanceData, 60000);
    return () => clearInterval(dataInterval);
  }, []);

  if (loading) {
    return (
      <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
        <Skeleton className="h-6 w-1/3 rounded mb-4" />
        <Skeleton className="h-20 w-full rounded" />
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-lg shadow-sm border border-border overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
          status.isCheckedIn
            ? "from-indigo-500 to-purple-500"
            : "from-gray-400 to-gray-300"
        }`}
      />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`p-2 rounded-lg ${
              status.isCheckedIn
                ? "bg-indigo-100 text-indigo-600"
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
              status.isCheckedIn
                ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                : "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
            }`}
          >
            <div className="relative z-10 flex flex-row justify-between items-center">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-1">
                  Current Session
                </p>
                <h3
                  className={`text-3xl font-mono font-bold tracking-tight ${
                    status.isCheckedIn ? "text-indigo-700" : "text-gray-400"
                  }`}
                >
                  {sessionDuration}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {status.isCheckedIn && (
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
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-indigo-500 opacity-[0.05]" />
          </div>

          {/* Total Work Hours Card */}
          <div className="rounded-xl flex flex-row justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-text-secondary">
                  Total Today
                </p>
              </div>
              <h5 className="text-1xl font-bold text-text-primary tracking-tight">
                {todayHours} hrs
              </h5>
            </div>
            {status.clockInTime && (
              <div className="text-right">
                <p className="text-xs text-text-secondary">Started at</p>
                <p className="font-medium text-text-primary text-1xl">
                  {new Date(status.clockInTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
