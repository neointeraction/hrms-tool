import { useState, useEffect } from "react";
import { Plus, Search, MoreVertical, Loader2, AlertCircle } from "lucide-react";
import AddEmployeeModal from "./AddEmployeeModal";
import { apiService } from "../../../services/api.service";

interface Employee {
  _id: string;
  email: string;
  employeeId: string;
  department: string;
  roles: string[];
  createdAt: string;
}

export default function EmployeeProfiles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees from API
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllEmployees();
      setEmployees(response.employees || []);
    } catch (err: any) {
      console.error("Failed to fetch employees:", err);
      setError(err.message || "Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Employee Profiles
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="flex items-center gap-4 bg-bg-main p-2 rounded-lg border border-border">
        <Search className="text-text-muted" size={20} />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none flex-1 text-sm"
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-status-error/10 text-status-error p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-secondary text-sm">
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Employee ID</th>
                <th className="py-3 px-4 font-medium">Department</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Join Date</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    {searchTerm
                      ? "No employees found matching your search"
                      : "No employees found. Add your first employee to get started."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="border-b border-border hover:bg-bg-hover/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-text-primary font-medium">
                      {employee.email}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {employee.employeeId}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {employee.department}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded text-xs font-medium">
                        {employee.roles[0] || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-bg-hover">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          // Refresh employee list after adding
          fetchEmployees();
          console.log("Employee added successfully");
        }}
      />
    </div>
  );
}
