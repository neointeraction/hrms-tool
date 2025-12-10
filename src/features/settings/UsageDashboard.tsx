import { useState, useEffect } from "react";
import { apiService } from "../../services/api.service";
import { Users, Database, Package, CheckCircle, XCircle } from "lucide-react";

interface UsageData {
  employees: {
    current: number;
    limit: number;
    percentage: string;
  };
  storage: {
    used: number;
    limit: number;
    percentage: string;
    breakdown: {
      documents: number;
      profilePictures: number;
      payslips: number;
    };
  };
  modules: {
    enabled: string[];
    disabled: string[];
  };
}

const UsageDashboard = () => {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsageAnalytics();
      setUsage(response);
    } catch (error) {
      console.error("Failed to load usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usage) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading usage data...
          </p>
        </div>
      </div>
    );
  }

  const allModules = [
    { id: "attendance", name: "Attendance" },
    { id: "leave", name: "Leave Management" },
    { id: "employees", name: "Employee Management" },
    { id: "payroll", name: "Payroll" },
    { id: "projects", name: "Projects" },
    { id: "tasks", name: "Tasks" },
    { id: "timesheet", name: "Timesheet" },
    { id: "policies", name: "Policies" },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Usage & Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor your organization's usage and limits
        </p>
      </div>

      {/* Employee Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-blue-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Employee Usage
          </h2>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {usage.employees.current} / {usage.employees.limit}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({usage.employees.percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              Number(usage.employees.percentage) > 80
                ? "bg-orange-500"
                : "bg-blue-600"
            }`}
            style={{
              width: `${Math.min(Number(usage.employees.percentage), 100)}%`,
            }}
          />
        </div>
        {Number(usage.employees.percentage) > 80 && (
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
            ⚠️ You're approaching your employee limit. Consider upgrading your
            plan.
          </p>
        )}
      </div>

      {/* Storage Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-purple-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Storage Usage
          </h2>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {usage.storage.used.toFixed(1)} MB / {usage.storage.limit} MB
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ({usage.storage.percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all ${
              Number(usage.storage.percentage) > 80
                ? "bg-orange-500"
                : "bg-purple-600"
            }`}
            style={{
              width: `${Math.min(Number(usage.storage.percentage), 100)}%`,
            }}
          />
        </div>

        {/* Storage Breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Documents
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {usage.storage.breakdown.documents} MB
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Profile Pictures
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {usage.storage.breakdown.profilePictures} MB
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">Payslips</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {usage.storage.breakdown.payslips} MB
            </p>
          </div>
        </div>
      </div>

      {/* Module Access */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="text-green-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Module Access
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allModules.map((module) => {
            const isEnabled = usage.modules.enabled.includes(module.id);
            return (
              <div
                key={module.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isEnabled
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-gray-50 dark:bg-gray-700"
                }`}
              >
                {isEnabled ? (
                  <CheckCircle
                    className="text-green-600 dark:text-green-400"
                    size={20}
                  />
                ) : (
                  <XCircle className="text-gray-400" size={20} />
                )}
                <span
                  className={`font-medium ${
                    isEnabled
                      ? "text-green-900 dark:text-green-300"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {module.name}
                </span>
              </div>
            );
          })}
        </div>
        {usage.modules.disabled.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Upgrade your plan to access all {allModules.length} modules
          </p>
        )}
      </div>
    </div>
  );
};

export default UsageDashboard;
