import React from 'react';

export type TableColumn<T> = {
  id: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  field?: keyof T;
  width?: string | number;
  className?: string;
};

export type RowAction<T> = {
  id: string;
  label: string;
  onClick: (row: T) => void | Promise<void>;
  disabled?: (row: T) => boolean;
};

export type EntityTableProps<T> = {
  columns: Array<TableColumn<T>>;
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  rowKey: (row: T, index: number) => React.Key;
  rowActions?: Array<RowAction<T>>;
  className?: string;
};

export function EntityTable<T>(props: EntityTableProps<T>) {
  const { columns, data, isLoading, emptyState, rowKey, rowActions, className } = props;

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        <div className="border rounded-md">
          <div className="p-6 text-center text-sm text-muted-foreground">
            {emptyState ?? 'No records found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th key={col.id} className={`text-left font-medium px-3 py-2 ${col.className ?? ''}`} style={{ width: col.width }}>
                  {col.header}
                </th>
              ))}
              {rowActions && rowActions.length > 0 ? <th className="px-3 py-2" /> : null}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={rowKey(row, index)} className="border-t">
                {columns.map((col) => {
                  const value = col.accessor
                    ? col.accessor(row)
                    : col.field
                    ? // @ts-expect-error index by field for display
                      (row[col.field] as unknown as React.ReactNode)
                    : null;
                  return (
                    <td key={col.id} className={`px-3 py-2 align-top ${col.className ?? ''}`}>
                      {value}
                    </td>
                  );
                })}
                {rowActions && rowActions.length > 0 ? (
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {rowActions.map((action) => {
                        const disabled = action.disabled?.(row) ?? false;
                        return (
                          <button
                            key={action.id}
                            type="button"
                            onClick={() => action.onClick(row)}
                            disabled={disabled}
                            className="inline-flex items-center rounded-md border px-2 py-1 text-xs hover:bg-muted disabled:opacity-50"
                          >
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EntityTable;


