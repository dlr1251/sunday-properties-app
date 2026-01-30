import React from 'react';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { visitsColumns, VisitRow } from './config/visitsTable';

export type VisitsTableProps = {
  data: VisitRow[];
  isLoading?: boolean;
  onView?: (row: VisitRow) => void;
};

export function VisitsTable(props: VisitsTableProps) {
  const { data, isLoading, onView } = props;
  const actions: Array<RowAction<VisitRow>> = [
    onView ? { id: 'view', label: 'View', onClick: onView } : null,
  ].filter(Boolean) as Array<RowAction<VisitRow>>;

  return (
    <EntityTable<VisitRow>
      columns={visitsColumns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default VisitsTable;
