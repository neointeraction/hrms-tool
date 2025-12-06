import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Coffee,
  Sun,
  Briefcase,
  Plus,
  Award,
  Download,
  MessageSquare,
  Gift,
} from "lucide-react";
import { cn } from "../../../utils/cn";
import { useAuth } from "../../../context/AuthContext";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isCheckedIn) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          Good Morning, {user?.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-text-secondary mt-1">
          Here's your dashboard for today, Tuesday, June 07
        </p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Leave Balance */}
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-status-warning/10 rounded-lg">
              <Coffee className="text-status-warning" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Leave Balance
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div>
                <p className="text-sm text-text-secondary">Casual Leave</p>
                <p className="text-2xl font-bold text-text-primary">4.0</p>
              </div>
              <Sun className="text-status-warning" size={24} />
            </div>
            <div className="flex items-center justify-between p-3 bg-bg-main rounded-lg">
              <div>
                <p className="text-sm text-text-secondary">Sick Leave</p>
                <p className="text-2xl font-bold text-text-primary">2.0</p>
              </div>
              <Coffee className="text-status-error" size={24} />
            </div>
          </div>
        </div>

        {/* Holiday */}
        <div className="bg-gradient-to-br from-brand-primary to-brand-secondary p-6 rounded-lg shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <Calendar size={200} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="text-white" size={24} />
              </div>
              <h2 className="text-lg font-semibold">Upcoming Holiday</h2>
            </div>
            <div className="text-center mt-4">
              <p className="text-white/80 font-medium mb-2 uppercase tracking-wider text-xs">
                Next Holiday
              </p>
              <h3 className="text-4xl font-bold mb-2">Bakrid</h3>
              <p className="text-white/90 font-medium text-lg">June 29, 2025</p>
              <div className="mt-6 inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                <Clock size={16} className="mr-2" />
                <span>26 days to go</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Work Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="text-brand-secondary" size={20} />
              <h2 className="text-lg font-semibold text-text-primary">
                Work Summary
              </h2>
            </div>
            <span className="text-sm text-text-muted">This Month</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-bg-main rounded-lg text-center">
              <p className="text-3xl font-bold text-brand-primary">142</p>
              <p className="text-xs text-text-secondary mt-1">Total Hours</p>
            </div>
            <div className="p-4 bg-bg-main rounded-lg text-center">
              <p className="text-3xl font-bold text-status-success">98%</p>
              <p className="text-xs text-text-secondary mt-1">On-Time</p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">
              Quick Add Task
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What are you working on?"
                className="flex-1 px-4 py-2 bg-bg-main border border-border rounded-lg text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
              />
              <button className="p-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Growth Section */}
        <div className="bg-bg-card p-6 rounded-lg shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <Award className="text-status-warning" size={20} />
            <h2 className="text-lg font-semibold text-text-primary">
              Growth & Goals
            </h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-primary">
                  React Advanced Pattern
                </span>
                <span className="text-text-secondary">75%</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary w-3/4 rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-primary">Q2 Goals Completed</span>
                <span className="text-text-secondary">2/4</span>
              </div>
              <div className="h-2 bg-bg-main rounded-full overflow-hidden">
                <div className="h-full bg-status-success w-1/2 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-bg-main rounded-lg mt-4">
              <div className="p-2 bg-status-warning/20 rounded-full text-status-warning">
                <Award size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Star Performer
                </p>
                <p className="text-xs text-text-secondary">
                  Badge earned in May
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card p-4 rounded-lg shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:bg-bg-hover transition-colors">
          <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
            <Download size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Download Payslip</p>
            <p className="text-xs text-text-secondary">May 2025</p>
          </div>
        </div>
        <div className="bg-bg-card p-4 rounded-lg shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:bg-bg-hover transition-colors">
          <div className="p-3 bg-status-info/10 rounded-lg text-status-info">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">HR Chatbot</p>
            <p className="text-xs text-text-secondary">Ask a question</p>
          </div>
        </div>
        <div className="bg-bg-card p-4 rounded-lg shadow-sm border border-border flex items-center gap-4">
          <div className="p-3 bg-status-error/10 rounded-lg text-status-error">
            <Gift size={24} />
          </div>
          <div>
            <p className="font-medium text-text-primary">Birthday Reminder</p>
            <p className="text-xs text-text-secondary">
              Sarah's b'day tomorrow!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
