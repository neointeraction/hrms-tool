import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { apiService } from "../services/api.service";
import { Toast, type ToastType } from "../components/common/Toast";

interface NotificationContextType {
  unreadSocialCount: number;
  clearSocialNotifications: () => void;
  showToast: (message: string, type: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadSocialCount, setUnreadSocialCount] = useState(0);
  const lastCheckedRef = useRef(new Date().toISOString());
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  // Simple notification sound (Beep) using Web Audio API
  const playNotificationSound = () => {
    try {
      // @ts-ignore - Handle cross-browser compatibility
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(500, ctx.currentTime);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  // Polling for Social Wall
  useEffect(() => {
    if (!user) return;

    console.log("Starting Social Wall polling...");

    const intervalId = setInterval(async () => {
      try {
        const checkTime = lastCheckedRef.current;
        // Update ref immediately to cover the window we are about to check
        // Or better: update it to now, so next check is from now.
        // Actually, we want to query > checkTime.
        // Then next time we query > (time of this check).
        const nextCheckTime = new Date().toISOString();

        const result = await apiService.checkNewSocialPosts(checkTime);

        // Update checkpoint for next poll
        lastCheckedRef.current = nextCheckTime;

        if (result.count > 0) {
          console.log("New posts found:", result.count);
          setUnreadSocialCount((prev) => prev + result.count);

          if (result.latestPost) {
            const authorName = `${result.latestPost.author?.firstName} ${
              result.latestPost.author?.lastName || ""
            }`.trim();
            // Don't show toast if I created the post
            if (
              result.latestPost.author._id !== user.employeeId &&
              result.latestPost.author !== user.employeeId
            ) {
              showToast(`New post from ${authorName}`, "info");
              playNotificationSound();
            }
          }
        }
      } catch (error) {
        console.error("Polling error", error);
      }
    }, 15000); // Poll every 15s

    return () => clearInterval(intervalId);
  }, [user]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const clearSocialNotifications = () => {
    setUnreadSocialCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{ unreadSocialCount, clearSocialNotifications, showToast }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-24 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
