import { useState, useEffect } from "react";
import {
  Clock,
  Coffee,
  LogOut,
  Loader2,
  Play,
  Calendar,
  Sun,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Skeleton } from "../../../components/common/Skeleton";
import { apiService } from "../../../services/api.service";
import { Modal } from "../../../components/common/Modal";
import { Select } from "../../../components/common/Select";

export default function ClockInOut() {
  const [status, setStatus] = useState<
    "clocked-out" | "clocked-in" | "on-break"
  >("clocked-out");
  const [timeEntry, setTimeEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftInfo, setShiftInfo] = useState<any>(null);

  const [showClockOutModal, setShowClockOutModal] = useState(false);
  const [completedTasks, setCompletedTasks] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Leave restriction state
  const [showLeaveErrorModal, setShowLeaveErrorModal] = useState(false);
  const [leaveErrorMessage, setLeaveErrorMessage] = useState("");
  const [clockInDisabled, setClockInDisabled] = useState(false);

  // Fetch current status and shift info on mount
  useEffect(() => {
    fetchStatus();
    fetchShiftInfo();
  }, []);

  // Fetch Projects when Modal Opens
  useEffect(() => {
    if (showClockOutModal) {
      fetchProjects();
    }
  }, [showClockOutModal]);

  // Fetch Tasks when Project Selected
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject);
    } else {
      setTasks([]);
      setSelectedTask("");
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const { projects } = await apiService.getProjects();
      const options = projects.map((p: any) => ({
        value: p._id,
        label: p.name,
      }));
      setProjects(options);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchTasks = async (projectId: string) => {
    try {
      setLoadingTasks(true);
      const { tasks } = await apiService.getTasks({ projectId });
      const options = tasks.map((t: any) => ({
        value: t._id,
        label: t.title,
      }));
      setTasks(options);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch shift information
  const fetchShiftInfo = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      if (currentUser?.user?.shiftId) {
        setShiftInfo(currentUser.user.shiftId);
      }
    } catch (error) {
      console.error("Failed to fetch shift info:", error);
    }
  };

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
      if (
        error.message &&
        error.message.toLowerCase().includes("approved leave")
      ) {
        setLeaveErrorMessage(error.message);
        setShowLeaveErrorModal(true);
        setClockInDisabled(true);
      } else {
        alert(error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOutClick = () => {
    setShowClockOutModal(true);
  };

  const confirmClockOut = async () => {
    setActionLoading(true);
    try {
      await apiService.clockOut(completedTasks, selectedProject, selectedTask);
      setStatus("clocked-out");
      setTimeEntry(null);
      setElapsedTime(0);
      setShowClockOutModal(false);
      setCompletedTasks("");
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

  const getWorkProgress = () => {
    if (!shiftInfo || !timeEntry?.clockIn) return 0;
    const shiftStart = new Date();
    const [startHour, startMin] = shiftInfo.startTime.split(":").map(Number);
    shiftStart.setHours(startHour, startMin, 0);

    const shiftEnd = new Date();
    const [endHour, endMin] = shiftInfo.endTime.split(":").map(Number);
    shiftEnd.setHours(endHour, endMin, 0);

    const totalShiftDuration = shiftEnd.getTime() - shiftStart.getTime();
    const elapsed = Date.now() - new Date(timeEntry.clockIn).getTime();
    return Math.min((elapsed / totalShiftDuration) * 100, 100);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const workProgress = getWorkProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Compact Shift Info */}
      {shiftInfo && (
        <div className="bg-bg-card rounded-xl p-4 border border-border shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Calendar className="text-brand-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Your Shift</p>
                <p className="font-semibold text-text-primary text-lg">
                  {shiftInfo.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-text-secondary" />
                <span className="text-text-primary font-medium">
                  {shiftInfo.startTime} - {shiftInfo.endTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-text-secondary" />
                <span className="text-text-primary font-medium">
                  {shiftInfo.workingDays?.length === 5 &&
                  shiftInfo.workingDays.includes("Monday") &&
                  shiftInfo.workingDays.includes("Friday")
                    ? "Mon - Fri"
                    : shiftInfo.workingDays?.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Status Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-8 text-white shadow-2xl">
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
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center animate-pulse">
              {status === "clocked-out" && <Clock size={32} />}
              {status === "clocked-in" && (
                <Activity size={32} className="animate-pulse" />
              )}
              {status === "on-break" && <Coffee size={32} />}
            </div>
            <div className="text-left">
              <h3 className="text-3xl font-bold">
                {status === "clocked-out" && "Ready to Start"}
                {status === "clocked-in" && "You're Productive!"}
                {status === "on-break" && "Taking a Break"}
              </h3>
              <p className="text-white/80 text-sm">
                {status === "clocked-out" && "Click below to begin your day"}
                {status === "clocked-in" && "Keep up the great work"}
                {status === "on-break" && "Relax and recharge"}
              </p>
            </div>
          </div>

          {status !== "clocked-out" && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white/90 text-sm mb-2">
                  Clocked in at{" "}
                  {timeEntry?.clockIn
                    ? new Date(timeEntry.clockIn).toLocaleTimeString()
                    : "N/A"}
                </p>
                <div className="text-6xl font-mono font-bold tracking-wider mb-2">
                  {formatTime(elapsedTime)}
                </div>
                <p className="text-white/80 text-sm">Hours worked today</p>
              </div>

              {/* Progress Bar */}
              {shiftInfo && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-white/80 mb-2">
                    <span>Shift Progress</span>
                    <span>{Math.round(workProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${workProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {status === "clocked-out" && (
            <div className="text-center py-8">
              <div className="text-7xl mb-4">🚀</div>
              <p className="text-xl text-white/90">
                Start your productive day!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Improved Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {status === "clocked-out" && (
          <button
            onClick={handleClockIn}
            disabled={actionLoading || clockInDisabled}
            className="col-span-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {actionLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Play size={24} />
            )}
            Clock In
          </button>
        )}

        {status === "clocked-in" && (
          <>
            <button
              onClick={handleStartBreak}
              disabled={actionLoading}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {actionLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Coffee size={20} />
              )}
              Start Break
            </button>
            <button
              onClick={handleClockOutClick}
              disabled={actionLoading}
              className="flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl"
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
          <button
            onClick={handleEndBreak}
            disabled={actionLoading}
            className="col-span-full flex items-center justify-center gap-3 px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {actionLoading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Coffee size={24} />
            )}
            End Break & Resume Work
          </button>
        )}
      </div>

      {/* Enhanced Today's Summary */}
      {timeEntry && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-primary" />
            Today's Activity
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-card rounded-xl p-4 border border-border hover:border-brand-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Clock className="text-green-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary mb-1">Clock In</p>
                  <p className="font-semibold text-text-primary truncate">
                    {new Date(timeEntry.clockIn).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {timeEntry.clockOut && (
              <div className="bg-bg-card rounded-xl p-4 border border-border hover:border-brand-primary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <LogOut className="text-red-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary mb-1">
                      Clock Out
                    </p>
                    <p className="font-semibold text-text-primary truncate">
                      {new Date(timeEntry.clockOut).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-bg-card rounded-xl p-4 border border-border hover:border-brand-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Coffee className="text-yellow-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary mb-1">
                    Total Breaks
                  </p>
                  <p className="font-semibold text-text-primary">
                    {timeEntry.breaks?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-bg-card rounded-xl p-4 border border-border hover:border-brand-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary mb-1">Break Time</p>
                  <p className="font-semibold text-text-primary">
                    {timeEntry.totalBreakMinutes || 0} min
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clock Out Modal */}
      {/* Clock Out Modal */}
      <Modal
        isOpen={showClockOutModal}
        onClose={() => setShowClockOutModal(false)}
        title="Clock Out"
        maxWidth="max-w-md"
        hideHeader={true}
        padding="p-0"
      >
        <div className="bg-bg-card rounded-2xl w-full overflow-hidden">
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
                placeholder="• Completed the dashboard redesign&#10;• Fixed critical bugs in the payment module&#10;• Attended team meeting..."
                className="w-full p-3 border border-border rounded-xl bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary min-h-[120px] text-sm text-text-primary resize-none"
                autoFocus
              />
              <p className="text-xs text-text-secondary">
                Optional: Share your key accomplishments for today
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Select
                  label="Project (Optional)"
                  options={projects}
                  value={selectedProject}
                  onChange={(val) => setSelectedProject(val as string)}
                  placeholder="Select Project"
                  disabled={loadingProjects}
                />
              </div>
              <div className="space-y-2">
                <Select
                  label="Task (Optional)"
                  options={tasks}
                  value={selectedTask}
                  onChange={(val) => setSelectedTask(val as string)}
                  placeholder="Select Task"
                  disabled={!selectedProject || loadingTasks}
                />
              </div>
            </div>

            {selectedProject && selectedTask && (
              <p className="text-xs text-status-success bg-status-success/10 px-2 py-1 rounded">
                A timesheet entry will be automatically created.
              </p>
            )}
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
      </Modal>

      {/* Leave Restriction Modal */}
      <Modal
        isOpen={showLeaveErrorModal}
        onClose={() => setShowLeaveErrorModal(false)}
        title="Action Restricted"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
            <Calendar className="shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold">On Leave</p>
              <p className="text-sm mt-1">{leaveErrorMessage}</p>
            </div>
          </div>
          <p className="text-text-secondary text-sm">
            You cannot perform attendance actions on days you have approved
            leave. Please contact HR if this is a mistake.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setShowLeaveErrorModal(false)}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
