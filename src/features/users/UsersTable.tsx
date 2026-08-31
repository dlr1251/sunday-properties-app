import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { usersColumns, UserRow } from './config/usersTable';

export type UsersTableProps = {
  data: UserRow[];
  isLoading?: boolean;
  onView?: (row: UserRow) => void;
  onChangeRole?: (row: UserRow) => void;
  onDelete?: (row: UserRow) => void;
};

const headerKeys: Record<string, string> = {
  name: 'admin.name',
  email: 'profile.email',
  role: 'profile.role',
  verification: 'admin.verificationStatus',
  properties: 'admin.properties',
  reports: 'admin.reports',
  visits: 'visits.title',
  offers: 'negotiations.offer.title',
};

export function UsersTable(props: UsersTableProps) {
  const { t } = useTranslation();
  const { data, isLoading, onView, onChangeRole, onDelete } = props;

  const columns = usersColumns.map((col) => ({
    ...col,
    header: t(headerKeys[col.id] ?? col.id),
  }));

  const actions: Array<RowAction<UserRow>> = [
    onView ? { id: 'view', label: t('common.view'), onClick: onView } : null,
    onChangeRole ? { id: 'role', label: t('admin.changeRoleAction'), onClick: onChangeRole } : null,
    onDelete ? { id: 'delete', label: t('common.delete'), onClick: onDelete } : null,
  ].filter(Boolean) as Array<RowAction<UserRow>>;

  return (
    <EntityTable<UserRow>
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default UsersTable;
