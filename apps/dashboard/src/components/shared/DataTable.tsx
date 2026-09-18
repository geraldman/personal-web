"use client";

import { TableRowSkeleton } from "./Skeletons";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleRow?: (id: string) => void;
  onToggleAll?: (checked: boolean) => void;
  loading?: boolean;
  skeletonRows?: number;
}

// Read-only mode (the /entries list) today. An editable-cell mode (needed for /import's
// review table) is the same shape — add an `editable` render variant per column when that
// route is built, don't fork a second table component.
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  onRowClick,
  selectable,
  selectedIds,
  onToggleRow,
  onToggleAll,
  loading,
  skeletonRows = 5,
}: DataTableProps<T>) {
  const allSelected = selectable && rows.length > 0 && rows.every((row) => selectedIds?.has(getRowId(row)));

  return (
    <div className="overflow-x-auto rounded-md border border-[var(--color-border)]">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[var(--color-text-secondary)]">
            {selectable && (
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) => onToggleAll?.(event.target.checked)}
                />
              </th>
            )}
            {columns.map((column) => (
              <th key={column.key} className="p-3 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: skeletonRows }).map((_, index) => (
                <TableRowSkeleton key={index} columns={columns.length + (selectable ? 1 : 0)} />
              ))
            : rows.map((row) => {
                const id = getRowId(row);
                return (
                  <tr
                    key={id}
                    className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-hover)]"
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="p-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(id) ?? false}
                          onChange={() => onToggleRow?.(id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={column.key} className="p-3 text-[var(--color-text-primary)]">
                        {column.render(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
