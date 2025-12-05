import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

export default function StatusTracking() {
  // Mock data
  const employees = [
    {
      id: 1,
      name: "John Doe",
      role: "Software Engineer",
      status: "Active",
      type: "Full-time",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Product Manager",
      status: "On Leave",
      type: "Full-time",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Designer",
      status: "Probation",
      type: "Contract",
    },
    {
      id: 4,
      name: "Sarah Wilson",
      role: "Intern",
      status: "Notice Period",
      type: "Internship",
    },
    {
      id: 5,
      name: "Tom Brown",
      role: "Developer",
      status: "Terminated",
      type: "Full-time",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-status-success/10 text-status-success border-status-success/20";
      case "Probation":
        return "bg-status-warning/10 text-status-warning border-status-warning/20";
      case "On Leave":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Notice Period":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Terminated":
        return "bg-status-error/10 text-status-error border-status-error/20";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <CheckCircle size={16} />;
      case "Probation":
        return <Clock size={16} />;
      case "On Leave":
        return <Clock size={16} />;
      case "Notice Period":
        return <AlertCircle size={16} />;
      case "Terminated":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {["Active", "Probation", "On Leave", "Notice Period", "Terminated"].map(
          (status) => (
            <div
              key={status}
              className="bg-bg-main p-4 rounded-lg border border-border text-center"
            >
              <div className="text-2xl font-bold text-text-primary mb-1">
                {employees.filter((e) => e.status === status).length}
              </div>
              <div className="text-xs text-text-secondary uppercase tracking-wider">
                {status}
              </div>
            </div>
          )
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Employee Status List
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-secondary text-sm">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr
                  key={employee.id}
                  className="border-b border-border hover:bg-bg-hover/50 transition-colors"
                >
                  <td className="py-3 px-4 text-text-primary font-medium">
                    {employee.name}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {employee.role}
                  </td>
                  <td className="py-3 px-4 text-text-secondary">
                    {employee.type}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        employee.status
                      )}`}
                    >
                      {getStatusIcon(employee.status)}
                      {employee.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-brand-primary hover:text-brand-secondary text-sm font-medium">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
