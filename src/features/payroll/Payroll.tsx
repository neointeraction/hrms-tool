import { DollarSign, Download, TrendingUp } from "lucide-react";

const PAYSLIPS = [
  {
    month: "May 2025",
    amount: "$4,500.00",
    status: "Paid",
    date: "May 30, 2025",
  },
  {
    month: "April 2025",
    amount: "$4,500.00",
    status: "Paid",
    date: "Apr 30, 2025",
  },
  {
    month: "March 2025",
    amount: "$4,500.00",
    status: "Paid",
    date: "Mar 30, 2025",
  },
];

export default function Payroll() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Payroll</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Salary Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign size={24} />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
              Net Pay
            </span>
          </div>

          <div className="mb-2">
            <p className="text-sm opacity-80 mb-1">Last Month's Pay</p>
            <h2 className="text-4xl font-bold">$4,500.00</h2>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-80">
            <TrendingUp size={16} />
            <span>Processed on May 30, 2025</span>
          </div>
        </div>

        {/* History Table */}
        <div className="md:col-span-2 bg-bg-card rounded-lg shadow-sm border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-text-primary">
              Payslip History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-main">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PAYSLIPS.map((slip) => (
                  <tr
                    key={slip.month}
                    className="hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {slip.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {slip.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {slip.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-status-success/10 text-status-success">
                        {slip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-brand-primary hover:text-brand-secondary hover:bg-brand-primary/5 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1">
                        <Download size={16} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
