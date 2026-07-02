import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export interface DataTableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  total?: number;
  actions?: (row: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  headerSlot?: React.ReactNode;
}

function SkeletonRows({ columns, rows = 6 }: { columns: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: columns }).map((_, j) => (
            <TableCell key={j}>
              <Skeleton className="h-4 w-full max-w-[180px] rounded" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  isLoading = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  page = 1,
  totalPages = 1,
  onPageChange,
  total,
  actions,
  emptyTitle = "No records found",
  emptyDescription = "There are no records to display at this time.",
  headerSlot,
}: DataTableProps<T>) {
  const allColumns = actions
    ? [...columns, { header: "Actions", accessor: "_actions" as keyof T }]
    : columns;

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onSearchChange && (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 bg-white border-slate-200 focus:ring-1 focus:ring-[#0F2942]"
            />
          </div>
        )}
        {headerSlot && <div className="flex items-center gap-2">{headerSlot}</div>}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
              {columns.map((col) => (
                <TableHead
                  key={typeof col.header === "string" ? col.header : String(col.accessor)}
                  className={`text-xs font-bold text-slate-500 uppercase tracking-wider py-3 ${col.className ?? ""}`}
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider py-3 text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows columns={allColumns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="h-10 w-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">{emptyTitle}</p>
                    <p className="text-xs text-slate-400 max-w-xs">{emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow
                  key={(row as any).id ?? rowIdx}
                  className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <TableCell
                      key={typeof col.header === "string" ? col.header : String(col.accessor)}
                      className={`py-3 text-sm text-slate-700 ${col.className ?? ""}`}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </TableCell>
                  ))}
                  {actions && <TableCell className="py-3 text-right">{actions(row)}</TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{total !== undefined ? `${total} total record${total !== 1 ? "s" : ""}` : ""}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
