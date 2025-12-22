import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Search,
  SlidersHorizontal,
  Eye,
  Upload,
  FileText,
} from "lucide-react";
import { apiService, ASSET_BASE_URL } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { Table } from "../../../components/common/Table";
import LeavePolicyForm from "./LeavePolicyForm"; // We will create this next
import UploadPolicyModal from "./UploadPolicyModal";
import { useAuth } from "../../../context/AuthContext";

export default function LeavePolicyList() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const { hasPermission } = useAuth();
  const canManage = hasPermission("leave:manage_policies");

  // Split policies into "Leave Types" and "Documents"
  // Logic: Documents are Custom type AND have 0 days allocation
  const leaveTypes = policies.filter(
    (p) => !(p.type === "Custom" && p.allocation.count === 0)
  );

  const documents = policies.filter(
    (p) => p.type === "Custom" && p.allocation.count === 0
  );

  const filteredLeaveTypes = leaveTypes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* SECTION 1: LEAVE TYPES */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">
              Leave Policies
            </h2>
            <p className="text-text-secondary">
              Manage leave types and allocation rules
            </p>
          </div>
          {canManage && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(true)}
                leftIcon={<Upload size={20} />}
              >
                Upload Policy Document
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                leftIcon={<Plus size={20} />}
              >
                Create New Policy
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-4 items-center bg-bg-panel border border-border rounded-lg p-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              size={18}
            />
            <Input
              className="pl-10"
              placeholder="Search policies & documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="secondary"
            leftIcon={<SlidersHorizontal size={18} />}
          >
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
                render: (policy) => {
                  return (
                    <PolicyActions
                      policy={policy}
                      onDelete={handleDelete}
                      onEdit={(id: string) => {
                        setSelectedPolicyId(id);
                        setShowForm(true);
                      }}
                    />
                  );
                },
              },
            ]}
            data={filteredLeaveTypes}
            isLoading={loading}
            emptyMessage="No leave policies found"
          />
        </div>
      </div>

      {/* SECTION 2: REFERENCE DOCUMENTS */}
      {filteredDocuments.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-text-primary">
              Reference Documents
            </h3>
            <p className="text-text-secondary">
              Company handbooks, guidelines, and general policies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className="bg-bg-panel border border-border rounded-lg p-5 hover:border-brand-primary/50 transition-colors flex items-start gap-3"
              >
                <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-medium text-text-primary truncate"
                    title={doc.name}
                  >
                    {doc.name}
                  </h4>
                  <p className="text-sm text-text-secondary line-clamp-2 mt-1">
                    {doc.description || "No description provided"}
                  </p>

                  <div className="flex gap-3 mt-4">
                    {doc.docs?.documentUrl && (
                      <a
                        href={
                          doc.docs.documentUrl.startsWith("http")
                            ? doc.docs.documentUrl
                            : `${ASSET_BASE_URL}${doc.docs.documentUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-primary hover:underline flex items-center gap-1"
                      >
                        <Eye size={14} /> View Document
                      </a>
                    )}

                    {canManage && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline flex items-center gap-1 ml-auto"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LeavePolicyForm
        isOpen={showForm}
        policyId={selectedPolicyId}
        onClose={() => {
          setShowForm(false);
          setSelectedPolicyId(null);
          fetchPolicies();
        }}
      />
      <UploadPolicyModal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          fetchPolicies();
        }}
      />
    </div>
  );
}

import { Tooltip } from "../../../components/common/Tooltip";

const PolicyActions = ({ policy, onDelete, onEdit }: any) => {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("leave:manage_policies");

  if (!canManage) return null;

  return (
    <div className="flex gap-2">
      <Tooltip content="Edit">
        <button
          onClick={() => onEdit(policy._id)}
          className="p-1 text-text-secondary hover:text-brand-primary transition-colors"
        >
          <Eye size={16} />
        </button>
      </Tooltip>

      <Tooltip content="Delete">
        <button
          onClick={() => onDelete(policy._id)}
          className="p-1 text-text-secondary hover:text-red-500 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
};
