import { Upload, File, Download, Trash2 } from "lucide-react";

export default function DocumentRepository() {
  // Mock data
  const documents = [
    {
      id: 1,
      name: "Employment Contract - John Doe",
      type: "Contract",
      size: "2.4 MB",
      date: "2024-01-15",
      owner: "John Doe",
    },
    {
      id: 2,
      name: "ID Proof - Jane Smith",
      type: "ID",
      size: "1.1 MB",
      date: "2023-11-01",
      owner: "Jane Smith",
    },
    {
      id: 3,
      name: "Certification - React Advanced",
      type: "Certificate",
      size: "850 KB",
      date: "2024-03-10",
      owner: "Mike Johnson",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">
          Document Repository
        </h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors">
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-bg-card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
                <File size={24} />
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-bg-hover rounded transition-colors">
                  <Download size={16} />
                </button>
                <button className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <h3
              className="font-medium text-text-primary mb-1 truncate"
              title={doc.name}
            >
              {doc.name}
            </h3>

            <div className="space-y-1 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium">{doc.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="font-medium">{doc.owner}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span>{doc.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{doc.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
