import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import { apiService } from "../../services/api.service";

export default function QAConfig() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentPolicies, setCurrentPolicies] = useState<any[]>([]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getPolicyStatus();
      if (data.policies) {
        setCurrentPolicies(data.policies);
      }
    } catch (err) {
      console.error("Failed to fetch policy status", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Validate all files are PDF
      const selectedFiles = e.target.files;
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].type !== "application/pdf") {
          setMessage({
            type: "error",
            text: "Only PDF files are allowed",
          });
          return;
        }
      }
      setFiles(selectedFiles);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setMessage(null);

    try {
      await apiService.uploadPolicy(files);
      setMessage({ type: "success", text: "Policies uploaded successfully!" });
      setFiles(null);
      // Reset input value by ID or just refetch.
      // Easiest is to force re-render or just clear file state which disconnects from uncontrolled input visually?
      // Actually controlled input for file is tricky. Better to reset form ref if needed.
      // For now, fetch status is key.
      fetchStatus();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this document?"))
      return;
    try {
      await apiService.deletePolicy(id);
      fetchStatus();
      setMessage({ type: "success", text: "Document removed successfully" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Failed to delete document",
      });
    }
  };

  return (
    <div className="bg-bg-card rounded-xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            AI Chatbot Configuration
          </h2>
          <p className="text-text-secondary text-sm">
            Manage Knowledge Base Documents
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Policies List */}
        <div className="bg-bg-main rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
            Active Documents ({currentPolicies.length})
          </h3>

          {currentPolicies.length > 0 ? (
            <div className="space-y-3">
              {currentPolicies.map((policy) => (
                <div
                  key={policy._id}
                  className="flex items-center justify-between bg-bg-card p-3 rounded-lg border border-border"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      className="text-status-success shrink-0 mt-0.5"
                      size={18}
                    />
                    <div>
                      <p className="font-medium text-text-primary">
                        {policy.originalName}
                      </p>
                      <p className="text-xs text-text-muted mt-1">
                        Uploaded by {policy.uploadedBy?.name} on{" "}
                        {new Date(policy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(policy._id)}
                    className="p-2 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors"
                    title="Remove Document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-muted italic">
              <AlertCircle size={16} />
              <p>No active documents found.</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            Upload New Documents (PDF Only)
          </label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full text-sm text-text-secondary
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-brand-primary/10 file:text-brand-primary
                  hover:file:bg-brand-primary/20
                  cursor-pointer bg-bg-main rounded-lg border border-border"
              />
              <p className="text-xs text-text-muted mt-2">
                You can upload multiple documents. New uploads will be added to
                the knowledge base.
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={!files || loading}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Upload size={18} />
              )}
              Upload
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.type === "success"
                ? "bg-status-success/10 text-status-success"
                : "bg-status-error/10 text-status-error"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
