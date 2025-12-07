import { useState, useRef, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  Info,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Leave Request Approved",
      message: "Your leave request for Dec 10-12 has been approved.",
      time: "2 hours ago",
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "New Policy Update",
      message: "Please review the updated remote work policy.",
      time: "5 hours ago",
      type: "info",
      read: false,
    },
    {
      id: 3,
      title: "Timesheet Reminder",
      message: "Don't forget to submit your timesheet for this week.",
      time: "1 day ago",
      type: "warning",
      read: true,
    },
    {
      id: 4,
      title: "System Maintenance",
      message: "Scheduled maintenance on Saturday at 10 PM.",
      time: "2 days ago",
      type: "info",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "error":
        return <AlertTriangle size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-text-secondary p-2 rounded-full hover:bg-bg-hover relative transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border hover:bg-bg-hover transition-colors relative group ${
                      !notification.read ? "bg-brand-primary/5" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "font-semibold text-text-primary"
                              : "text-text-secondary"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                          {notification.time}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-text-muted hover:text-status-error opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="absolute inset-0 w-full h-full cursor-pointer bg-transparent"
                        aria-label="Mark as read"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border text-center">
            <button className="text-xs text-text-secondary hover:text-brand-primary transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
