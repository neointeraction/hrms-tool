import React, { useEffect, useState } from "react";
import { apiService } from "../../../services/api.service";
import { DocumentCard } from "./DocumentCard";
import { Modal } from "../../../components/common/Modal";
import { FileText, Download, CheckCircle } from "lucide-react";
import { ASSET_BASE_URL } from "../../../services/api.service";

interface DocumentsTabProps {
  employeeId: string;
  readOnly?: boolean;
  roleName?: string;
}

export const DocumentsTab = ({
  employeeId,
  readOnly = false,
  roleName,
}: DocumentsTabProps) => {
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [mandatoryDocIds, setMandatoryDocIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocTypeId, setSelectedDocTypeId] = useState<string | null>(
    null
  );

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDocument, setViewDocument] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises: any[] = [
        apiService.getAllDocumentTypes(),
        apiService.getEmployeeDocuments(employeeId),
      ];

      // If roleName provided, fetch roles to find mandatory
      if (roleName) {
        promises.push(apiService.getRoles());
      }

      const [typesRes, docsRes, rolesRes] = await Promise.all(promises);

      if (typesRes.success) setDocTypes(typesRes.data);
      if (docsRes.success) setDocuments(docsRes.data);

      if (roleName && rolesRes) {
        const rolesList = Array.isArray(rolesRes) ? rolesRes : rolesRes.data;
        const role = rolesList?.find((r: any) => r.name === roleName);
        if (role && role.mandatoryDocuments) {
          setMandatoryDocIds(role.mandatoryDocuments);
        }
      }
    } catch (err: any) {
      setError("Failed to load documents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchData();
    }
  }, [employeeId, roleName]);

  const handleUploadClick = (docTypeId: string) => {
    setSelectedDocTypeId(docTypeId);
    setUploadModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    fetchData(); // Refresh list
  };

  const handleViewClick = (doc: any) => {
    setViewDocument(doc);
    setViewModalOpen(true);
  };

  const getDocumentUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${ASSET_BASE_URL}/${path}`;
  };

  // Group docs by category? Or just list?
  // User req: "Display documents in a dedicated tab... visual status"
  // Let's group by Category for better UX.
  const categorizedDocs = docTypes.reduce((acc, type) => {
    const category = type.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        (Object.entries(categorizedDocs) as [string, any[]][]).map(
          ([category, types]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {types.map((type) => {
                  const doc = documents.find(
                    (d) =>
                      d.documentTypeId._id === type._id ||
                      d.documentTypeId === type._id
                  );
                  // Check if mandatory: either global or role-based
                  const isMandatory =
                    type.isRequired ||
                    mandatoryDocIds.some(
                      (id) =>
                        id === type._id ||
                        (typeof id === "object" && (id as any)._id === type._id)
                    );

                  return (
                    <DocumentCard
                      key={type._id}
                      docType={type}
                      document={doc}
                      onUpload={handleUploadClick}
                      onView={handleViewClick}
                      readOnly={readOnly}
                      isMandatory={isMandatory}
                    />
                  );
                })}
              </div>
            </div>
          )
        )
      )}

      {/* Upload Modal - We'll use a specific one or generic? 
          We need inputs for Expiry Date (if required) and File.
          Let's assume we create a wrapper or use generic. 
          For now I'll create a dedicated DocumentUploadModal for simplicity 
          or just assume UploadModal is generic enough (it usually isn't).
          I'll create a DocumentUploadModal component inline or separate.
          Let's use a new component `DocumentUploadModal`.
      */}
      {uploadModalOpen && selectedDocTypeId && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
          employeeId={employeeId}
          docTypeId={selectedDocTypeId}
          docType={docTypes.find((d) => d._id === selectedDocTypeId)}
        />
      )}

      {/* View/History Modal */}
      {viewModalOpen && viewDocument && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={viewDocument.documentTypeId.name || "Document Details"}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            <div className="flex gap-4 h-[60vh]">
              <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden border border-border flex items-center justify-center">
                {/* Viewer */}
                {viewDocument.versions[
                  viewDocument.versions.length - 1
                ].mimeType?.includes("image") ? (
                  <img
                    src={getDocumentUrl(
                      viewDocument.versions[viewDocument.versions.length - 1]
                        .fileUrl
                    )}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : viewDocument.versions[viewDocument.versions.length - 1]
                    .mimeType === "application/pdf" ? (
                  <iframe
                    src={getDocumentUrl(
                      viewDocument.versions[viewDocument.versions.length - 1]
                        .fileUrl
                    )}
                    className="w-full h-full min-h-[70vh]"
                    title="Document Preview"
                  />
                ) : (
                  <div className="text-center p-4">
                    <FileText
                      size={48}
                      className="mx-auto text-text-muted mb-2"
                    />
                    <p className="text-text-secondary mb-4">
                      Preview not available for this file type.
                    </p>
                    <a
                      href={getDocumentUrl(
                        viewDocument.versions[viewDocument.versions.length - 1]
                          .fileUrl
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-brand-primary text-white rounded-lg inline-flex items-center gap-2"
                    >
                      <Download size={16} /> Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// -- Inline Upload Modal Component for simplicity across files --
const DocumentUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  employeeId,
  docTypeId,
  docType,
}: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("employeeId", employeeId);
      formData.append("documentTypeId", docTypeId);
      if (expiryDate) formData.append("expiryDate", expiryDate);

      // console.log("Uploading document...");
      await apiService.uploadEmployeeDocument(formData);
      // console.log("Upload success");
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        setIsSuccess(false); // Reset for next time (though unmounted usually)
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSuccess ? () => {} : onClose}
      title={`Upload ${docType?.name || "Document"}`}
    >
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-xl font-semibold text-text-primary mb-2">
            Upload Successful!
          </h3>
          <p className="text-text-secondary">
            The document has been uploaded securely.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
              accept={docType?.allowedFileTypes?.join(",")}
              required
            />
            <p className="text-xs text-text-muted mt-1">
              Max size:{" "}
              {docType?.maxFileSize
                ? Math.round(docType.maxFileSize / 1024 / 1024)
                : 5}
              MB
            </p>
          </div>

          {docType?.expiryRequired ? (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-text-secondary hover:bg-gray-50 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
