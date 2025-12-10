import { useState, useEffect } from "react";
import { Plus, Trash2, Search, SlidersHorizontal, Eye } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Table } from "../../../components/common/Table";
import LeavePolicyForm from "./LeavePolicyForm"; // We will create this next

export default function LeavePolicyList() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Assuming getLeavePolicies response returns { policies: [...] }
      const response = await apiService.getLeavePolicies();
      setPolicies(response.policies || []);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this policy?")) return;
    try {
      await apiService.deleteLeavePolicy(id);
      fetchPolicies();
    } catch (error) {
      alert("Failed to delete policy");
    }
  };

  const filteredPolicies = policies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showForm) {
    return (
      <LeavePolicyForm
        policyId={selectedPolicyId}
        onBack={() => {
          setShowForm(false);
          setSelectedPolicyId(null);
          fetchPolicies();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">
            Leave Policies
          </h2>
          <p className="text-text-secondary">
            Manage leave types and allocation rules
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={18} />}>
          Create New Policy
        </Button>
      </div>

      <div className="flex gap-4 items-center bg-bg-panel border border-border rounded-lg p-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
            size={18}
          />
          <Input
            className="pl-10"
            placeholder="Search policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="secondary" leftIcon={<SlidersHorizontal size={18} />}>
          Filters
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-bg-panel">
        <Table
          columns={[
            {
              header: "Policy Name",
              accessorKey: "name",
              render: (policy) => (
                <div>
                  <div className="font-medium text-text-primary">
                    {policy.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {policy.category}
                  </div>
                </div>
              ),
            },
            {
              header: "Leave Type",
              accessorKey: "type",
            },
            {
              header: "Cycle",
              accessorKey: "allocation.cycle",
              render: (policy) => policy.allocation.cycle,
            },
            {
              header: "Count",
              render: (policy) => (
                <span className="font-semibold text-brand-primary">
                  {policy.allocation.count} days
                </span>
              ),
            },
            {
              header: "Apply To",
              render: (policy) => (
                <div className="flex flex-wrap gap-1">
                  {policy.eligibility.applyTo.length > 0 ? (
                    policy.eligibility.applyTo.map((dept: string) => (
                      <span
                        key={dept}
                        className="bg-bg-main text-xs px-2 py-0.5 rounded-full border border-border"
                      >
                        {dept}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-text-secondary">All</span>
                  )}
                </div>
              ),
            },
            {
              header: "Status",
              render: (policy) => (
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    policy.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {policy.status}
                </span>
              ),
            },
            {
              header: "Actions",
              render: (policy) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy._id);
                      setShowForm(true);
                    }}
                    className="p-1 text-text-secondary hover:text-brand-primary transition-colors"
                    title="View / Edit"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(policy._id)}
                    className="p-1 text-text-secondary hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredPolicies}
          isLoading={loading}
          emptyMessage="No policies found"
        />
      </div>
    </div>
  );
}
