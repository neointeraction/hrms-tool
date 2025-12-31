import { useState, useEffect } from "react";
import { apiService } from "../../../services/api.service";
import { Cake, Award, PartyPopper } from "lucide-react";
import { formatDate } from "../../../utils/dateUtils";

export default function UpcomingEventsWidget() {
  const [activeTab, setActiveTab] = useState<"birthdays" | "anniversaries">(
    "birthdays"
  );
  const [data, setData] = useState<{ birthdays: any[]; anniversaries: any[] }>({
    birthdays: [],
    anniversaries: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const result = await apiService.getUpcomingEvents();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch upcoming events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const currentItems =
    activeTab === "birthdays" ? data.birthdays : data.anniversaries;

  if (loading) {
    return (
      <div className="bg-bg-card h-80 rounded-lg shadow-sm border border-border animate-pulse p-4">
        <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
          <div className="h-12 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-lg shadow-sm border border-border h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
            <PartyPopper
              className="text-pink-500 dark:text-pink-400"
              size={24}
            />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Celebrations
          </h2>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("birthdays")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "birthdays"
              ? "text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 bg-pink-50/50 dark:bg-pink-900/10"
              : "text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <Cake
            size={16}
            className={
              activeTab === "birthdays" ? "text-pink-500" : "text-gray-400"
            }
          />
          Birthdays ({data.birthdays.length})
        </button>
        <button
          onClick={() => setActiveTab("anniversaries")}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === "anniversaries"
              ? "text-amber-600 dark:text-amber-400 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
              : "text-text-secondary hover:bg-bg-hover"
          }`}
        >
          <Award
            size={16}
            className={
              activeTab === "anniversaries" ? "text-amber-500" : "text-gray-400"
            }
          />
          Anniversaries ({data.anniversaries.length})
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        {currentItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div
              className={`p-4 rounded-full mb-3 ${
                activeTab === "birthdays"
                  ? "bg-pink-50 dark:bg-pink-900/10"
                  : "bg-amber-50 dark:bg-amber-900/10"
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
            {currentItems.map((item: any) => (
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
                        className="w-10 h-10 rounded-full object-cover border-2 border-bg-card shadow-sm"
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
                    <div className="absolute -bottom-1 -right-1 bg-bg-card rounded-full p-0.5 shadow-sm">
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
                        ? "bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300"
                        : "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {formatDate(item.date)}
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
