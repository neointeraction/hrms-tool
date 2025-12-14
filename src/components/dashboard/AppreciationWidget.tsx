import React, { useEffect, useState } from "react";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../services/api.service";
import { Button } from "../common/Button";

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

export default function AppreciationWidget() {
  const [appreciations, setAppreciations] = useState<AppreciationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchAppreciations();
  }, []);

  const fetchAppreciations = async () => {
    try {
      // Fetch all recent appreciations to show in dashboard
      const data = await apiService.getAppreciations();
      setAppreciations(data.slice(0, 5)); // Show only latest 5
    } catch (err) {
      console.error("Failed to fetch appreciations", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % appreciations.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + appreciations.length) % appreciations.length
    );
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm h-full animate-pulse">
        <div className="h-6 w-1/3 bg-bg-hover rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-bg-hover rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Award className="text-brand-primary" size={20} />
          </div>
          <h3 className="font-semibold text-lg text-text-primary">
            Wall of Fame
          </h3>
        </div>
        {appreciations.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs text-text-secondary font-medium">
              {currentIndex + 1} / {appreciations.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="h-8 w-8 p-0 rounded-full"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[120px]">
        {appreciations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg p-8">
            <p>No appreciations yet.</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            <div className="bg-bg-main p-6 rounded-lg border border-border flex flex-col items-center text-center gap-3 relative overflow-hidden">
              {/* Background decorative blob */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

              <div className="bg-white p-2 rounded-full shadow-sm border border-border z-10">
                {appreciations[currentIndex].badge ? (
                  <img
                    src={
                      appreciations[currentIndex].badge.icon.startsWith("http")
                        ? appreciations[currentIndex].badge.icon
                        : `${ASSET_BASE_URL}${appreciations[currentIndex].badge.icon}`
                    }
                    alt={appreciations[currentIndex].badge.title}
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center">
                    <Award className="w-8 h-8 text-text-muted opacity-50" />
                  </div>
                )}
              </div>

              <div className="z-10">
                <p className="text-sm text-text-secondary">
                  <span className="font-bold text-text-primary">
                    {appreciations[currentIndex].recipient.firstName}{" "}
                    {appreciations[currentIndex].recipient.lastName}
                  </span>{" "}
                  was awarded
                </p>
                <p className="font-bold text-brand-primary text-base">
                  {appreciations[currentIndex].badge?.title || "Unknown Badge"}
                </p>
              </div>

              {appreciations[currentIndex].message && (
                <p className="text-xs text-text-muted italic max-w-[90%] z-10">
                  "{appreciations[currentIndex].message}"
                </p>
              )}

              <div className="mt-2 text-[10px] text-text-muted uppercase tracking-wider z-10">
                By {appreciations[currentIndex].sender.firstName} •{" "}
                {new Date(
                  appreciations[currentIndex].createdAt
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
