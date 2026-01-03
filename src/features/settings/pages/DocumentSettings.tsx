import React, { useState, useEffect } from "react";
import { Plus, Search, FileText, Trash2, Edit2 } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { DocumentTypeModal } from "../components/DocumentTypeModal";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";

export const DocumentSettings = () => {
  const [documentTypes, setDocumentTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllDocumentTypes();
      if (response.success) {
        setDocumentTypes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  const handleEdit = (docType: any) => {
    setSelectedDocType(docType);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this document type? This action cannot be undone."
      )
    ) {
      try {
        await apiService.deleteDocumentType(id);
        fetchDocumentTypes();
      } catch (error) {
        console.error("Failed to delete document type:", error);
        alert("Failed to delete document type");
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDocType(null);
  };

  const filteredDocs = documentTypes.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-text-primary">
            Document Management
          </h2>
          <p className="text-text-secondary text-sm">
            Configure the types of documents employees can upload
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          leftIcon={<Plus size={18} />}
        >
          Add Document Type
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 items-center bg-bg-card p-4 rounded-lg border border-border mb-6">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search document types..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            leftIcon={<Search size={18} />}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc._id}
              className="bg-bg-card border border-border rounded-xl p-5 hover:border-brand-primary/30 transition-all shadow-sm group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-brand-primary/10 text-brand-primary rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(doc)}
                    className="p-1.5 text-text-secondary hover:text-brand-primary hover:bg-bg-hover rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-text-primary text-lg mb-1">
                {doc.name}
              </h3>
              <p className="text-text-secondary text-sm mb-4 line-clamp-2 min-h-[40px]">
                {doc.description || "No description provided"}
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 bg-bg-main rounded-md text-text-secondary border border-border">
                  {doc.category}
                </span>
                {doc.isRequired && (
                  <span className="px-2.5 py-1 bg-status-error/10 text-status-error rounded-md border border-status-error/20 font-medium">
                    Required
                  </span>
                )}
                {doc.expiryRequired && (
                  <span className="px-2.5 py-1 bg-status-warning/10 text-status-warning rounded-md border border-status-warning/20 font-medium">
                    Expiry Tracking
                  </span>
                )}
              </div>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border rounded-xl">
              <div className="bg-bg-main p-4 rounded-full mb-3">
                <FileText size={32} className="text-text-muted" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-1">
                No document types found
              </h3>
              <p className="text-text-secondary max-w-sm mx-auto">
                Create a new document type to start managing employee documents.
              </p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <DocumentTypeModal
          isOpen={showModal}
          onClose={closeModal}
          onSuccess={fetchDocumentTypes}
          initialData={selectedDocType}
        />
      )}
    </div>
  );
};
