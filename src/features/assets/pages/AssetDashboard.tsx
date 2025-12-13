import { useState, useEffect } from "react";
import {
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Loader } from "../../../components/common/Loader";
import { Badge } from "../../../components/common/Badge";
import { useNavigate } from "react-router-dom";

interface AssetStats {
  totalAssets: number;
  availableAssets: number;
  issuedAssets: number;
  underRepairAssets: number;
  lostAssets: number;
  disposedAssets: number;
  warrantyExpiringSoon: number;
  totalValue: number;
}

export default function AssetDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAssetStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const getUtilizationRate = () => {
    if (!stats || stats.totalAssets === 0) return 0;
    return Math.round((stats.issuedAssets / stats.totalAssets) * 100);
  };

  const getAvailabilityRate = () => {
    if (!stats || stats.totalAssets === 0) return 0;
    return Math.round((stats.availableAssets / stats.totalAssets) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Asset Management
        </h1>
        <p className="text-text-secondary">
          Overview of company assets and inventory
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Package className="text-brand-primary" size={24} />
            <span className="text-xs text-text-secondary">Total</span>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.totalAssets || 0}
          </div>
          <p className="text-sm text-text-secondary mt-1">Total Assets</p>
        </div>

        {/* Available Assets */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-status-success" size={24} />
            <Badge variant="success">{getAvailabilityRate()}%</Badge>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.availableAssets || 0}
          </div>
          <p className="text-sm text-text-secondary mt-1">Available</p>
        </div>

        {/* Issued Assets */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-status-info" size={24} />
            <Badge variant="info">{getUtilizationRate()}%</Badge>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {stats?.issuedAssets || 0}
          </div>
          <p className="text-sm text-text-secondary mt-1">Issued</p>
        </div>

        {/* Total Value */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-brand-primary" size={24} />
            <span className="text-xs text-text-secondary">INR</span>
          </div>
          <div className="text-3xl font-bold text-text-primary">
            {new Intl.NumberFormat("en-IN", {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(stats?.totalValue || 0)}
          </div>
          <p className="text-sm text-text-secondary mt-1">Total Value</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status */}
        <div className="bg-bg-card border border-border rounded-xl p-6 flex flex-col h-full">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Asset Status Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle
                  className="text-green-600 dark:text-green-400"
                  size={18}
                />
                <span className="text-sm font-medium text-text-secondary">
                  Available
                </span>
              </div>
              <span className="text-2xl font-bold text-text-primary">
                {stats?.availableAssets || 0}
              </span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp
                  className="text-blue-600 dark:text-blue-400"
                  size={18}
                />
                <span className="text-sm font-medium text-text-secondary">
                  Issued
                </span>
              </div>
              <span className="text-2xl font-bold text-text-primary">
                {stats?.issuedAssets || 0}
              </span>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle
                  className="text-amber-600 dark:text-amber-400"
                  size={18}
                />
                <span className="text-sm font-medium text-text-secondary">
                  Under Repair
                </span>
              </div>
              <span className="text-2xl font-bold text-text-primary">
                {stats?.underRepairAssets || 0}
              </span>
            </div>

            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-lg flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="text-red-600 dark:text-red-400" size={18} />
                <span className="text-sm font-medium text-text-secondary">
                  Lost
                </span>
              </div>
              <span className="text-2xl font-bold text-text-primary">
                {stats?.lostAssets || 0}
              </span>
            </div>

            <div className="col-span-2 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="text-gray-500" size={18} />
                <span className="text-sm font-medium text-text-secondary">
                  Disposed
                </span>
              </div>
              <span className="text-2xl font-bold text-text-primary">
                {stats?.disposedAssets || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-4">
          {/* Alerts */}
          {stats && stats.warrantyExpiringSoon > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-amber-600 dark:text-amber-400 flex-shrink-0"
                  size={24}
                />
                <div>
                  <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">
                    Warranty Expiring Soon
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-500">
                    {stats.warrantyExpiringSoon} asset
                    {stats.warrantyExpiringSoon !== 1 ? "s" : ""} with warranty
                    expiring in 30 days
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/assets/inventory")}
                className="p-4 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors text-left"
              >
                <Package className="text-brand-primary mb-2" size={20} />
                <p className="text-sm font-medium text-text-primary">
                  View Inventory
                </p>
              </button>
              <button
                onClick={() => navigate("/miscellaneous/asset-categories")}
                className="p-4 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors text-left"
              >
                <Package className="text-brand-primary mb-2" size={20} />
                <p className="text-sm font-medium text-text-primary">
                  Categories
                </p>
              </button>
              <button
                onClick={() => navigate("/my-assets")}
                className="p-4 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors text-left"
              >
                <CheckCircle className="text-brand-primary mb-2" size={20} />
                <p className="text-sm font-medium text-text-primary">
                  My Assets
                </p>
              </button>
              <button
                onClick={() => navigate("/assets/inventory")}
                className="p-4 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg transition-colors text-left"
              >
                <Clock className="text-brand-primary mb-2" size={20} />
                <p className="text-sm font-medium text-text-primary">History</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Utilization Insights */}
      <div className="bg-bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Utilization Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-text-secondary mb-2">Utilization Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {getUtilizationRate()}%
              </span>
              <span className="text-sm text-text-secondary mb-1">
                of assets in use
              </span>
            </div>
            <div className="mt-2 bg-bg-secondary rounded-full h-2">
              <div
                className="bg-status-info rounded-full h-2 transition-all"
                style={{ width: `${getUtilizationRate()}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">
              Availability Rate
            </p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {getAvailabilityRate()}%
              </span>
              <span className="text-sm text-text-secondary mb-1">
                available for use
              </span>
            </div>
            <div className="mt-2 bg-bg-secondary rounded-full h-2">
              <div
                className="bg-status-success rounded-full h-2 transition-all"
                style={{ width: `${getAvailabilityRate()}%` }}
              ></div>
            </div>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-2">Asset Health</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-text-primary">
                {stats
                  ? Math.round(
                      ((stats.totalAssets -
                        stats.lostAssets -
                        stats.disposedAssets -
                        stats.underRepairAssets) /
                        stats.totalAssets) *
                        100
                    )
                  : 0}
                %
              </span>
              <span className="text-sm text-text-secondary mb-1">
                in good condition
              </span>
            </div>
            <div className="mt-2 bg-bg-secondary rounded-full h-2">
              <div
                className="bg-status-success rounded-full h-2 transition-all"
                style={{
                  width: `${
                    stats
                      ? Math.round(
                          ((stats.totalAssets -
                            stats.lostAssets -
                            stats.disposedAssets -
                            stats.underRepairAssets) /
                            stats.totalAssets) *
                            100
                        )
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
