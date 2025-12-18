import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { useAuth } from "../../../context/AuthContext";
import { format, addDays } from "date-fns";

export default function ResignationSubmission() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resignation, setResignation] = useState<any>(null);

  const [formData, setFormData] = useState({
    lastWorkingDay: "",
    reason: "",
    agreedToTerms: false,
  });

  const [noticePeriodDays, setNoticePeriodDays] = useState(30); // Default, can be fetched later

  useEffect(() => {
    fetchResignationStatus();
    // Pre-fill date based on notice period
    const minDate = addDays(new Date(), noticePeriodDays);
    setFormData((prev) => ({
      ...prev,
      lastWorkingDay: format(minDate, "yyyy-MM-dd"),
    }));
  }, []);

  const fetchResignationStatus = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyResignation();
      setResignation(data);
    } catch (error) {
      console.error("Failed to fetch resignation status", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreedToTerms) return;

    try {
      setSubmitting(true);
      const data = await apiService.submitResignation({
        lastWorkingDay: formData.lastWorkingDay,
        reason: formData.reason,
      });
      setResignation(data.resignation);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-amber-600 bg-amber-50 border-amber-200";
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  // View: Active Resignation
  if (resignation) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-brand-primary" />
              Resignation Status
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(
                resignation.status
              )}`}
            >
              {resignation.status}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  Submitted On
                </p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <CalendarDays size={16} className="text-gray-400" />
                  {format(new Date(resignation.submittedDate), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  Proposed Last Working Day
                </p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase size={16} className="text-gray-400" />
                  {format(new Date(resignation.lastWorkingDay), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">Reason</p>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 text-sm italic border border-gray-100">
                "{resignation.reason}"
              </div>
            </div>

            {/* Manager Comments */}
            {resignation.comments && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">
                  Admin/Manager Comments
                </p>
                <div className="p-4 bg-blue-50/50 rounded-lg text-gray-700 text-sm border border-blue-100">
                  {resignation.comments}
                </div>
              </div>
            )}

            {/* Timeline / Progress could go here */}
            {resignation.status === "pending" && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 text-amber-800 text-sm">
                <Clock size={20} />
                <p>
                  Your resignation is currently under review by your reporting
                  manager and HR.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Submission Form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">
            Submit Resignation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Please fill in the details below to initiate the exit process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 flex gap-3 items-start">
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold mb-1">Important Notice</p>
              <p>
                According to company policy, the standard notice period is{" "}
                <strong>{noticePeriodDays} days</strong>. Your estimated last
                working day is calculated based on this.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Working Day (Proposed)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  min={format(new Date(), "yyyy-MM-dd")}
                  value={formData.lastWorkingDay}
                  onChange={(e) =>
                    setFormData({ ...formData, lastWorkingDay: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
                />
                <CalendarDays
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You can request an earlier date, but it is subject to approval
                and possible buyout.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leaving
              </label>
              <textarea
                required
                rows={4}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Please share your reason for resignation..."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
              />
            </div>

            <div
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() =>
                setFormData({
                  ...formData,
                  agreedToTerms: !formData.agreedToTerms,
                })
              }
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  formData.agreedToTerms
                    ? "bg-brand-primary border-brand-primary text-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {formData.agreedToTerms && <CheckCircle2 size={14} />}
              </div>
              <input type="checkbox" className="hidden" />
              <p className="text-sm text-gray-600 select-none">
                I understand that submitting this form initiates the formal exit
                process. I agree to complete the handover obligations during my
                notice period.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !formData.agreedToTerms}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-95"
            >
              {submitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send size={18} />
                  Submit Resignation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
