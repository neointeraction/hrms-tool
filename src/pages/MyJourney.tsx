import { useEffect, useState } from "react";
import { Rocket } from "lucide-react";
import {
  JourneyTimeline,
  JourneyTimelineSkeleton,
} from "../features/employee/components/JourneyTimeline";
import { API_BASE_URL } from "../services/api.service";

export default function MyJourney() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
          My Journey <Rocket className="text-brand-primary" size={32} />
        </h1>
        <p className="text-text-secondary mt-1">
          Tracking your milestones and career progression with us.
        </p>
      </div>

      <div className="bg-bg-card rounded-xl border border-border shadow-sm p-6">
        <JourneyTimelineWrapper />
      </div>
    </div>
  );
}

// Wrapper to fetch employee ID if needed
function JourneyTimelineWrapper() {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyEmployeeId = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // getMe returns { user: { ... } }
          if (data.user && data.user.employeeDbId) {
            setEmployeeId(data.user.employeeDbId);
          } else {
            console.error("Employee DB ID not found in profile");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEmployeeId();
  }, []);

  if (loading) {
    return <JourneyTimelineSkeleton />;
  }

  if (!employeeId) {
    return (
      <div className="text-center text-text-muted">
        Unable to load timeline.
      </div>
    );
  }

  return <JourneyTimeline employeeId={employeeId} />;
}
