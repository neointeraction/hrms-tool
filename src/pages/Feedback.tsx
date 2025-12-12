import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  MessageSquarePlus,
  MessageSquareQuote,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { Button } from "../components/common/Button";
import { Select } from "../components/common/Select";
import { useAuth } from "../context/AuthContext";

interface EmployeeOption {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  firstName: string;
  lastName: string;
}

interface FeedbackItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  message: string;
  createdAt: string;
}

export default function Feedback() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Data State
  const [colleagues, setColleagues] = useState<EmployeeOption[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedUser, setSelectedUser] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesData, feedbacksData] = await Promise.all([
        apiService.getEmployees(),
        apiService.getMyFeedbacks(),
      ]);

      // Filter out self and ensure user exists
      const validColleagues = employeesData.filter(
        (emp: any) => emp.user && emp.user._id !== currentUser?.id
      );
      setColleagues(validColleagues);
      setFeedbacks(feedbacksData);
    } catch (err) {
      console.error("Failed to fetch feedback data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      await apiService.createFeedback({
        recipientId: selectedUser,
        message: message.trim(),
      });
      setShowSuccessModal(true);
      setMessage("");
      setSelectedUser("");
      // Refresh feedbacks (although sent feedback won't appear in "Received" list typically, unless we show sent ones too?
      // The API says getMyFeedbacks, usually implies received.
      // User won't see their sent feedback in their "Inbox", but that's standard.)
    } catch (err: any) {
      setError(err.message || "Failed to send feedback");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-0">
          <Button
            variant="ghost"
            onClick={() => navigate("/miscellaneous")}
            leftIcon={<ChevronLeft size={20} />}
            style={{ paddingRight: "0", paddingLeft: "0" }}
          />
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Feedback</h1>
            <p className="text-text-secondary">
              Send constructive feedback or appreciation
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Feedback Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
              <MessageSquarePlus className="text-brand-primary" size={20} />
              Send Feedback
            </h2>

            {error && (
              <div className="bg-status-error/10 text-status-error p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Select
                  label="Recipient"
                  value={selectedUser}
                  onChange={(val) => setSelectedUser(val as string)}
                  options={colleagues.map((emp) => ({
                    value: emp.user._id,
                    label: `${emp.firstName} ${emp.lastName}`,
                  }))}
                  placeholder="Select a colleague..."
                  required={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your feedback here..."
                  className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 resize-none h-32"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={sending || !selectedUser || !message.trim()}
                isLoading={sending}
                leftIcon={<Send size={16} />}
              >
                Send Feedback
              </Button>
            </form>
          </div>
        </div>

        {/* Recent Feedback Feed */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            My Feedback History
          </h2>

          <div className="space-y-4">
            {feedbacks.map((item) => (
              <div
                key={item._id}
                className="bg-bg-card border border-border rounded-xl p-4 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex-shrink-0 bg-brand-primary/5 rounded-full p-2 border border-brand-primary/10">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <MessageSquareQuote className="w-5 h-5 text-brand-primary" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="text-text-primary font-medium text-sm">
                        <span className="text-text-secondary">
                          Feedback from{" "}
                        </span>
                        <span className="font-bold text-brand-primary">
                          {item.sender.name}
                        </span>
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Received on{" "}
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 bg-bg-main p-3 rounded-lg text-sm text-text-secondary italic border border-border/50 break-words">
                    "{item.message}"
                  </div>
                </div>
              </div>
            ))}

            {feedbacks.length === 0 && !loading && (
              <div className="text-center py-12 text-text-secondary bg-bg-main rounded-xl border border-border border-dashed">
                <MessageSquareQuote
                  size={32}
                  className="mx-auto mb-2 opacity-50"
                />
                <p>No feedback received yet.</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12 text-text-secondary">
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="Feedback Sent"
        message="Your feedback has been sent successfully!"
        confirmText="OK"
        variant="success"
        showCancel={false}
      />
    </div>
  );
}
