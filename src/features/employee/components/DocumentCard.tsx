import React from "react";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
} from "lucide-react";
import { ASSET_BASE_URL } from "../../../services/api.service";

interface DocumentCardProps {
  docType: any;
  document?: any;
  onUpload: (docTypeId: string) => void;
  onView: (document: any) => void;
  readOnly?: boolean;
  isMandatory?: boolean;
}

export const DocumentCard = ({
  docType,
  document,
  onUpload,
  onView,
  readOnly = false,
  isMandatory = false,
}: DocumentCardProps) => {
  const isUploaded = !!document;
  const isExpired =
    isUploaded &&
    document.expiryDate &&
    new Date(document.expiryDate) < new Date();
  const isExpiringSoon =
    isUploaded &&
    !isExpired &&
    document.expiryDate &&
    new Date(document.expiryDate) <
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const getStatusColor = () => {
    if (!isUploaded)
      return isMandatory
        ? "bg-red-50 border-red-200"
        : "bg-gray-50 border-gray-200";
    if (isExpired) return "bg-red-50 border-red-200";
    if (isExpiringSoon) return "bg-amber-50 border-amber-200";
    return "bg-green-50 border-green-200";
  };

  const getStatusIcon = () => {
    if (!isUploaded)
      return (
        <AlertCircle
          size={16}
          className={isMandatory ? "text-red-500" : "text-gray-400"}
        />
      );
    if (isExpired) return <AlertCircle size={16} className="text-red-500" />;
    if (isExpiringSoon) return <Clock size={16} className="text-amber-500" />;
    return <CheckCircle size={16} className="text-green-500" />;
  };

  const getStatusText = () => {
    if (!isUploaded) return isMandatory ? "Missing" : "Not Uploaded";
    if (isExpired) return "Expired";
    if (isExpiringSoon) return "Expiring Soon";
    return "Valid";
  };

  const getDocumentUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return `${ASSET_BASE_URL}/${path}`;
  };

  return (
    <div
      className={`border rounded-xl p-3 transition-all hover:shadow-sm ${getStatusColor()}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg bg-white/60`}>
            <FileText size={18} className="text-text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-text-primary">
              {docType.name}
            </h4>
            <div className="flex items-center gap-1 text-[10px] mt-0.5">
              {getStatusIcon()}
              <span className="font-medium text-text-secondary uppercase tracking-tight">
                {getStatusText()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {isUploaded && (
          <div className="text-[10px] text-text-secondary pl-1">
            <p>
              Uploaded:{" "}
              {new Date(
                document.versions[document.versions.length - 1].uploadedAt
              ).toLocaleDateString()}
            </p>
            {document.expiryDate && (
              <p className={isExpired ? "text-red-600 font-medium" : ""}>
                Expires: {new Date(document.expiryDate).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="pt-1 flex gap-2">
          {isUploaded ? (
            <>
              <button
                type="button"
                onClick={() => onView(document)}
                className="flex-1 py-1 px-2 bg-white border border-border rounded text-xs text-text-primary hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                View
              </button>
              <button
                type="button"
                onClick={() =>
                  window.open(
                    getDocumentUrl(
                      document.versions[document.versions.length - 1].fileUrl
                    ),
                    "_blank"
                  )
                }
                className="flex-none py-1 px-2 bg-white border border-border rounded text-xs text-text-primary hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center"
                title="Download"
              >
                <Download size={14} />
              </button>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onUpload(docType._id)}
                  className="flex-1 py-1 px-2 bg-white border border-border rounded text-xs text-text-primary hover:bg-gray-50 transition-colors font-medium shadow-sm"
                >
                  Update
                </button>
              )}
            </>
          ) : (
            !readOnly && (
              <button
                type="button"
                onClick={() => onUpload(docType._id)}
                className="w-full py-1.5 px-3 bg-white border border-border rounded-lg text-xs text-brand-primary hover:bg-brand-primary/5 transition-colors font-medium shadow-sm flex items-center justify-center gap-2"
              >
                <Upload size={14} />
                Upload Document
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
