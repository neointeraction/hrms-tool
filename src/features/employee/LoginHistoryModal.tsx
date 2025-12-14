import { X, MapPin, Monitor, Clock } from "lucide-react";
import { format } from "date-fns";
import type { User } from "../../types/auth";

interface LoginHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User & { loginHistory?: any[] };
}

export default function LoginHistoryModal({
  isOpen,
  onClose,
  user,
}: LoginHistoryModalProps) {
  if (!isOpen) return null;

  // Sort history by timestamp descending
  const history = [...(user.loginHistory || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Login History
            </h2>
            <p className="text-sm text-text-secondary">
              Recent login activity for {user.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-hover rounded-lg transition-colors"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No login history recorded available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 px-4">
                <div>Time</div>
                <div>Device / IP</div>
                <div>Location</div>
              </div>
              <div className="space-y-2">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 p-4 bg-bg-main rounded-lg text-sm border border-border"
                  >
                    <div className="flex flex-col justify-center">
                      <span className="font-medium text-text-primary">
                        {format(new Date(entry.timestamp), "MMM dd, yyyy")}
                      </span>
                      <span className="text-text-secondary text-xs">
                        {format(new Date(entry.timestamp), "hh:mm a")}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="flex items-center gap-2 text-text-primary">
                        <Monitor size={14} className="text-text-muted" />
                        <span
                          className="truncate max-w-[150px]"
                          title={entry.device}
                        >
                          {entry.device?.includes("Mozilla")
                            ? "Web Browser"
                            : entry.device || "Unknown"}
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary pl-6">
                        {entry.ip || "Unknown IP"}
                      </span>
                    </div>

                    <div className="flex flex-col justify-center">
                      {entry.location ? (
                        <div className="flex items-start gap-2">
                          <MapPin
                            size={14}
                            className="text-brand-primary mt-0.5"
                          />
                          <div>
                            <a
                              href={`https://www.google.com/maps?q=${entry.location.lat},${entry.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-primary hover:underline font-medium"
                            >
                              View Map
                            </a>
                            <div className="text-xs text-text-secondary mt-0.5">
                              {entry.location.lat.toFixed(4)},{" "}
                              {entry.location.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-text-muted italic flex items-center gap-2">
                          <MapPin size={14} className="opacity-50" />
                          Not available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-bg-card rounded-b-xl">
          <p className="text-xs text-text-muted text-center">
            Showing last {history.length} login attempts.
          </p>
        </div>
      </div>
    </div>
  );
}
