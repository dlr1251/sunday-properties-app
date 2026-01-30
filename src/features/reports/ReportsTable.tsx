import React from 'react';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { reportsColumns, ReportRow } from './config/reportsTable';

export type ReportsTableProps = {
  data: ReportRow[];
  isLoading?: boolean;
  onView?: (row: ReportRow) => void;
  onResolve?: (row: ReportRow) => void;
};

export function ReportsTable(props: ReportsTableProps) {
  const { data, isLoading, onView, onResolve } = props;
  const actions: Array<RowAction<ReportRow>> = [
    onView ? { id: 'view', label: 'View', onClick: onView } : null,
    onResolve ? { id: 'resolve', label: 'Resolve', onClick: onResolve } : null,
  ].filter(Boolean) as Array<RowAction<ReportRow>>;

  return (
    <EntityTable<ReportRow>
      columns={reportsColumns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default ReportsTable;


