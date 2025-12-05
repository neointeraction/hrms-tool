import React from "react";
import { Loader2 } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { _id: string } | { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found.",
  onRowClick,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-brand-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-bg-main text-text-secondary text-xs uppercase font-semibold">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-6 py-4 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={(item as any)._id || (item as any).id}
                className={`hover:bg-bg-hover/50 transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col, index) => (
                  <td key={index} className="px-6 py-4">
                    {col.render
                      ? col.render(item)
                      : (item[col.accessorKey as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
