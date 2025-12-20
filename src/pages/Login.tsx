import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, AlertCircle, Building } from "lucide-react";
import {
  getFirstAccessibleRoute,
  getAccessibleMenuItems,
} from "../utils/navigation";
import { Loader } from "../components/common/Loader";
import { PasswordInput } from "../components/common/PasswordInput";
import { Input } from "../components/common/Input";

export default function Login() {
  const [email, setEmail] = useState(""); // Default for demo
  const [password, setPassword] = useState("");
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
    <div className="flex min-h-screen bg-bg-main overflow-hidden">
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-brand-primary text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
              <Building size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              NeointeractionHR
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Welcome back to your workspace.
          </h1>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Securely access your dashboard, manage your team, and stay on top of
            your HR tasks.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-brand-primary bg-gray-200"
                />
              ))}
            </div>
            <div className="text-sm">
              <p className="font-semibold">Join thousands of users</p>
              <p className="text-blue-200">Streamlining HR globally</p>
            </div>
          </div>
          <p className="text-xs text-blue-200 opacity-60">
            © {new Date().getFullYear()} NeointeractionHR. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto bg-bg-main justify-center">
        <div className="max-w-md mx-auto w-full p-6 md:p-12">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Building size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-brand-primary">
              NeointeractionHR
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Log in
            </h2>
            <p className="text-text-secondary">
              Welcome back! Please enter your details.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
          >
            {error && (
              <div className="p-4 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <Input
              label="Email"
              leftIcon={<Mail size={18} />}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="bg-bg-card border-border"
            />

            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="text-sm font-medium text-text-secondary">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary"
                  size={18}
                />
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-bg-card border-border"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 h-[38px] bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-brand-primary/30 disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader size={20} variant="white" /> : "Sign In"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-brand-primary hover:text-brand-primary/80 font-semibold hover:underline decoration-2 underline-offset-2 transition-all"
            >
              Sign up
            </a>
          </p>

          {/* Quick Login - Demo Purpose */}
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs font-semibold text-text-muted text-center mb-4 uppercase tracking-wider">
              Quick Login (Demo)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@neointeraction.com");
                  setPassword("Welcome@123");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  Admin
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  admin@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("hr@neointeraction.com");
                  setPassword("Welcome@123");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  HR
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  hr@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("shameer@neointeraction.com");
                  setPassword("password");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  Manager
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  shameer@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("liya@neointeraction.com");
                  setPassword("password");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  Employee
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  liya@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("sam@neointeraction.com");
                  setPassword("password");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  CEO
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  sam@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("accounts@neointeraction.com");
                  setPassword("password");
                }}
                className="p-3 bg-bg-card border border-border rounded-lg hover:border-brand-primary/50 hover:bg-brand-primary/5 text-left transition-all group"
              >
                <div className="text-xs font-bold text-text-primary group-hover:text-brand-primary mb-0.5">
                  Accounts
                </div>
                <div className="text-[10px] text-text-muted truncate">
                  accounts@neointeraction.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("superadmin@hrms.com");
                  setPassword("SuperAdmin@123");
                }}
                className="col-span-2 p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/20 text-left transition-all group"
              >
                <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-0.5">
                  Super Admin
                </div>
                <div className="text-[10px] text-purple-600/70 dark:text-purple-400/70 truncate">
                  superadmin@hrms.com
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
