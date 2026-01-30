import React from 'react';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { verificationColumns, VerificationRow } from './config/verificationTable';

export type VerificationTableProps = {
  data: VerificationRow[];
  isLoading?: boolean;
  onView?: (row: VerificationRow) => void;
  onApprove?: (row: VerificationRow) => void;
};

export function VerificationTable(props: VerificationTableProps) {
  const { data, isLoading, onView, onApprove } = props;
  const actions: Array<RowAction<VerificationRow>> = [
    onView ? { id: 'view', label: 'View', onClick: onView } : null,
    onApprove ? { id: 'approve', label: 'Approve', onClick: onApprove } : null,
  ].filter(Boolean) as Array<RowAction<VerificationRow>>;

  return (
    <EntityTable<VerificationRow>
      columns={verificationColumns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default VerificationTable;

