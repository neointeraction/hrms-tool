import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, User, Mail, Lock, Globe, Check } from "lucide-react";
import { PasswordInput } from "../components/common/PasswordInput";
import { Input } from "../components/common/Input";
import { apiService } from "../services/api.service";

const CompanySetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // Show success and redirect to login
      alert(
        `Company registered successfully! Please login with: ${formData.adminEmail}`
      );
      navigate("/login");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Create Your NeointeractionHR Workspace
          </h1>
          <p className="text-blue-100">
            Get started with your free account in minutes
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= s
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-400"
                  }`}
                >
                  {step > s ? <Check size={20} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step > s ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Company Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Company Information
              </h2>

              <div>
                <Input
                  label="Company Name *"
                  leftIcon={<Building size={20} />}
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  placeholder="Acme Corporation"
                />
              </div>

              <div>
                <Input
                  label="Subdomain (Optional)"
                  leftIcon={<Globe size={20} />}
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="acme"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your workspace URL: {formData.subdomain || "your-company"}
                  .yourhrms.com
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.companyName}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Admin Account
              </h2>

              <div>
                <Input
                  label="Your Name *"
                  leftIcon={<User size={20} />}
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Input
                  label="Email *"
                  leftIcon={<Mail size={20} />}
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="john@acme.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    size={20}
                  />
                  <PasswordInput
                    value={formData.password}
                    onChange={handleChange}
                    name="password"
                    required
                    className="pl-10 bg-bg-card"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    size={20}
                  />
                  <PasswordInput
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    name="confirmPassword"
                    required
                    className="pl-10 bg-bg-card"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Choose Your Plan
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.plan === plan.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                      {plan.price}
                    </p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                        >
                          <Check className="mr-2 text-green-500" size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Creating Workspace..." : "Create Workspace"}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySetup;
