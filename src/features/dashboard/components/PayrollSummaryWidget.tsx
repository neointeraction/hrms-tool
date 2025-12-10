import { useState, useEffect } from "react";
import { DollarSign, Download, Calendar } from "lucide-react"; // Start with DollarSign then use IndianRupee if avail
import { apiService } from "../../../services/api.service";
import { useAuth } from "../../../context/AuthContext";
import { generatePayslipPDF } from "../../../utils/payslipGenerator";

export default function PayrollSummaryWidget() {
  const { user } = useAuth();
  const [latestSlip, setLatestSlip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPayslip = async () => {
      try {
        setLoading(true);
        const data = await apiService.getMyPayslips();
        if (data.payslips && data.payslips.length > 0) {
          // Assume sorted or sort descending by year/month if needed.
          // Usually backend returns latest first or we sort.
          // Let's sort to be safe:
          const sorted = data.payslips.sort((a: any, b: any) => {
            // Simple year check, then month check logic could be complex if string months.
            // Assuming created timestamps or simple array order for now.
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
          setLatestSlip(sorted[0]);
        }
      } catch (error) {
        // console.error("Failed to fetch payslips for widget", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPayslip();
  }, []);

  const handleDownload = async () => {
    if (latestSlip && user) {
      await generatePayslipPDF(latestSlip, user);
    }
  };

  const getNextPayDate = () => {
    const today = new Date();
    // 1st of next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6 h-full min-h-[180px] flex items-center justify-center">
        <p className="text-text-secondary">Loading payroll info...</p>
      </div>
    );
  }

  if (!latestSlip) {
    return (
      <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6 h-full min-h-[180px] flex flex-col items-center justify-center text-center">
        <div className="p-3 bg-brand-primary/10 rounded-full mb-3">
          <DollarSign className="text-brand-primary" size={24} />
        </div>
        <p className="text-text-secondary text-sm">
          No payslip data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-lg shadow-sm border border-border p-6 h-full flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <DollarSign className="text-green-600" size={20} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">
            Payroll & Salary
          </h2>
        </div>

        <div className="mb-4">
          <p className="text-sm text-text-secondary mb-1">
            Last Paid Salary ({latestSlip.month})
          </p>
          <h3 className="text-2xl font-bold text-text-primary">
            ₹{latestSlip.netSalary.toLocaleString()}
          </h3>
        </div>

        <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
          <Calendar size={14} />
          <span>
            Next Pay Date:{" "}
            <span className="font-medium text-text-primary">
              {getNextPayDate()}
            </span>
          </span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg transition-colors text-sm font-medium"
      >
        <Download size={16} /> Download Payslip
      </button>
    </div>
  );
}
