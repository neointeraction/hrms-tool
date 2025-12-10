import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
  } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Poll every minute for new notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationRead("all");
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationRead(notification._id);
    }
    setIsOpen(false);

    // Navigate based on type
    if (notification.type === "LEAVE") {
      navigate("/leave");
    } else if (notification.type === "TIMESHEET") {
      navigate("/attendance"); // Timesheets are under Attendance
    } else if (notification.type === "PAYROLL") {
      navigate("/payroll"); // Assuming payroll route
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "LEAVE":
        return "text-orange-500 bg-orange-50";
      case "TIMESHEET":
        return "text-blue-500 bg-blue-50";
      case "PAYROLL":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-bg-hover rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-bg-card rounded-lg shadow-lg border border-border animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ zIndex: 99999 }}
        >
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-primary hover:text-brand-dark flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-border last:border-0 cursor-pointer hover:bg-bg-hover transition-colors ${
                    !notification.read ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon Placeholder based on type? */}
                    <div
                      className={`p-2 rounded-lg h-fit ${getIconColor(
                        notification.type
                      )}`}
                    >
                      <Bell size={16} /> {/* Could make dynamic icons later */}
                    </div>
                    <div>
                      <p
                        className={`text-sm ${
                          !notification.read ? "font-semibold" : "font-medium"
                        } text-text-primary`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-text-tertiary mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
