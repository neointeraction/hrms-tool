import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { apiService } from "../../services/api.service";

export default function QAConfig() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [currentPolicy, setCurrentPolicy] = useState<{
    originalName: string;
    updatedAt: string;
    uploadedBy: { name: string };
  } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiService.getPolicyStatus();
      if (data.hasPolicy) {
        setCurrentPolicy(data.policy);
      }
    } catch (err) {
      console.error("Failed to fetch policy status", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setMessage({ type: "error", text: "Only PDF files are allowed" });
        return;
      }
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setMessage(null);

    try {
      await apiService.uploadPolicy(file);
      setMessage({ type: "success", text: "Policy uploaded successfully!" });
      setFile(null);
      fetchStatus();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Upload failed" });
    } finally {
      setLoading(false);
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
            Upload Leave Policy for AI Reference
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Policy Status */}
        <div className="bg-bg-main rounded-lg p-4 border border-border">
          <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">
            Current Policy Document
          </h3>
          {currentPolicy ? (
            <div className="flex items-start gap-3">
              <CheckCircle
                className="text-status-success shrink-0 mt-0.5"
                size={18}
              />
              <div>
                <p className="font-medium text-text-primary">
                  {currentPolicy.originalName}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Uploaded by {currentPolicy.uploadedBy?.name} on{" "}
                  {new Date(currentPolicy.updatedAt).toLocaleDateString()}
                </p>
                <div className="mt-2 text-xs bg-status-success/10 text-status-success inline-block px-2 py-1 rounded-full">
                  Active
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-text-muted italic">
              <AlertCircle size={16} />
              <p>No active policy document found.</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary">
            Upload New Policy (PDF Only)
          </label>
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <input
                type="file"
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
                Uploading a new document will replace the existing one.
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
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
