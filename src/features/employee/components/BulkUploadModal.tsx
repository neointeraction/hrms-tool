import React, { useState, useEffect, useRef } from "react";
import { Modal } from "../../../components/common/Modal";
import { apiService } from "../../../services/api.service";
import { Select } from "../../../components/common/Select";
import { Button } from "../../../components/common/Button";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkUploadModal = ({ isOpen, onClose }: BulkUploadModalProps) => {
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<
    Record<
      string,
      {
        status: "pending" | "uploading" | "success" | "error";
        message?: string;
        employeeId?: string;
        employeeName?: string;
      }
    >
  >({});
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    } else {
      // Reset state on close
      setFiles([]);
      setFileStatuses({});
      setSelectedDocTypeId("");
      setExpiryDate("");
      setIsUploading(false);
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoadingConfig(true);
    try {
      const [typesRes, empsRes] = await Promise.all([
        apiService.getAllDocumentTypes(),
        apiService.getEmployees(),
      ]);
      if (typesRes.success) setDocTypes(typesRes.data);
      // Data might be array directly or in .data depending on endpoints.
      // apiService.getEmployees() returns array or {data: []}?
      // Checked controller: res.json(employeesWithStatus) -> Array.
      // Checked apiService: returns response.json() -> Array.
      setEmployees(
        Array.isArray(empsRes) ? empsRes : (empsRes as any).data || []
      );
    } catch (err) {
      console.error("Failed to load config", err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      processFiles(newFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    const newStatuses = { ...fileStatuses };

    newFiles.forEach((file) => {
      // Parse filename: [EmployeeID].pdf or [EmployeeID]_*
      const nameWithoutExt = file.name.split(".")[0];
      // Try to match entire name first, then split by underscore
      let empIdToMatch = nameWithoutExt;
      if (nameWithoutExt.includes("_")) {
        empIdToMatch = nameWithoutExt.split("_")[0];
      } else if (nameWithoutExt.includes("-")) {
        empIdToMatch = nameWithoutExt.split("-")[0];
      }

      const employee = employees.find((e) => e.employeeId === empIdToMatch);

      if (employee) {
        newStatuses[file.name] = {
          status: "pending",
          employeeId: employee._id, // We need internal _id for upload
          employeeName: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        };
      } else {
        newStatuses[file.name] = {
          status: "error",
          message: `Employee ID '${empIdToMatch}' not found`,
        };
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
    setFileStatuses(newStatuses);
  };

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    const newStat = { ...fileStatuses };
    delete newStat[fileName];
    setFileStatuses(newStat);
  };

  const handleUpload = async () => {
    if (!selectedDocTypeId) return;

    setIsUploading(true);

    // Process only pending files
    const pendingFiles = files.filter(
      (f) => fileStatuses[f.name]?.status === "pending"
    );

    for (const file of pendingFiles) {
      const metadata = fileStatuses[file.name];
      if (!metadata || !metadata.employeeId) continue;

      // Update status to uploading
      setFileStatuses((prev) => ({
        ...prev,
        [file.name]: { ...prev[file.name], status: "uploading" },
      }));

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("employeeId", metadata.employeeId);
        formData.append("documentTypeId", selectedDocTypeId);
        if (expiryDate) formData.append("expiryDate", expiryDate);

        await apiService.uploadEmployeeDocument(formData);

        setFileStatuses((prev) => ({
          ...prev,
          [file.name]: { ...prev[file.name], status: "success" },
        }));
      } catch (err: any) {
        setFileStatuses((prev) => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            status: "error",
            message: err.message || "Upload failed",
          },
        }));
      }
    }

    setIsUploading(false);
  };

  const selectedDocType = docTypes.find((d) => d._id === selectedDocTypeId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isUploading ? onClose : () => {}}
      title="Bulk Document Upload"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 min-h-[400px]">
        {loadingConfig ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Document Type"
                value={selectedDocTypeId}
                onChange={(val) => setSelectedDocTypeId(val as string)}
                options={docTypes.map((d) => ({ value: d._id, label: d.name }))}
                disabled={isUploading || files.length > 0} // Disable change if files added to avoid confusion? No, allow change freely before upload.
              />

              {selectedDocType?.expiryRequired && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    Default Expiry
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    Applied to all uploaded documents
                  </p>
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-bg-hover transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={!selectedDocTypeId || isUploading}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-brand-primary/10 rounded-full text-brand-primary">
                  <Upload size={24} />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary">
                    Click to upload or drag and drop
                  </h3>
                  <p className="text-sm text-text-secondary">
                    Supported: PDF, JPG, PNG. Filenames must start with Employee
                    ID (e.g., EMP001_Offer.pdf)
                  </p>
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedDocTypeId || isUploading}
                >
                  Select Files
                </Button>
              </div>
            </div>

            {files.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-bg-hover px-4 py-2 border-b border-border text-sm font-medium text-text-secondary flex justify-between">
                  <span>Selected Files ({files.length})</span>
                  <span className="text-xs">
                    Ready:{" "}
                    {
                      files.filter(
                        (f) => fileStatuses[f.name]?.status === "pending"
                      ).length
                    }{" "}
                    | Success:{" "}
                    {
                      files.filter(
                        (f) => fileStatuses[f.name]?.status === "success"
                      ).length
                    }{" "}
                    | Error:{" "}
                    {
                      files.filter(
                        (f) => fileStatuses[f.name]?.status === "error"
                      ).length
                    }
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-border">
                  {files.map((file, idx) => {
                    const status = fileStatuses[file.name];
                    return (
                      <div
                        key={idx}
                        className="px-4 py-3 flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-text-muted" />
                          <div>
                            <p
                              className="font-medium text-text-primary truncate max-w-xs"
                              title={file.name}
                            >
                              {file.name}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {status?.employeeName ||
                                status?.message ||
                                "Processing..."}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {status?.status === "pending" && (
                            <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium">
                              Ready
                            </span>
                          )}
                          {status?.status === "uploading" && (
                            <Loader2
                              size={16}
                              className="text-brand-primary animate-spin"
                            />
                          )}
                          {status?.status === "success" && (
                            <CheckCircle size={16} className="text-green-500" />
                          )}
                          {status?.status === "error" && (
                            <AlertCircle size={16} className="text-red-500" />
                          )}

                          {!isUploading && status?.status !== "success" && (
                            <button
                              onClick={() => removeFile(file.name)}
                              className="text-text-secondary hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-border gap-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isUploading}
              >
                Close
              </Button>
              <Button
                onClick={handleUpload}
                disabled={
                  isUploading ||
                  files.filter(
                    (f) => fileStatuses[f.name]?.status === "pending"
                  ).length === 0
                }
                isLoading={isUploading}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${
                      files.filter(
                        (f) => fileStatuses[f.name]?.status === "pending"
                      ).length
                    } Files`}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
