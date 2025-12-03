import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-status-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert size={40} className="text-status-error" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          Access Denied
        </h1>

        <p className="text-text-secondary mb-8">
          You do not have permission to view this page. Please contact your
          administrator if you believe this is an error.
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-border rounded-lg text-text-primary hover:bg-bg-hover transition-colors font-medium"
          >
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors font-medium shadow-lg shadow-brand-primary/20"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
