import React from 'react';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { usersColumns, UserRow } from './config/usersTable';

export type UsersTableProps = {
  data: UserRow[];
  isLoading?: boolean;
  onView?: (row: UserRow) => void;
  onChangeRole?: (row: UserRow) => void;
  onDelete?: (row: UserRow) => void;
};

export function UsersTable(props: UsersTableProps) {
  const { data, isLoading, onView, onChangeRole, onDelete } = props;

  const actions: Array<RowAction<UserRow>> = [
    onView ? { id: 'view', label: 'View', onClick: onView } : null,
    onChangeRole ? { id: 'role', label: 'Change role', onClick: onChangeRole } : null,
    onDelete ? { id: 'delete', label: 'Delete', onClick: onDelete } : null,
  ].filter(Boolean) as Array<RowAction<UserRow>>;

  return (
    <EntityTable<UserRow>
      columns={usersColumns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default UsersTable;


