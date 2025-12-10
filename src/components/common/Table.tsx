import React, { useMemo, useState } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Loader } from "./Loader";

// Maintaining existing interface for backward compatibility
export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  render?: (item: T) => React.ReactNode;
  className?: string;
  enableSorting?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  enableSearch?: boolean; // New prop to optionally disable search
}

export function Table<T extends { _id: string } | { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found.",
  onRowClick,
  enableSearch = true,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper<T>();

  const tableColumns = useMemo(() => {
    return columns.map((col) => {
      const columnId = (col.accessorKey as string) || col.header;

      return columnHelper.accessor(
        (row) => {
          if (col.accessorKey) return row[col.accessorKey];
          return null;
        },
        {
          id: columnId,
          header: col.header,
          enableSorting: col.enableSorting ?? !!col.accessorKey,
          cell: (info) => {
            if (col.render) {
              return col.render(info.row.original);
            }
            return info.getValue() as React.ReactNode;
          },
        }
      );
    });
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader size={32} />
      </div>
    );
  }

  return (
    <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
      {enableSearch && (
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
            />
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/20 bg-bg-main text-text-primary placeholder:text-text-muted transition-all"
            />
          </div>
        </div>
      )}
      <table className="w-full text-left border-collapse">
        <thead className="bg-bg-main text-text-secondary text-xs uppercase font-semibold">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const originalCol = columns.find(
                  (c) =>
                    (c.accessorKey as string) === header.id ||
                    c.header === header.id
                );

                return (
                  <th
                    key={header.id}
                    className={`px-6 py-4 cursor-pointer select-none group ${
                      originalCol?.className || ""
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: (
                          <ArrowUpDown
                            size={14}
                            className="opacity-100 rotate-180"
                          />
                        ),
                        desc: <ArrowUpDown size={14} className="opacity-100" />,
                      }[header.column.getIsSorted() as string] ??
                        (header.column.getCanSort() && (
                          <ArrowUpDown
                            size={14}
                            className="opacity-0 group-hover:opacity-50 transition-opacity"
                          />
                        ))}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border">
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={`hover:bg-bg-hover transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick && onRowClick(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-text-primary">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
