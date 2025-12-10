import { create } from "zustand";
import { apiService } from "../services/api.service";

interface AppState {
  leaveStats: any[] | null;
  workStats: { totalHours: number; onTimePercentage: number } | null;
  holidays: any[] | null;

  fetchDashboardData: () => Promise<void>;
  fetchLeaveStats: () => Promise<void>;
  fetchHolidays: () => Promise<void>;
  widgetAnimationPlayed: boolean;
  setWidgetAnimationPlayed: () => void;

  // Notifications
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  leaveStats: null,
  workStats: null,
  holidays: null,
  widgetAnimationPlayed: false,

  // Notifications
  notifications: [],
  unreadCount: 0,

  setWidgetAnimationPlayed: () => set({ widgetAnimationPlayed: true }),

  fetchDashboardData: async () => {
    // Only fetch if data is missing or stale? For now, simpler caching.
    // We can call specific fetchers
    await Promise.all([get().fetchLeaveStats(), get().fetchHolidays()]);

    // Work Stats fetch logic is complex (needs dates), keeping inside component for now or moving here with params?
    // Let's keep work stats in component as it depends on "Start of Month" which changes contextually or is simple enough to refactor?
    // Use the logic from EmployeeDashboard for consistency.
    try {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      ).toISOString();
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0
      ).toISOString();

      const [timesheetResponse, attendanceResponse] = await Promise.all([
        apiService.getTimesheetEntries({
          startDate: startOfMonth,
          endDate: endOfMonth,
        }),
        apiService.getAttendanceHistory({
          startDate: startOfMonth,
          endDate: endOfMonth,
        }),
      ]);

      // Process Work Stats
      const entries = Array.isArray(timesheetResponse)
        ? timesheetResponse
        : timesheetResponse.data || [];
      const totalHours = entries.reduce(
        (acc: number, entry: any) => acc + (Number(entry.duration) || 0),
        0
      );

      const attendanceLogs = Array.isArray(attendanceResponse)
        ? attendanceResponse
        : attendanceResponse.data || attendanceResponse.history || [];

      let onTimeCount = 0;
      let totalPresentDays = 0;
      attendanceLogs.forEach((log: any) => {
        if (log.clockIn) {
          totalPresentDays++;
          const clockInTime = new Date(log.clockIn);
          const hours = clockInTime.getHours();
          const minutes = clockInTime.getMinutes();
          if (hours < 9 || (hours === 9 && minutes <= 30)) {
            onTimeCount++;
          }
        }
      });
      const onTimePercentage =
        totalPresentDays > 0
          ? Math.round((onTimeCount / totalPresentDays) * 100)
          : 0;

      set({
        workStats: { totalHours: Math.round(totalHours), onTimePercentage },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard work stats", error);
    }
  },

  fetchLeaveStats: async () => {
    try {
      if (get().leaveStats) return; // Prevent re-fetch if exists
      const data = await apiService.getLeaveStats();
      set({ leaveStats: data.stats });
    } catch (error) {
      console.error("Failed to fetch leave stats:", error);
    }
  },

  fetchHolidays: async () => {
    try {
      if (get().holidays) return; // Prevent re-fetch
      const data = await apiService.getHolidays();
      set({ holidays: data.data || [] });
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    }
  },

  // Notifications
  fetchNotifications: async () => {
    try {
      const data = await apiService.getNotifications();
      // data is array of notifications
      const notifications = Array.isArray(data) ? data : [];
      const unreadCount = notifications.filter((n: any) => !n.read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  },
  markNotificationRead: async (id: string) => {
    try {
      // Optimistic update
      const { notifications } = get();

      if (id === "all") {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        set({ notifications: updated, unreadCount: 0 });
        await apiService.markNotificationRead("all");
      } else {
        const updated = notifications.map((n) =>
          n._id === id ? { ...n, read: true } : n
        );
        const unreadCount = updated.filter((n) => !n.read).length;
        set({ notifications: updated, unreadCount });
        await apiService.markNotificationRead(id);
      }
    } catch (error) {
      console.error("Failed to mark notification read", error);
      // Revert fetch if needed, but simple log is enough for now
      get().fetchNotifications();
    }
  },

  resetStore: () => {
    set({
      leaveStats: null,
      workStats: null,
      holidays: null,
      notifications: [],
      unreadCount: 0,
    });
  },
}));
