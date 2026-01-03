import { useEffect, useState, useMemo } from "react";
import { apiService } from "../../../services/api.service";
import {
  Rocket,
  Trophy,
  CheckCircle,
  TrendingUp,
  Shield,
  Calendar,
  Briefcase,
  Star,
  Clock,
} from "lucide-react";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { cn } from "../../../utils/cn";

interface TimelineEvent {
  type: string;
  date: string;
  title: string;
  description: string;
  icon: string;
}

interface JourneyTimelineProps {
  employeeId: string;
}

const getIcon = (iconName: string) => {
  const size = 20;
  switch (iconName) {
    case "Rocket":
      return <Rocket className="text-white" size={size} />;
    case "Trophy":
      return <Trophy className="text-white" size={size} />;
    case "CheckCircle":
      return <CheckCircle className="text-white" size={size} />;
    case "TrendingUp":
      return <TrendingUp className="text-white" size={size} />;
    case "Shield":
      return <Shield className="text-white" size={size} />;
    case "Briefcase":
      return <Briefcase className="text-white" size={size} />;
    case "Star":
      return <Star className="text-white" size={size} />;
    case "Clock":
      return <Clock className="text-white" size={size} />;
    default:
      return <Calendar className="text-white" size={size} />;
  }
};

const getStyles = (type: string) => {
  switch (type) {
    case "Joined":
      return {
        gradient: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30",
        text: "text-blue-600 dark:text-blue-400",
        bgTint: "bg-blue-50 dark:bg-blue-900/10",
        border: "border-blue-200 dark:border-blue-800",
      };
    case "Anniversary":
      return {
        gradient: "from-amber-400 to-orange-500",
        shadow: "shadow-amber-500/30",
        text: "text-amber-600 dark:text-amber-400",
        bgTint: "bg-amber-50 dark:bg-amber-900/10",
        border: "border-amber-200 dark:border-amber-800",
      };
    case "Probation":
      return {
        gradient: "from-emerald-400 to-green-600",
        shadow: "shadow-emerald-500/30",
        text: "text-emerald-600 dark:text-emerald-400",
        bgTint: "bg-emerald-50 dark:bg-emerald-900/10",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "DesignationChange":
      return {
        gradient: "from-purple-500 to-fuchsia-600",
        shadow: "shadow-purple-500/30",
        text: "text-purple-600 dark:text-purple-400",
        bgTint: "bg-purple-50 dark:bg-purple-900/10",
        border: "border-purple-200 dark:border-purple-800",
      };
    case "Promotion":
      return {
        gradient: "from-purple-500 to-fuchsia-600",
        shadow: "shadow-purple-500/30",
        text: "text-purple-600 dark:text-purple-400",
        bgTint: "bg-purple-50 dark:bg-purple-900/10",
        border: "border-purple-200 dark:border-purple-800",
      };
    case "RoleChange":
      return {
        gradient: "from-indigo-400 to-violet-600",
        shadow: "shadow-indigo-500/30",
        text: "text-indigo-600 dark:text-indigo-400",
        bgTint: "bg-indigo-50 dark:bg-indigo-900/10",
        border: "border-indigo-200 dark:border-indigo-800",
      };
    case "Award":
      return {
        gradient: "from-yellow-400 to-orange-500",
        shadow: "shadow-orange-500/40",
        text: "text-orange-600 dark:text-orange-400",
        bgTint: "bg-orange-50 dark:bg-orange-900/10",
        border: "border-orange-200 dark:border-orange-800",
      };
    case "Project":
      return {
        gradient: "from-cyan-400 to-blue-500",
        shadow: "shadow-cyan-500/30",
        text: "text-cyan-600 dark:text-cyan-400",
        bgTint: "bg-cyan-50 dark:bg-cyan-900/10",
        border: "border-cyan-200 dark:border-cyan-800",
      };
    default:
      return {
        gradient: "from-slate-400 to-slate-600",
        shadow: "shadow-slate-500/30",
        text: "text-slate-600 dark:text-slate-400",
        bgTint: "bg-slate-50 dark:bg-slate-900/10",
        border: "border-slate-200 dark:border-slate-800",
      };
  }
};

export const JourneyTimeline = ({ employeeId }: JourneyTimelineProps) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await apiService.getEmployeeTimeline(employeeId);
        setTimeline(data);
      } catch (err: any) {
        setError(err.message || "Failed to load timeline");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchTimeline();
    }
  }, [employeeId]);

  // Calculate Stats
  const stats = useMemo(() => {
    if (!timeline.length) return null;

    const joinedEvent = timeline.find((e) => e.type === "Joined");
    let tenure = "New Joinee";

    if (joinedEvent) {
      const start = new Date(joinedEvent.date);
      const now = new Date();
      const years = differenceInYears(now, start);
      const months = differenceInMonths(now, start) % 12;
      tenure = `${years}y ${months}m`;
    }

    const awards = timeline.filter((e) => e.type === "Award").length;
    const projects = timeline.filter((e) => e.type === "Project").length;

    return { tenure, awards, projects };
  }, [timeline]);

  if (loading) {
    return <JourneyTimelineSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-status-error bg-red-50 rounded-xl dark:bg-red-900/20 border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      {/* Stats Header */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8 px-2">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 text-center border border-blue-100 dark:border-blue-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock size={40} className="text-blue-600" />
            </div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Tenure
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {stats.tenure}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 text-center border border-orange-100 dark:border-orange-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy size={40} className="text-orange-600" />
            </div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Awards
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {stats.awards}
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl p-4 text-center border border-cyan-100 dark:border-cyan-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase size={40} className="text-cyan-600" />
            </div>
            <p className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Projects
            </p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
              {stats.projects}
            </p>
          </div>
        </div>
      )}

      {/* Main Timeline */}
      <div className="relative">
        {/* Center Line for Desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 -translate-x-1/2 rounded-full"></div>

        {/* Mobile Line */}
        <div className="md:hidden absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-800 rounded-full"></div>

        <div className="space-y-6">
          {timeline.map((event, index) => {
            const styles = getStyles(event.type);
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={cn(
                  "relative flex items-center md:justify-between group",
                  // Mobile: Always left aligned
                  "flex-row justify-start"
                )}
              >
                {/* Desktop: Alternating Spacer (Left) */}
                <div
                  className={cn(
                    "hidden md:block w-5/12",
                    isEven ? "order-1" : "order-3"
                  )}
                ></div>

                {/* Center Dot */}
                <div
                  className={cn(
                    "absolute md:static z-10",
                    // Mobile: Center on left-8 line (left: 2rem)
                    // width is w-16 (4rem), so translate-x-1/2 centers it at 2rem
                    "left-8 -translate-x-1/2",
                    // Desktop: occupy distinct 2/12 column
                    "md:translate-x-0 md:w-2/12 md:flex md:justify-center md:order-2"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-md ring-2 ring-bg-main transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12",
                      styles.gradient,
                      styles.shadow
                    )}
                  >
                    {/* Compact Icon */}
                    {getIcon(event.icon)}
                  </div>
                </div>

                {/* Content Card */}
                <div
                  className={cn(
                    "w-full ml-16 md:ml-0 md:w-5/12 z-0",
                    // Desktop: Push to side
                    isEven
                      ? "md:order-3 md:text-left"
                      : "md:order-1 md:text-right"
                  )}
                >
                  <div
                    className={cn(
                      "relative p-4 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                      styles.bgTint,
                      styles.border
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-col gap-0.5 mb-1",
                        isEven ? "md:items-start" : "md:items-end"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/50 dark:bg-black/20 w-fit",
                          styles.text
                        )}
                      >
                        {event.type}
                      </span>
                      <span className="text-xs font-medium text-text-muted">
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </span>
                    </div>

                    <h3
                      className={cn("text-lg font-bold text-text-primary mb-1")}
                    >
                      {event.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-snug">
                      {event.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* End Cap */}
        <div className="flex justify-center mt-8">
          <div className="bg-bg-card text-text-muted px-4 py-2 rounded-full border border-border text-xs uppercase tracking-widest shadow-sm z-10 relative">
            Journey Started
          </div>
        </div>
      </div>
    </div>
  );
};

export const JourneyTimelineSkeleton = () => {
  return (
    <div className="py-8 px-4 max-w-5xl mx-auto animate-pulse">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-3 gap-4 mb-8 px-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-gray-200 dark:bg-gray-700 rounded-xl h-24 w-full"
          ></div>
        ))}
      </div>

      {/* Timeline Skeleton */}
      <div className="relative">
        {/* Center Line */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 -translate-x-1/2 rounded-full"></div>
        <div className="md:hidden absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={i}
                className="relative flex items-center md:justify-between flex-row justify-start"
              >
                {/* Spacer */}
                <div
                  className={cn(
                    "hidden md:block w-5/12",
                    isEven ? "order-1" : "order-3"
                  )}
                ></div>

                {/* Dot Skeleton */}
                <div
                  className={cn(
                    "absolute md:static z-10 left-8 -translate-x-1/2 md:translate-x-0 md:w-2/12 md:flex md:justify-center md:order-2"
                  )}
                >
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full ring-4 ring-bg-main"></div>
                </div>

                {/* Card Skeleton */}
                <div
                  className={cn(
                    "w-full ml-16 md:ml-0 md:w-5/12 z-0",
                    isEven
                      ? "md:order-3 md:text-left"
                      : "md:order-1 md:text-right"
                  )}
                >
                  <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-bg-card shadow-sm">
                    <div
                      className={cn(
                        "flex flex-col gap-2 mb-2",
                        isEven ? "md:items-start" : "md:items-end"
                      )}
                    >
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
