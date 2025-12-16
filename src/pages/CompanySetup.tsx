import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, User, Mail, Lock, Globe, Check } from "lucide-react";
import { PasswordInput } from "../components/common/PasswordInput";
import { Input } from "../components/common/Input";
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { apiService } from "../services/api.service";

const CompanySetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    adminName: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
    subdomain: "",
    plan: "free",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.registerCompany({
        companyName: formData.companyName,
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        password: formData.password,
        subdomain: formData.subdomain || undefined,
        plan: formData.plan,
      });

      // Show success modal
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to register company");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      features: ["Up to 10 employees", "100 MB storage", "Basic modules"],
    },
    {
      id: "basic",
      name: "Basic",
      price: "$29/mo",
      features: ["Up to 50 employees", "500 MB storage", "All modules"],
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99/mo",
      features: ["Up to 200 employees", "2 GB storage", "Advanced features"],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      features: ["Unlimited employees", "10 GB storage", "Premium support"],
    },
  ];

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
            Everything you need to manage your workforce.
          </h1>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Join thousands of forward-thinking companies that use our platform
            to streamline HR, payroll, and employee engagement.
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
              <p className="font-semibold">Trusted by industry leaders</p>
              <p className="text-blue-200">Start your journey today</p>
            </div>
          </div>
          <p className="text-xs text-blue-200 opacity-60">
            © {new Date().getFullYear()} NeointeractionHR. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto bg-bg-main">
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full p-6 md:p-12 lg:p-16">
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
              Create your workspace
            </h2>
            <p className="text-text-secondary">
              It only takes a few minutes to get started.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full"></div>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="relative flex flex-col items-center group"
                >
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                      step >= s
                        ? "bg-brand-primary border-brand-primary text-white scale-110 shadow-md"
                        : "bg-bg-card border-border text-text-muted"
                    }`}
                  >
                    {step > s ? (
                      <Check size={14} strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-bold">{s}</span>
                    )}
                  </div>
                  <span
                    className={`absolute top-10 text-xs font-medium transition-colors duration-300 ${
                      step === s ? "text-brand-primary" : "text-text-muted"
                    }`}
                  >
                    {s === 1 ? "Company" : s === 2 ? "Admin" : "Plan"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <div className="w-1 h-1 rounded-full bg-status-error" /> {error}
              </div>
            )}

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <Input
                  label="Company Name *"
                  leftIcon={<Building size={18} />}
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Acme Corp"
                  className="bg-bg-card border-border h-[38px]"
                />

                <div>
                  <Input
                    label="Subdomain"
                    leftIcon={<Globe size={18} />}
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleChange}
                    placeholder="acme"
                    className="bg-bg-card border-border h-[38px]"
                  />
                  <p className="text-xs text-text-muted mt-2 pl-1 flex items-center gap-1">
                    Your URL:{" "}
                    <span className="font-mono text-brand-primary bg-brand-primary/10 px-1 rounded">
                      {formData.subdomain || "your-company"}.yourhrms.com
                    </span>
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.companyName}
                    className="w-full px-6 h-[38px] bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-brand-primary/30 disabled:opacity-50 disabled:shadow-none font-semibold text-sm flex items-center justify-center"
                  >
                    Continue to Admin Setup
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Admin Account */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Full Name *"
                    leftIcon={<User size={18} />}
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="bg-bg-card border-border h-[38px]"
                  />
                  <Input
                    label="Work Email *"
                    leftIcon={<Mail size={18} />}
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="bg-bg-card border-border h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                    Password *
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary"
                      size={18}
                    />
                    <PasswordInput
                      value={formData.password}
                      onChange={handleChange}
                      name="password"
                      required
                      className="pl-10 bg-bg-card border-border h-[38px] rounded-lg"
                      placeholder="Create a strong password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5 ml-1">
                    Confirm Password *
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-brand-primary"
                      size={18}
                    />
                    <PasswordInput
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      name="confirmPassword"
                      required
                      className="pl-10 bg-bg-card border-border h-[38px] rounded-lg"
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 h-[38px] border border-border text-text-secondary rounded-lg hover:bg-bg-hover transition-colors font-semibold text-sm flex items-center justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={
                      !formData.adminName ||
                      !formData.adminEmail ||
                      !formData.password ||
                      !formData.confirmPassword
                    }
                    className="flex-1 px-6 h-[38px] bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-brand-primary/30 disabled:opacity-50 disabled:shadow-none font-semibold text-sm flex items-center justify-center"
                  >
                    Continue to Plans
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Plan Selection */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() =>
                        setFormData({ ...formData, plan: plan.id })
                      }
                      className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                        formData.plan === plan.id
                          ? "border-brand-primary bg-brand-primary/5 shadow-md"
                          : "border-border bg-bg-card hover:border-brand-primary/50 hover:bg-bg-hover"
                      }`}
                    >
                      {formData.plan === plan.id && (
                        <div className="absolute top-4 right-4 text-brand-primary bg-white dark:bg-black rounded-full p-1 shadow-sm">
                          <Check size={16} strokeWidth={3} />
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg text-text-primary">
                          {plan.name}
                        </h3>
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            formData.plan === plan.id
                              ? "bg-brand-primary text-white"
                              : "bg-bg-hover text-text-secondary"
                          }`}
                        >
                          {plan.price}
                        </span>
                      </div>

                      <ul className="space-y-2.5">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-text-secondary"
                          >
                            <Check
                              className={`mr-2.5 w-4 h-4 ${
                                formData.plan === plan.id
                                  ? "text-brand-primary"
                                  : "text-text-muted group-hover:text-brand-primary"
                              }`}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 h-[38px] border border-border text-text-secondary rounded-lg hover:bg-bg-hover transition-colors font-semibold text-sm flex items-center justify-center"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 h-[38px] bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-brand-primary/30 disabled:opacity-50 disabled:shadow-none font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      "Create Company Workspace"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-brand-primary hover:text-brand-primary/80 font-semibold hover:underline decoration-2 underline-offset-2 transition-all"
            >
              Log in here
            </a>
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => navigate("/login")}
        onConfirm={() => navigate("/login")}
        title="Registration Successful"
        message={`Company registered successfully! Please login with: ${formData.adminEmail}`}
        confirmText="Proceed to Login"
        variant="success"
        showCancel={false}
      />
    </div>
  );
};

export default CompanySetup;
