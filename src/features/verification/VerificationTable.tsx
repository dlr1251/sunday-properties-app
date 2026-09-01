import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { verificationColumns, VerificationRow } from './config/verificationTable';

export type VerificationTableProps = {
  data: VerificationRow[];
  isLoading?: boolean;
  onView?: (row: VerificationRow) => void;
  onApprove?: (row: VerificationRow) => void;
};

const headerKeys: Record<string, string> = {
  name: 'admin.name',
  email: 'profile.email',
  document_type: 'admin.documentType',
  status: 'properties.status',
  created: 'common.created',
};

export function VerificationTable(props: VerificationTableProps) {
  const { t } = useTranslation();
  const { data, isLoading, onView, onApprove } = props;
  const columns = verificationColumns.map((col) => ({
    ...col,
    header: t(headerKeys[col.id] ?? col.id),
  }));
  const actions: Array<RowAction<VerificationRow>> = [
    onView ? { id: 'view', label: t('common.view'), onClick: onView } : null,
    onApprove ? { id: 'approve', label: t('common.approve'), onClick: onApprove } : null,
  ].filter(Boolean) as Array<RowAction<VerificationRow>>;

  return (
    <EntityTable<VerificationRow>
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default VerificationTable;
