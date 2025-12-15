import { useState, useEffect } from "react";
import { Search, Save, Plus, Trash2, Users, CheckCircle } from "lucide-react";
import { apiService } from "../../services/api.service";
import { Modal } from "../../components/common/Modal";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";

import { Skeleton } from "../../components/common/Skeleton";

export default function SalaryStructureManager() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [structure, setStructure] = useState<any>({
    baseSalary: 0,
    hra: 0,
    allowances: [],
    deductions: [],
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadStructure(selectedEmployee);
    }
  }, [selectedEmployee]);

  const loadEmployees = async () => {
    try {
      const data: any = await apiService.getEmployees();
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      console.error("Failed to load employees");
    }
  };

  const loadStructure = async (empId: string) => {
    try {
      setIsFetching(true);
      const data = await apiService.getSalaryStructure(empId);
      if (data.structure) {
        setStructure(data.structure);
      } else {
        // Reset if no structure exists
        setStructure({
          baseSalary: 0,
          hra: 0,
          allowances: [],
          deductions: [],
        });
      }
    } catch (err) {
      console.error("Failed to load structure");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;
    try {
      setLoading(true);
      await apiService.upsertSalaryStructure({
        employeeId: selectedEmployee,
        ...structure,
      });
      setShowSuccessModal(true);
    } catch (err) {
      alert("Failed to save structure");
    } finally {
      setLoading(false);
    }
  };

  // Helper to update specific fields
  const updateField = (field: string, value: any) => {
    setStructure((prev: any) => ({ ...prev, [field]: value }));
  };

  const addAllowance = () => {
    setStructure((prev: any) => ({
      ...prev,
      allowances: [...prev.allowances, { name: "", amount: 0 }],
    }));
  };

  const removeAllowance = (index: number) => {
    const newAllowances = [...structure.allowances];
    newAllowances.splice(index, 1);
    updateField("allowances", newAllowances);
  };

  const updateAllowance = (index: number, key: string, value: any) => {
    const newAllowances = [...structure.allowances];
    newAllowances[index] = { ...newAllowances[index], [key]: value };
    updateField("allowances", newAllowances);
  };

  const addDeduction = () => {
    setStructure((prev: any) => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: 0 }],
    }));
  };

  const removeDeduction = (index: number) => {
    const newDeductions = [...structure.deductions];
    newDeductions.splice(index, 1);
    updateField("deductions", newDeductions);
  };

  const updateDeduction = (index: number, key: string, value: any) => {
    const newDeductions = [...structure.deductions];
    newDeductions[index] = { ...newDeductions[index], [key]: value };
    updateField("deductions", newDeductions);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-card rounded-lg border border-border p-4 h-fit">
          <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Search size={18} /> Select Employee
          </h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {employees.map((emp) => (
              <button
                key={emp._id}
                onClick={() => setSelectedEmployee(emp._id)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  selectedEmployee === emp._id
                    ? "bg-brand-primary text-white"
                    : "hover:bg-bg-hover text-text-secondary"
                }`}
              >
                <div className="font-medium">
                  {emp.firstName} {emp.lastName}
                </div>
                <div
                  className={`text-xs ${
                    selectedEmployee === emp._id
                      ? "text-white/80"
                      : "text-text-muted"
                  }`}
                >
                  {emp.employeeId} • {emp.designation}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {selectedEmployee ? (
            isFetching ? (
              <div className="bg-bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            ) : (
              <div className="bg-bg-card rounded-lg border border-border p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border pb-4">
                  <h2 className="text-lg font-bold text-text-primary">
                    Salary Structure
                  </h2>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    leftIcon={<Save size={20} />}
                  >
                    Save Changes
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary uppercase">
                      Basic Salary
                    </label>
                    <Input
                      type="number"
                      value={structure.baseSalary}
                      onChange={(e) =>
                        updateField("baseSalary", Number(e.target.value))
                      }
                      className="bg-bg-card"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-secondary uppercase">
                      HRA
                    </label>
                    <Input
                      type="number"
                      value={structure.hra}
                      onChange={(e) =>
                        updateField("hra", Number(e.target.value))
                      }
                      className="bg-bg-card"
                    />
                  </div>
                </div>

                {/* Allowances */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-primary">
                      Allowances
                    </label>
                    <button
                      onClick={addAllowance}
                      className="text-brand-primary text-sm flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-2 bg-bg-main p-3 rounded-lg">
                    {structure.allowances.map((allowance: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="text"
                          placeholder="Name"
                          value={allowance.name}
                          onChange={(e) =>
                            updateAllowance(idx, "name", e.target.value)
                          }
                          className="flex-1 bg-bg-card"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={allowance.amount}
                          onChange={(e) =>
                            updateAllowance(
                              idx,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                          className="w-32 bg-bg-card"
                        />
                        <button
                          onClick={() => removeAllowance(idx)}
                          className="text-status-error hover:bg-status-error/10 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {structure.allowances.length === 0 && (
                      <p className="text-xs text-text-muted text-center py-2">
                        No allowances defined
                      </p>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-text-primary">
                      Deductions
                    </label>
                    <button
                      onClick={addDeduction}
                      className="text-brand-primary text-sm flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-2 bg-bg-main p-3 rounded-lg">
                    {structure.deductions.map((deduction: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          type="text"
                          placeholder="Name"
                          value={deduction.name}
                          onChange={(e) =>
                            updateDeduction(idx, "name", e.target.value)
                          }
                          className="flex-1 bg-bg-card"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={deduction.amount}
                          onChange={(e) =>
                            updateDeduction(
                              idx,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                          className="w-32 bg-bg-card"
                        />
                        <button
                          onClick={() => removeDeduction(idx)}
                          className="text-status-error hover:bg-status-error/10 p-1 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {structure.deductions.length === 0 && (
                      <p className="text-xs text-text-muted text-center py-2">
                        No deductions defined
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-brand-primary/5 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-semibold text-text-primary">
                    Estimated Net Salary
                  </span>
                  <span className="text-xl font-bold text-brand-primary">
                    {/* Simple Client Side Calc for preview */}₹{" "}
                    {(
                      Number(structure.baseSalary) +
                      Number(structure.hra) +
                      structure.allowances.reduce(
                        (a: any, b: any) => a + Number(b.amount),
                        0
                      ) -
                      structure.deductions.reduce(
                        (a: any, b: any) => a + Number(b.amount),
                        0
                      )
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-bg-card rounded-lg border border-border p-12 text-text-secondary">
              <Users size={48} className="mb-4 text-text-muted opacity-50" />
              <p>Select an employee to manage their salary structure.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
      >
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 bg-status-success/10 rounded-full flex items-center justify-center text-status-success mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Salary Structure Saved!
          </h3>
          <p className="text-text-secondary mb-6">
            The salary details for the selected employee have been successfully
            updated.
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
