import React from 'react';
import { useTranslation } from 'react-i18next';
import { UsersFilters } from './UsersFilters';
import { UsersTable } from './UsersTable';
import { UsersStats } from './UsersStats';
import { defaultUsersFilters, UsersFilterValues } from './config/usersFilters';
import { useUsersData, useUserRoleStats } from './hooks/useUsersData';
import CreateUserDialog from './dialogs/CreateUserDialog';
import ChangeRoleDialog from './dialogs/ChangeRoleDialog';
import DeleteUserDialog from './dialogs/DeleteUserDialog';
import UserDetailsDialog from './dialogs/UserDetailsDialog';

export function UsersPanel() {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<UsersFilterValues>(defaultUsersFilters);
  const [page] = React.useState(1);
  const [limit] = React.useState(20);

  const { users, isLoading, changeRole } = useUsersData({ page, limit, search: filters.search, role: filters.role });
  const { stats, isLoading: statsLoading } = useUserRoleStats();

  const [openCreate, setOpenCreate] = React.useState(false);
  const [openRole, setOpenRole] = React.useState<{ open: boolean; userId?: string } | null>(null);
  const [openDelete, setOpenDelete] = React.useState<{ open: boolean; userId?: string; email?: string } | null>(null);
  const [openDetails, setOpenDetails] = React.useState<{ open: boolean; user?: any } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.userManagement')}</h2>
        <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpenCreate(true)}>
          {t('common.newUser')}
        </button>
      </div>

      <UsersStats stats={stats as any} isLoading={statsLoading} />

      <UsersFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultUsersFilters)} />

      <UsersTable
        data={users as any}
        isLoading={isLoading}
        onView={(row) => setOpenDetails({ open: true, user: row })}
        onChangeRole={(row) => setOpenRole({ open: true, userId: row.id })}
        onDelete={(row) => setOpenDelete({ open: true, userId: row.id, email: row.email })}
      />

      <CreateUserDialog open={openCreate} onOpenChange={setOpenCreate} onSubmit={async () => { setOpenCreate(false); }} />

      <ChangeRoleDialog
        open={!!openRole?.open}
        onOpenChange={(open) => setOpenRole((s) => ({ open, userId: s?.userId }))}
        onSubmit={async (v) => {
          if (openRole?.userId) await changeRole(openRole.userId, v.role);
        }}
      />

      <DeleteUserDialog
        open={!!openDelete?.open}
        onOpenChange={(open) => setOpenDelete((s) => ({ open, userId: s?.userId, email: s?.email }))}
        email={openDelete?.email}
        onSubmit={async () => {
          // Implement actual delete user service if available
          setOpenDelete(null);
        }}
      />

      <UserDetailsDialog open={!!openDetails?.open} onOpenChange={(open) => setOpenDetails((s) => ({ open, user: s?.user }))} user={openDetails?.user} />
    </div>
  );
}

export default UsersPanel;
