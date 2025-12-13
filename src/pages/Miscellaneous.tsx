import { useNavigate } from "react-router-dom";
import { MessageSquarePlus, Award, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Miscellaneous() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Miscellaneous</h1>
        <p className="text-text-secondary">Additional tools and features.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          onClick={() => navigate("/miscellaneous/feedback")}
          className="bg-bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
              <MessageSquarePlus className="text-brand-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Feedback
            </h3>
          </div>
          <p className="text-text-secondary text-sm">
            Send constructive feedback or appreciation to your colleagues.
          </p>
        </div>

        <div
          onClick={() => navigate("/miscellaneous/appreciation")}
          className="bg-bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
              <Award className="text-brand-primary" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Appreciation Center
            </h3>
          </div>
          <p className="text-text-secondary text-sm">
            Recognize and celebrate your colleagues with virtual badges.
          </p>
        </div>

        {/* Email Automation - HR Only (RoleGuard handles access) */}
        {(user?.role === "HR" ||
          user?.role === "Admin" ||
          user?.isSuperAdmin) && (
          <div
            onClick={() => navigate("/miscellaneous/email-automation")}
            className="bg-bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                <Mail className="text-brand-primary" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">
                Email Automation
              </h3>
            </div>
            <p className="text-text-secondary text-sm">
              Configure automated Birthday and Anniversary emails.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
