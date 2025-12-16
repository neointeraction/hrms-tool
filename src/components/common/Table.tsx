import React, { useMemo, useState } from "react";
import { ArrowUpDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { Skeleton } from "./Skeleton";

// Maintaining existing interface for backward compatibility
export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  searchKey?: keyof T; // New prop for search-only accessor
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
  pageSize?: number;
}

export function Table<T extends { _id: string } | { id: string }>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found.",
  onRowClick,
  enableSearch = true,
  pageSize = 6,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper<T>();

  const tableColumns = useMemo(() => {
    return columns.map((col) => {
      const columnId =
        (col.accessorKey as string) || (col.searchKey as string) || col.header;

      return columnHelper.accessor(
        (row) => {
          if (col.accessorKey) return row[col.accessorKey];
          if (col.searchKey) return row[col.searchKey];
          return null;
        },
        {
          id: columnId,
          header: col.header,
          enableSorting: col.enableSorting ?? !!col.accessorKey,
          enableGlobalFilter: !!(col.accessorKey || col.searchKey), // Explicitly enable global filter if key exists
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
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="bg-bg-card rounded-lg border border-border overflow-hidden">
        {enableSearch && (
          <div className="p-4 border-b border-border">
            <Skeleton className="h-9 w-full max-w-sm rounded-lg" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-bg-main">
              <tr className="border-b border-border">
                {columns.map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-6 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
      <div className="overflow-x-auto">
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
                          desc: (
                            <ArrowUpDown size={14} className="opacity-100" />
                          ),
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
                    <td key={cell.id} className="px-6 py-3 text-text-primary">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-bg-main/50">
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-text-secondary">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <button
              className="p-1 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="text-sm text-text-muted">
            Showing {table.getRowModel().rows.length} rows
          </div>
        </div>
      )}
    </div>
  );
}
