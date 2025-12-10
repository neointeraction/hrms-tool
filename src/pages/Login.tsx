import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, AlertCircle } from "lucide-react";
import {
  getFirstAccessibleRoute,
  getAccessibleMenuItems,
} from "../utils/navigation";
import { Loader } from "../components/common/Loader";

export default function Login() {
  const [email, setEmail] = useState("shameer@neointeraction.com"); // Default for demo
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // Get location if possible (optional)
      let coords: { lat: number; lng: number } | undefined;

      try {
        if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              });
            }
          );
          coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        }
      } catch (err) {
        console.log("Location access denied or failed", err);
        // Continue login without location
      }

      const user = await login(email, password, coords);

      // Get accessible routes for the user's role
      const accessibleRoutes = getAccessibleMenuItems(user.role);
      const firstRoute = getFirstAccessibleRoute(user.role);
      const from = location.state?.from?.pathname;

      // Only use 'from' if it's accessible to the user's role, otherwise use first accessible route
      const isFromAccessible =
        from && accessibleRoutes.some((route) => route.to === from);
      navigate(isFromAccessible ? from : firstRoute, { replace: true });
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-4">
      <div className="bg-bg-card rounded-xl shadow-lg w-full max-w-md overflow-hidden border border-border">
        <div className="bg-brand-primary p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">HRMS Portal</h1>
          <p className="text-brand-primary/20 text-white/80">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-status-error/10 text-status-error p-3 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-bg-card text-text-primary"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all bg-bg-card text-text-primary"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary text-white py-3 rounded-lg font-medium hover:bg-brand-secondary transition-colors shadow-lg shadow-brand-primary/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? <Loader size={20} variant="white" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-text-muted text-center mb-4">
              Demo Credentials (Click to copy)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setEmail("superadmin@hrms.com");
                  setPassword("SuperAdmin@123");
                }}
                className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 text-left truncate font-medium border border-purple-200 dark:border-purple-800"
              >
                Super Admin
              </button>
              <button
                onClick={() => setEmail("admin@neointeraction.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                admin (Admin)
              </button>
              <button
                onClick={() => setEmail("hr@neointeraction.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                hr (HR)
              </button>
              <button
                onClick={() => setEmail("shameer@neointeraction.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                shameer (Project Manager)
              </button>
              <button
                onClick={() => setEmail("liya@neointeraction.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                liya (Employee)
              </button>
              {/* <button
                onClick={() => setEmail("employee@company.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                employee@company.com
              </button> */}
              {/* <button
                onClick={() => setEmail("acc@company.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                acc@company.com
              </button> */}
              {/* <button
                onClick={() => setEmail("intern@company.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                intern@company.com
              </button> */}
              {/* <button
                onClick={() => setEmail("contract@company.com")}
                className="p-2 bg-bg-main rounded hover:bg-bg-hover text-left truncate"
              >
                contract@company.com
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
