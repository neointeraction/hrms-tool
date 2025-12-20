import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { Loader } from "../components/common/Loader";
import { PasswordInput } from "../components/common/PasswordInput";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await apiService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
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
            Create new password
          </h1>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-blue-200 opacity-60">
            © {new Date().getFullYear()} NeointeractionHR. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Area */}
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

          <Link
            to="/login"
            className="inline-flex items-center text-sm text-text-secondary hover:text-brand-primary mb-8 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              Set new password
            </h2>
            <p className="text-text-secondary">
              Please enter your new password below.
            </p>
          </div>

          {success ? (
            <div className="bg-status-success/10 border border-status-success/20 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-12 h-12 bg-status-success/20 text-status-success rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Password Reset!
              </h3>
              <p className="text-text-secondary text-sm">
                Your password has been successfully reset. Redirecting to
                login...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              {error && (
                <div className="p-4 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 ml-1 block">
                  New Password
                </label>
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

              <div>
                <label className="text-sm font-medium text-text-secondary mb-1.5 ml-1 block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary"
                    size={18}
                  />
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? (
                  <Loader size={20} variant="white" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
