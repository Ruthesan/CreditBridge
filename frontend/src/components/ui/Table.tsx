import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

export function Table<T>({
  columns,
  rows,
  keyField,
  onSort,
  sortKey,
  sortDir,
  emptyMessage = 'No data yet.',
}: {
  columns: Column<T>[];
  rows: T[];
  keyField: (row: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  emptyMessage?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-line bg-surface/60">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-secondary',
                  col.sortable && 'cursor-pointer select-none hover:text-ink',
                  col.className
                )}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortKey === col.key && <span>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={keyField(row)} className="border-b border-line last:border-0 hover:bg-surface/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-4 align-middle', col.className)}>
                    {col.render(row)}
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
