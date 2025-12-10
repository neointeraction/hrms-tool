import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { apiService } from "../../services/api.service";
import { useAuth } from "../../context/AuthContext";

import { generatePayslipPDF } from "../../utils/payslipGenerator";

export default function PayslipView() {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      const data = await apiService.getMyPayslips();
      setPayslips(data.payslips || []);
    } catch (err) {
      console.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (slip: any) => {
    await generatePayslipPDF(slip, user);
  };

  if (loading)
    return <div className="text-center py-8">Loading payslips...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {payslips.length === 0 ? (
        <div className="col-span-full text-center py-12 text-text-muted bg-bg-card border border-border rounded-lg">
          <FileText size={48} className="mx-auto mb-2 opacity-20" />
          <p>No payslips available yet.</p>
        </div>
      ) : (
        payslips.map((slip) => (
          <div
            key={slip._id}
            className="bg-bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-text-primary">
                  {slip.month} {slip.year}
                </h3>
                <p className="text-sm text-text-secondary">Payslip</p>
              </div>
              <div className="bg-brand-primary/5 p-2 rounded-full text-brand-primary">
                <FileText size={24} />
              </div>
            </div>

            <div className="space-y-2 mb-6 border-b border-border pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Basic Pay</span>
                <span className="font-medium">
                  ₹{slip.basicPay.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Total Allowances</span>
                <span className="font-medium text-status-success">
                  + ₹
                  {(
                    slip.grossSalary -
                    slip.basicPay -
                    slip.hra
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Deductions</span>
                <span className="font-medium text-status-error">
                  - ₹{slip.totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-text-secondary">
                Net Pay
              </span>
              <span className="text-xl font-bold text-brand-primary">
                ₹{slip.netSalary.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => handleDownload(slip)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-bg-hover transition-colors text-sm font-medium text-text-primary"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        ))
      )}
    </div>
  );
}
