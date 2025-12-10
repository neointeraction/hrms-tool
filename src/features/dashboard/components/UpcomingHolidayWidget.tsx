import { useState, useEffect } from "react";
import { Calendar, Clock, PartyPopper, Cake, Award } from "lucide-react";
import { format } from "date-fns";
import { apiService } from "../../../services/api.service";
import { useAppStore } from "../../../store/useAppStore";

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
        const [holidays, events] = await Promise.all([
          apiService.getHolidays(new Date().getFullYear()),
          apiService.getUpcomingEvents(),
        ]);

        // Process Holiday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextHoliday = holidays
          .filter((h: any) => new Date(h.date) >= today)
          .sort(
            (a: any, b: any) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          )[0];
        setUpcomingHoliday(nextHoliday);

        // Process Events
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
      } catch (error) {
        console.error("Failed to fetch widget data", error);
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

  // Render Holiday View
  if (view === "holiday") {
    return (
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 rounded-lg shadow-lg text-white relative overflow-hidden h-full min-h-[200px] transition-all duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
          <Calendar size={200} />
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="text-white" size={24} />
              </div>
              <h2 className="text-lg font-semibold">Upcoming Holiday</h2>
            </div>
            {/* Toggle Button */}
            <button
              onClick={() => setView("celebrations")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              title="View Celebrations"
            >
              <PartyPopper size={20} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 opacity-80">Loading...</div>
          ) : upcomingHoliday ? (
            <div className="text-center mt-2">
              <p className="text-white/80 font-medium mb-2 uppercase tracking-wider text-xs">
                Next Holiday
              </p>
              <h3
                className="text-3xl font-bold mb-2 truncate"
                title={upcomingHoliday.name}
              >
                {upcomingHoliday.name}
              </h3>
              <p className="text-white/90 font-medium text-lg">
                {format(new Date(upcomingHoliday.date), "MMMM do, yyyy")}
              </p>
              <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                <Clock size={16} className="mr-2" />
                <span>
                  {Math.ceil(
                    (new Date(upcomingHoliday.date).getTime() -
                      new Date().setHours(0, 0, 0, 0)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days to go
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="opacity-80">No upcoming holidays found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Celebrations View (White Card Style)
  return (
    <div className="bg-bg-card rounded-lg shadow-sm border border-border h-full flex flex-col min-h-[200px] max-h-[280px] transition-all duration-300">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 rounded-lg">
            <PartyPopper className="text-pink-500" size={24} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Celebrations
          </h2>
        </div>
        {/* Toggle Button */}
        <button
          onClick={() => setView("holiday")}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-500 hover:text-brand-primary"
          title="View Holidays"
        >
          <Calendar size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("birthdays")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "birthdays"
              ? "text-pink-600 border-b-2 border-pink-500 bg-pink-50/50"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <Cake
            size={16}
            className={
              activeTab === "birthdays" ? "text-pink-500" : "text-gray-400"
            }
          />
          Birthdays ({eventsData.birthdays.length})
        </button>
        <button
          onClick={() => setActiveTab("anniversaries")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "anniversaries"
              ? "text-amber-600 border-b-2 border-amber-500 bg-amber-50/50"
              : "text-text-secondary hover:bg-gray-50"
          }`}
        >
          <Award
            size={16}
            className={
              activeTab === "anniversaries" ? "text-amber-500" : "text-gray-400"
            }
          />
          Anniversaries ({eventsData.anniversaries.length})
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="text-center py-8 text-sm text-text-secondary">
            Loading...
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div
              className={`p-4 rounded-full mb-3 ${
                activeTab === "birthdays" ? "bg-pink-50" : "bg-amber-50"
              }`}
            >
              {activeTab === "birthdays" ? (
                <Cake size={32} className="text-pink-300" />
              ) : (
                <Award size={32} className="text-amber-300" />
              )}
            </div>
            <p className="text-text-secondary text-sm">
              No upcoming {activeTab} this month
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentEvents.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between group p-2 hover:bg-bg-main rounded-lg transition-colors border border-transparent hover:border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {item.profilePicture ? (
                      <img
                        src={`http://localhost:5001/${item.profilePicture}`}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                          activeTab === "birthdays"
                            ? "bg-gradient-to-br from-pink-400 to-rose-500"
                            : "bg-gradient-to-br from-amber-400 to-orange-500"
                        }`}
                      >
                        {item.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                      {activeTab === "birthdays" ? (
                        <Cake size={10} className="text-pink-500" />
                      ) : (
                        <Award size={10} className="text-amber-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">
                      {item.name}
                    </h4>
                    <p className="text-xs text-text-secondary">
                      {item.designation}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      activeTab === "birthdays"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {new Date(item.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                  {activeTab === "anniversaries" && (
                    <p className="text-[10px] text-text-secondary mt-1">
                      {item.years} Year{item.years > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
