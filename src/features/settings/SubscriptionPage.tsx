import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { TrendingUp, Users, Database, Package } from "lucide-react";

interface Subscription {
  plan: string;
  status: string;
  subscriptionStart: string;
  subscriptionEnd?: string;
  limits: {
    maxEmployees: number;
    maxStorage: number;
    enabledModules: string[];
  };
  usage: {
    employeeCount: number;
    storageUsed: number;
  };
}

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubscriptionDetails();
      setSubscription(response.subscription);
    } catch (error) {
      console.error("Failed to load subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      trial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      expired: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPlanDetails = (plan: string) => {
    const plans = {
      free: { name: "Free", price: "$0/mo", color: "gray" },
      basic: { name: "Basic", price: "$29/mo", color: "blue" },
      pro: { name: "Pro", price: "$99/mo", color: "purple" },
      enterprise: { name: "Enterprise", price: "Custom", color: "amber" },
    };
    return plans[plan as keyof typeof plans] || plans.free;
  };

  const calculatePercentage = (current: number, max: number) => {
    return ((current / max) * 100).toFixed(1);
  };

  const allPlans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["Up to 10 employees", "100 MB storage", "Basic modules (3)"],
      maxEmployees: 10,
    },
    {
      id: "basic",
      name: "Basic",
      price: "$29",
      period: "/month",
      features: [
        "Up to 50 employees",
        "500 MB storage",
        "Standard modules (5)",
      ],
      maxEmployees: 50,
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99",
      period: "/month",
      features: [
        "Up to 200 employees",
        "2 GB storage",
        "Advanced modules (7)",
        "Priority support",
      ],
      maxEmployees: 200,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Unlimited employees",
        "10 GB storage",
        "All modules (8)",
        "24/7 support",
        "Custom integrations",
      ],
      maxEmployees: 9999,
    },
  ];

  if (loading || !subscription) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading subscription...
          </p>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(subscription.plan);
  const employeePercentage = calculatePercentage(
    subscription.usage.employeeCount,
    subscription.limits.maxEmployees
  );
  const storagePercentage = calculatePercentage(
    subscription.usage.storageUsed,
    subscription.limits.maxStorage
  );

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription & Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your subscription plan and usage
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{planDetails.name} Plan</h2>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </span>
            </div>
            <p className="text-blue-100 mb-4">
              {subscription.subscriptionEnd
                ? `Renews on ${new Date(
                    subscription.subscriptionEnd
                  ).toLocaleDateString()}`
                : "Current plan"}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold">{planDetails.price}</span>
              {subscription.plan !== "free" && (
                <span className="text-blue-100">/month</span>
              )}
            </div>
          </div>
          <Package className="h-16 w-16 opacity-50" />
        </div>
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Employee Usage
              </h3>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {subscription.usage.employeeCount} /{" "}
              {subscription.limits.maxEmployees}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(Number(employeePercentage), 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {employeePercentage}% used
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Database className="text-purple-600" size={20} />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Storage Usage
              </h3>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {subscription.usage.storageUsed.toFixed(1)} /{" "}
              {subscription.limits.maxStorage} MB
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min(Number(storagePercentage), 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {storagePercentage}% used
          </p>
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          All Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {allPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border-2 p-6 ${
                subscription.plan === plan.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                  >
                    <TrendingUp
                      className="mr-2 text-green-500 flex-shrink-0"
                      size={16}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              {subscription.plan === plan.id ? (
                <button
                  disabled
                  className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-lg cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() =>
                    alert("Stripe integration will be available in Week 5")
                  }
                >
                  Upgrade
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
