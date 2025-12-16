import { useEffect, useState, useRef } from "react";
import { apiService, ASSET_BASE_URL } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";
import { Tooltip } from "../common/Tooltip";
import confetti from "canvas-confetti";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Badge {
  _id: string;
  title: string;
  icon: string;
}

interface AppreciationItem {
  _id: string;
  sender: {
    firstName: string;
    lastName: string;
  };
  recipient: {
    firstName: string;
    lastName: string;
  };
  badge: Badge;
  message: string;
  createdAt: string;
}

interface BadgeGroup {
  badge: Badge;
  count: number;
  isNew?: boolean;
}

export default function AppreciationWidget() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<BadgeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (user) {
      fetchUserAppreciations();
    }
  }, [user]);

  const triggerConfetti = (rect: DOMRect) => {
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x, y },
      colors: [
        "#FFD700",
        "#FF69B4",
        "#00BFFF",
        "#32CD32",
        "#FF4500",
        "#9370DB",
      ],
      gravity: 1.0,
      scalar: 1.2,
      startVelocity: 30,
      ticks: 200,
      zIndex: 10000,
    });
  };

  const checkNewBadges = (
    badges: BadgeGroup[],
    allAppreciations: AppreciationItem[]
  ) => {
    // Determine the correct user ID (handles both id and _id)
    const userId = user?.id || (user as any)?._id;
    if (!userId) return badges;

    // Use backend 'isSeen' flag instead of localStorage
    // Identify appreciations that are NOT seen
    const unseenAppreciations = allAppreciations.filter(
      (a) => !(a as any).isSeen
    );

    // Find badge IDs corresponding to unseen appreciations
    const newBadgeIds = unseenAppreciations.map((a) => a.badge._id);

    if (newBadgeIds.length > 0) {
      // Mark them as new in state for potential UI highlighting
      badges = badges.map((b) => ({
        ...b,
        isNew: newBadgeIds.includes(b.badge._id),
      }));

      // Trigger confetti for each new badge after a short delay
      setTimeout(() => {
        // Unique badges to trigger confetti for
        const uniqueNewBadgeIds = Array.from(new Set(newBadgeIds));

        uniqueNewBadgeIds.forEach((id) => {
          const element = document.getElementById(`badge-${id}`);
          if (element) {
            const rect = element.getBoundingClientRect();
            triggerConfetti(rect);
          }
        });

        // Calling API to mark as seen persistently
        const unseenIds = unseenAppreciations.map((a) => a._id);
        if (unseenIds.length > 0) {
          apiService.markAppreciationsAsSeen(unseenIds).catch((err) => {
            console.error("Failed to mark appreciations as seen", err);
          });
        }
      }, 500);
    }

    return badges;
  };

  const fetchUserAppreciations = async () => {
    try {
      const userId = user?.id || (user as any)?._id;

      if (!userId) {
        return;
      }

      const data: AppreciationItem[] = await apiService.getAppreciations({
        recipientId: userId,
      });

      // Group by unique badge
      const badgeMap = new Map<string, BadgeGroup>();

      data.forEach((item) => {
        if (item.badge) {
          const existing = badgeMap.get(item.badge._id);
          if (existing) {
            existing.count += 1;
          } else {
            badgeMap.set(item.badge._id, {
              badge: item.badge,
              count: 1,
            });
          }
        }
      });

      let badges = Array.from(badgeMap.values());

      // Only check for new badges on first load per session/mount
      if (!initialized.current) {
        badges = checkNewBadges(badges, data);
        initialized.current = true;
      }

      setUserBadges(badges);
    } catch (err) {
      console.error("Failed to fetch appreciations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerConfetti(rect);
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (startIndex + 5 < userBadges.length) {
      setStartIndex((prev) => Math.min(userBadges.length - 5, prev + 1));
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-10 bg-bg-hover rounded-full"></div>
        ))}
      </div>
    );
  }

  if (userBadges.length === 0) return null;

  const visibleBadges = userBadges.slice(startIndex, startIndex + 5);
  const showPrev = startIndex > 0;
  const showNext = startIndex + 5 < userBadges.length;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden max-w-full">
      {/* Prev Arrow */}
      {showPrev && (
        <button
          onClick={handlePrev}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div className="flex items-center gap-3">
        {visibleBadges.map((item) => (
          <Tooltip
            key={item.badge._id}
            content={`${item.badge.title} (x${item.count})`}
          >
            <div
              id={`badge-${item.badge._id}`}
              onClick={handleBadgeClick}
              className={`flex-shrink-0 relative group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                item.isNew ? "animate-bounce" : ""
              }`}
            >
              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 bg-brand-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Badge Count Badge (Meta-Badge) */}
              {item.count > 1 && (
                <div className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-primary to-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10 border border-white dark:border-gray-800 shadow-sm leading-none ring-1 ring-black/5">
                  {item.count}
                </div>
              )}

              <div className="w-10 h-10 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-full border border-white/30 dark:border-white/10 shadow-sm group-hover:border-brand-primary/30 transition-colors">
                <img
                  src={
                    item.badge.icon.startsWith("http")
                      ? item.badge.icon
                      : `${ASSET_BASE_URL}${item.badge.icon}`
                  }
                  alt={item.badge.title}
                  className="w-7 h-7 object-contain drop-shadow-sm group-hover:scale-125 transition-transform duration-300"
                />
              </div>
            </div>
          </Tooltip>
        ))}
      </div>

      {/* Next Arrow */}
      {showNext && (
        <button
          onClick={handleNext}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-text-secondary transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
