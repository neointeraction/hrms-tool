import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  PartyPopper,
  Cake,
  Award,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { apiService } from "../../../services/api.service";
import { useAppStore } from "../../../store/useAppStore";
import { Skeleton } from "../../../components/common/Skeleton";

export default function UpcomingHolidayWidget() {
  const [view, setView] = useState<"holiday" | "celebrations">("holiday");
  const { widgetAnimationPlayed, setWidgetAnimationPlayed } = useAppStore();

  // Holiday State
  const [upcomingHoliday, setUpcomingHoliday] = useState<any>(null);

  // Celebrations State
  const [activeTab, setActiveTab] = useState<"birthdays" | "anniversaries">(
    "birthdays"
  );
  const [eventsData, setEventsData] = useState<{
    birthdays: any[];
    anniversaries: any[];
  }>({
    birthdays: [],
    anniversaries: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use allSettled to prevent one failure from blocking the other
        const [holidaysResult, eventsResult] = await Promise.allSettled([
          apiService.getHolidays(new Date().getFullYear()),
          apiService.getUpcomingEvents(),
        ]);

        // Process Holidays
        if (holidaysResult.status === "fulfilled") {
          const holidays = holidaysResult.value;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextHoliday = holidays
            .filter((h: any) => new Date(h.date) >= today)
            .sort(
              (a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )[0];
          setUpcomingHoliday(nextHoliday);
        } else {
          console.error("Failed to fetch holidays:", holidaysResult.reason);
        }

        // Process Events
        if (eventsResult.status === "fulfilled") {
          const events = eventsResult.value;
          const currentMonth = new Date().getMonth();
          const filteredEvents = {
            birthdays: (events.birthdays || []).filter(
              (e: any) => new Date(e.date).getMonth() === currentMonth
            ),
            anniversaries: (events.anniversaries || []).filter(
              (e: any) => new Date(e.date).getMonth() === currentMonth
            ),
          };
          setEventsData(filteredEvents);
        } else {
          console.error(
            "Failed to fetch upcoming events:",
            eventsResult.reason
          );
        }
      } catch (error) {
        console.error("Critical error in widget data fetching:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto Toggle Animation (Once per session)
    if (!widgetAnimationPlayed) {
      // Switch to celebrations after 5s
      const timer1 = setTimeout(() => {
        setView("celebrations");
      }, 5000);

      // Switch back to holiday after 10s and mark animated
      const timer2 = setTimeout(() => {
        setView("holiday");
        setWidgetAnimationPlayed();
      }, 10000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, []);

  const currentEvents =
    activeTab === "birthdays" ? eventsData.birthdays : eventsData.anniversaries;

  const daysUntil = upcomingHoliday
    ? Math.ceil(
        (new Date(upcomingHoliday.date).getTime() -
          new Date().setHours(0, 0, 0, 0)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  // Render Holiday View
  if (view === "holiday") {
    return (
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-6 rounded-xl shadow-xl text-white relative overflow-hidden h-full transition-all duration-300 group">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          ></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-3 right-3 opacity-20 animate-pulse">
          <Sparkles size={32} className="text-yellow-300" />
        </div>
        <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Calendar size={140} />
        </div>

        <div className="relative z-10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1 ">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="text-white" size={20} />
              </div>
              <h2 className="text-lg font-bold">Upcoming Holiday</h2>
            </div>
            {/* Toggle Button */}
            <button
              onClick={() => setView("celebrations")}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110 text-white/80 hover:text-white shadow-lg backdrop-blur-sm"
              title="View Celebrations"
            >
              <PartyPopper size={18} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center mt-8 space-y-4">
              {/* Label Mock */}
              <Skeleton className="h-3 w-24 bg-white/20 rounded-full" />
              {/* Title Mock */}
              <Skeleton className="h-10 w-48 bg-white/20 rounded-lg" />
              {/* Date Mock */}
              <Skeleton className="h-12 w-40 bg-white/20 rounded-xl mt-2" />
              {/* Countdown Mock */}
              <Skeleton className="h-6 w-32 bg-white/20 rounded-lg" />
            </div>
          ) : upcomingHoliday ? (
            <div
              className="text-center space-y-2 mt-8"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {/* Holiday Name */}
              <div className="space-y-0.5">
                <p className="text-white/80 font-semibold uppercase tracking-widest text-[10px] flex items-center justify-center gap-1.5">
                  <Sparkles size={10} />
                  Next Holiday
                  <Sparkles size={10} />
                </p>
                <h3
                  className="text-4xl font-black drop-shadow-lg line-clamp-2 m-4"
                  style={{ marginTop: 8, marginBottom: 8 }}
                  title={upcomingHoliday.name}
                >
                  {upcomingHoliday.name}
                </h3>
              </div>

              {/* Date */}
              <div
                className="mb-5 inline-block px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md shadow-lg border border-white/30"
                style={{ marginBottom: "2rem" }}
              >
                <p className="text-white font-bold text-sm">
                  {format(new Date(upcomingHoliday.date), "MMMM do, yyyy")}
                </p>
              </div>

              {/* Countdown */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md  ">
                <Clock size={14} className="text-white" />
                <p className="text-sm font-bold text-white">
                  {daysUntil} {daysUntil === 1 ? "day" : "days"} to go
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-sm mb-3">
                <Calendar size={36} className="text-white/50" />
              </div>
              <p className="text-white/80 font-medium text-sm">
                No upcoming holidays
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Celebrations View (White Card Style)
  return (
    <div className="bg-bg-card rounded-xl shadow-lg border border-border h-full flex flex-col transition-all duration-300 overflow-hidden relative group">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-bg-secondary/50 to-bg-card">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center border border-pink-100 dark:border-transparent shadow-sm">
            <Cake className="text-pink-500 dark:text-pink-400" size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary leading-tight">
              Celebrations
            </h2>
            <p className="text-[10px] text-text-secondary font-medium">
              This Month
            </p>
          </div>
        </div>
        {/* Toggle Button */}
        <button
          onClick={() => setView("holiday")}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card hover:bg-bg-main rounded-lg transition-all text-text-secondary hover:text-brand-primary border border-border shadow-sm hover:shadow"
          title="View Holidays"
        >
          <Calendar size={14} />
          <span className="text-xs font-semibold">Holidays</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="p-1 mx-4 mt-4 bg-bg-main rounded-lg flex p-1 border border-border">
        <button
          onClick={() => setActiveTab("birthdays")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            activeTab === "birthdays"
              ? "bg-bg-card text-pink-600 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50 shadow-none"
          }`}
        >
          <Cake
            size={14}
            className={
              activeTab === "birthdays" ? "text-pink-500" : "text-text-muted"
            }
          />
          Birthdays ({eventsData.birthdays.length})
        </button>
        <button
          onClick={() => setActiveTab("anniversaries")}
          className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            activeTab === "anniversaries"
              ? "bg-bg-card text-amber-600 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50 shadow-none"
          }`}
        >
          <Award
            size={14}
            className={
              activeTab === "anniversaries"
                ? "text-amber-500"
                : "text-text-muted"
            }
          />
          Work ({eventsData.anniversaries.length})
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 bg-bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-3.5" />
                    <Skeleton className="w-16 h-2.5" />
                  </div>
                </div>
                <Skeleton className="w-12 h-6 rounded-lg" />
              </div>
            ))}
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-4">
            <div
              className={`p-4 rounded-full mb-3 ${
                activeTab === "birthdays"
                  ? "bg-pink-50/50 dark:bg-pink-900/10"
                  : "bg-amber-50/50 dark:bg-amber-900/10"
              }`}
            >
              {activeTab === "birthdays" ? (
                <Cake size={28} className="text-pink-300/70" />
              ) : (
                <Award size={28} className="text-amber-300/70" />
              )}
            </div>
            <p className="text-text-secondary text-xs font-medium">
              No upcoming {activeTab}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentEvents.map((item: any) => (
              <div
                key={item.id}
                className="group flex items-center justify-between p-2.5 bg-bg-card hover:bg-bg-subtle rounded-xl border border-border hover:border-text-muted/20 transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {item.profilePicture ? (
                      <img
                        src={`http://localhost:5001/${item.profilePicture}`}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-bg-card shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${
                          activeTab === "birthdays"
                            ? "bg-gradient-to-br from-pink-400 to-rose-500"
                            : "bg-gradient-to-br from-amber-400 to-orange-500"
                        }`}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-bg-card rounded-full p-0.5 shadow-sm border border-border">
                      {activeTab === "birthdays" ? (
                        <Cake size={10} className="text-pink-500" />
                      ) : (
                        <Award size={10} className="text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-text-primary leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-text-secondary font-medium">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      • {item.designation}
                    </p>
                  </div>
                </div>

                <button
                  className={`opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm ${
                    activeTab === "birthdays"
                      ? "bg-pink-50 text-pink-600 hover:bg-pink-100"
                      : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                  }`}
                >
                  Wish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
