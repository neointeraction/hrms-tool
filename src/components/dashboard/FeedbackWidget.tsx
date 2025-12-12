import React, { useEffect, useState } from "react";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Button } from "../common/Button";

interface FeedbackItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}

export default function FeedbackWidget() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const data = await apiService.getMyFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % feedbacks.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + feedbacks.length) % feedbacks.length);
  };

  if (loading) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm h-full animate-pulse ">
        <div className="h-6 w-1/3 bg-bg-hover rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-bg-hover rounded"></div>
          <div className="h-16 bg-bg-hover rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm h-full md:col-span-2 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <MessageSquareQuote className="text-brand-primary" size={20} />
          </div>
          <h3 className="font-semibold text-lg text-text-primary">
            Recent Feedback
          </h3>
        </div>
        {feedbacks.length > 1 && (
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
              {currentIndex + 1} / {feedbacks.length}
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
        {feedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-text-muted text-sm border-2 border-dashed border-border rounded-lg p-8">
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 w-full">
            <div className="bg-bg-main p-6 rounded-lg border border-border relative">
              <MessageSquareQuote
                className="absolute top-4 left-4 text-brand-primary/10 rotate-180"
                size={40}
              />
              <p className="text-text-primary text-base italic mb-6 relative z-10 text-center px-4">
                "{feedbacks[currentIndex].message}"
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-text-muted relative z-10 border-t border-border/50 pt-4 w-full">
                <span className="font-semibold text-brand-primary">
                  {feedbacks[currentIndex].sender.name}
                </span>
                <span>•</span>
                <span>
                  {new Date(
                    feedbacks[currentIndex].createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
