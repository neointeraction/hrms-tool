import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Factory,
  Layers,
  Hash,
  CalendarClock,
  Activity,
  Timer,
} from "lucide-react";
import { apiService } from "../../../services/api.service";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Skeleton } from "../../../components/common/Skeleton";
import { Badge } from "../../../components/common/Badge";
import { Select } from "../../../components/common/Select";
import { Checkbox } from "../../../components/common/Checkbox";
import { Textarea } from "../../../components/common/Textarea";

interface AssetAssignment {
  _id: string;
  assetId: {
    _id: string;
    name: string;
    assetCode: string;
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    invoice?: string;
  };
  issueDate: string;
  expectedReturnDate?: string;
  conditionAtIssue: string;
  status: string;
  notes?: string;
}

export default function MyAssets() {
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acknowledgeModalId, setAcknowledgeModalId] = useState<string | null>(
    null
  );
  const [returnModalId, setReturnModalId] = useState<string | null>(null);
  const [returnCondition, setReturnCondition] = useState("Good");
  const [returnNotes, setReturnNotes] = useState("");

  // Report incident state
  const [reportModalAsset, setReportModalAsset] = useState<any>(null);
  const [incidentType, setIncidentType] = useState("Damage");
  const [incidentDescription, setIncidentDescription] = useState("");
  const [incidentUrgency, setIncidentUrgency] = useState("Medium");
  const [incidentPhotos, setIncidentPhotos] = useState<File[]>([]);

  useEffect(() => {
    fetchMyAssets();
  }, []);

  const fetchMyAssets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyAssets();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (assignmentId: string) => {
    try {
      await apiService.acknowledgeAsset(assignmentId);
      setAcknowledgeModalId(null);
      fetchMyAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReturn = async () => {
    if (!returnModalId) return;

    try {
      await apiService.returnAsset(returnModalId, {
        conditionAtReturn: returnCondition,
        notes: returnNotes,
      });
      setReturnModalId(null);
      setReturnCondition("Good");
      setReturnNotes("");
      fetchMyAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReportIncident = async () => {
    if (!reportModalAsset) return;

    try {
      const data = {
        assetId: reportModalAsset.assetId._id,
        assignmentId: reportModalAsset._id,
        incidentType,
        description: incidentDescription,
        urgency: incidentUrgency,
      };

      await apiService.reportAssetIncident(data, incidentPhotos);

      // Reset and close
      setReportModalAsset(null);
      setIncidentType("Damage");
      setIncidentDescription("");
      setIncidentUrgency("Medium");
      setIncidentPhotos([]);

      fetchMyAssets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPendingCount = () => {
    return assignments.filter((a) => a.status === "Pending Acknowledgement")
      .length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Assets</h1>
        <p className="text-text-secondary">
          Assets assigned to you by the company
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {getPendingCount() > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
            ⚠️ You have {getPendingCount()} asset(s) pending acknowledgement
          </p>
        </div>
      )}

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          // Skeleton Loader
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[280px]"
            >
              {/* Header Skeleton */}
              <div className="p-4 border-b border-border flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-3 w-20 ml-7" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>

              {/* Details Skeleton */}
              <div className="p-4 flex-1 space-y-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="border-t border-border/50 pt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>

              {/* Actions Skeleton */}
              <div className="p-3 border-t border-border bg-bg-hover/50 flex gap-2">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="h-8 flex-1 rounded-lg" />
              </div>
            </div>
          ))
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-12 bg-bg-card border border-border rounded-xl text-center text-text-secondary">
            <Package className="mx-auto mb-4 text-text-muted" size={48} />
            <p className="text-lg">No assets assigned to you</p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="bg-bg-card border border-border rounded-xl overflow-hidden hover:shadow-sm transition-all duration-200 flex flex-col group"
            >
              {/* Card Header & Status */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-bg-hover to-transparent flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Package
                      className="text-brand-primary shrink-0"
                      size={18}
                    />
                    <h3
                      className="text-base font-bold text-text-primary truncate"
                      title={assignment.assetId.name}
                    >
                      {assignment.assetId.name}
                    </h3>
                  </div>
                  <p className="text-xs text-text-secondary font-mono truncate pl-6.5">
                    {assignment.assetId.assetCode}
                  </p>
                </div>
                <Badge
                  variant={
                    assignment.status === "Pending Acknowledgement"
                      ? "warning"
                      : "success"
                  }
                  size="sm"
                  className="shrink-0"
                >
                  {assignment.status}
                </Badge>
              </div>

              {/* Asset Details */}
              <div className="p-4 flex-1 space-y-3">
                <div className="space-y-2">
                  {assignment.assetId.manufacturer && (
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Factory
                        size={14}
                        className="text-text-secondary shrink-0"
                      />
                      <span
                        className="truncate"
                        title={assignment.assetId.manufacturer}
                      >
                        {assignment.assetId.manufacturer}
                      </span>
                    </div>
                  )}
                  {assignment.assetId.model && (
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Layers
                        size={14}
                        className="text-text-secondary shrink-0"
                      />
                      <span
                        className="truncate"
                        title={assignment.assetId.model}
                      >
                        {assignment.assetId.model}
                      </span>
                    </div>
                  )}
                  {assignment.assetId.serialNumber && (
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Hash
                        size={14}
                        className="text-text-secondary shrink-0"
                      />
                      <span
                        className="truncate font-mono text-xs"
                        title={assignment.assetId.serialNumber}
                      >
                        {assignment.assetId.serialNumber}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <CalendarClock
                      size={14}
                      className="text-text-secondary shrink-0"
                    />
                    <span>
                      Issued:{" "}
                      {new Date(assignment.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <Activity
                      size={14}
                      className="text-text-secondary shrink-0"
                    />
                    <span>Condition: {assignment.conditionAtIssue}</span>
                  </div>
                  {assignment.expectedReturnDate && (
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                      <Timer
                        size={14}
                        className="text-text-secondary shrink-0"
                      />
                      <span>
                        Return:{" "}
                        {new Date(
                          assignment.expectedReturnDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {assignment.notes && (
                  <div className="pt-2">
                    <p
                      className="text-xs text-text-secondary italic line-clamp-2"
                      title={assignment.notes}
                    >
                      "{assignment.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-3 border-t border-border bg-bg-hover/50">
                {assignment.status === "Pending Acknowledgement" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center h-8"
                    onClick={() => setAcknowledgeModalId(assignment._id)}
                    leftIcon={<CheckCircle size={14} />}
                  >
                    Acknowledge
                  </Button>
                ) : assignment.status === "Active" ? (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 justify-center h-8 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                      onClick={() => setReturnModalId(assignment._id)}
                      leftIcon={<XCircle size={14} />}
                    >
                      Return
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1 justify-center h-8"
                      onClick={() => setReportModalAsset(assignment)}
                      leftIcon={<AlertCircle size={14} />}
                    >
                      Report
                    </Button>
                  </div>
                ) : (
                  <div className="h-8"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Acknowledge Modal */}
      <Modal
        isOpen={acknowledgeModalId !== null}
        onClose={() => setAcknowledgeModalId(null)}
        title="Acknowledge Asset Receipt"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            By acknowledging this asset, you confirm that:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-secondary text-sm">
            <li>You have received the asset in the condition stated</li>
            <li>You will handle the asset with care and responsibility</li>
            <li>You will report any damage or issues immediately</li>
            <li>
              You will return the asset when requested or upon leaving the
              company
            </li>
          </ul>

          <div className="p-3 bg-bg-secondary rounded-lg">
            <Checkbox
              id="agree"
              label="I agree to the terms and conditions above"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setAcknowledgeModalId(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                acknowledgeModalId && handleAcknowledge(acknowledgeModalId)
              }
            >
              Acknowledge Receipt
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Asset Modal */}
      <Modal
        isOpen={returnModalId !== null}
        onClose={() => {
          setReturnModalId(null);
          setReturnCondition("Good");
          setReturnNotes("");
        }}
        title="Return Asset"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Condition at Return *
            </label>
            <Select
              value={returnCondition}
              onChange={(value) => setReturnCondition(value as string)}
              options={[
                { value: "New", label: "New" },
                { value: "Good", label: "Good" },
                { value: "Used", label: "Used" },
                { value: "Damaged", label: "Damaged" },
              ]}
              className="bg-bg-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Notes (Optional)
            </label>
            <Textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="bg-bg-input"
              rows={3}
              placeholder="Any additional notes about the asset condition..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setReturnModalId(null);
                setReturnCondition("Good");
                setReturnNotes("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleReturn}>Process Return</Button>
          </div>
        </div>
      </Modal>

      {/* Report Incident Modal */}
      <Modal
        isOpen={reportModalAsset !== null}
        onClose={() => {
          setReportModalAsset(null);
          setIncidentType("Damage");
          setIncidentDescription("");
          setIncidentUrgency("Medium");
          setIncidentPhotos([]);
        }}
        title="Report Asset Issue"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              <strong>Asset:</strong> {reportModalAsset?.assetId?.name} (
              {reportModalAsset?.assetId?.assetCode})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Incident Type *
            </label>
            <Select
              value={incidentType}
              onChange={(value) => setIncidentType(value as string)}
              options={[
                { value: "Damage", label: "Damage" },
                { value: "Lost", label: "Lost" },
                { value: "Theft", label: "Theft" },
                { value: "Malfunction", label: "Malfunction" },
              ]}
              className="bg-bg-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Description *
            </label>
            <Textarea
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              className="bg-bg-input"
              rows={4}
              placeholder="Describe what happened in detail..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Urgency
            </label>
            <Select
              value={incidentUrgency}
              onChange={(value) => setIncidentUrgency(value as string)}
              options={[
                { value: "Low", label: "Low" },
                { value: "Medium", label: "Medium" },
                { value: "High", label: "High" },
                { value: "Critical", label: "Critical" },
              ]}
              className="bg-bg-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Upload Photos (Optional, max 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setIncidentPhotos(files.slice(0, 5));
              }}
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm"
            />
            {incidentPhotos.length > 0 && (
              <p className="text-xs text-text-secondary mt-1">
                {incidentPhotos.length} photo(s) selected
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setReportModalAsset(null);
                setIncidentType("Damage");
                setIncidentDescription("");
                setIncidentUrgency("Medium");
                setIncidentPhotos([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReportIncident}
              disabled={!incidentDescription.trim()}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
