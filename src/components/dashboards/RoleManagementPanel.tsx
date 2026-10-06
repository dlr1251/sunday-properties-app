import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  Search,
  Download,
  RefreshCw,
  Edit,
  Eye,
  Users,
  Shield,
  CheckCircle,
  User,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { useRoleManagement } from '../../hooks/useRoleManagement';
import { getRoleLabel, getAvailableRoles, getRoleBadgeColor, getRoleIcon, getVerificationStatusIcon } from '../../utils/userRoles';
import { toast } from 'sonner';
import { RoleStatsCards } from './RoleManagementPanel/RoleStatsCards';
import { RoleFilters } from './RoleManagementPanel/RoleFilters';
import { UsersTable } from './RoleManagementPanel/UsersTable';
import { RoleDialog } from './RoleManagementPanel/RoleDialog';
import { BulkRoleDialog } from './RoleManagementPanel/BulkRoleDialog';

interface RoleManagementPanelProps {
  onViewUserDetails?: (userId: string) => void;
}

export function RoleManagementPanel({
  onViewUserDetails }: RoleManagementPanelProps) {
    const { t } = useTranslation();
  const {
    users,
    loading,
    error,
    totalCount,
    stats,
    fetchUsers,
    updateUserRole,
    bulkUpdateRoles,
    getRoleStats,
    exportUsers
  } = useRoleManagement();

  const [filters, setFilters] = useState({
    search: '',
    role: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [bulkNewRole, setBulkNewRole] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers(1, 20, filters.search, filters.role);
    getRoleStats();
  }, [filters]);

  const handleRoleUpdate = async () => {
    if (!selectedUserId || !newRole) return;

    setActionLoading(selectedUserId);
    const result = await updateUserRole(selectedUserId, newRole as any);
    if (result.success) {
      setShowRoleDialog(false);
      setNewRole('');
      setSelectedUserId(null);
    }
    setActionLoading(null);
  };

  const handleBulkRoleUpdate = async () => {
    if (selectedUsers.length === 0 || !bulkNewRole) return;

    const result = await bulkUpdateRoles(selectedUsers, bulkNewRole as any);
    if (result.success) {
      setSelectedUsers([]);
      setShowBulkRoleDialog(false);
      setBulkNewRole('');
    }
  };

  // helpers moved to utils/userRoles.ts

  const availableRoles = getAvailableRoles();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('admin.roleManagement')}</h2>
          <p className="text-muted-foreground">
            {t('admin.roleManagementDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            fetchUsers(1, 20, filters.search, filters.role);
            getRoleStats();
          }} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            {t('admin.exportCsv')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <RoleStatsCards stats={stats} />}

      {/* Role Distribution */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.roleDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">{t('admin.roleUsers')}</span>
                </div>
                <p className="text-2xl font-bold">
                  {stats.total_users - stats.super_admins - stats.admins - stats.agents}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{t('admin.roleAgents')}</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.agents}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">{t('admin.roleAdmins')}</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{stats.admins}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">{t('admin.superAdmins')}</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.super_admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {t('admin.selectedUsers', { count: selectedUsers.length })}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUsers([])}>
                  {t('admin.clearSelection')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowBulkRoleDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('admin.changeRoleBulkAction')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <RoleFilters filters={filters} setFilters={(updater: any) => setFilters(typeof updater === 'function' ? updater : updater)} />
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users')} ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-600">{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('admin.noUsersFound')}</p>
            </div>
          ) : (
            <UsersTable
              users={users as any}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers as any}
              onViewUserDetails={onViewUserDetails}
              onEditRole={(userId, role) => { setSelectedUserId(userId); setNewRole(role); setShowRoleDialog(true); }}
            />
          )}
        </CardContent>
      </Card>

      {/* Role Update Dialog */}
      <RoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        currentRoleLabel={selectedUserId ? getRoleLabel(users.find(u => u.id === selectedUserId)?.role || '') : ''}
        newRole={newRole}
        setNewRole={setNewRole}
        onConfirm={handleRoleUpdate}
        confirming={actionLoading === selectedUserId}
      />

      {/* Bulk Role Update Dialog */}
      <BulkRoleDialog
        open={showBulkRoleDialog}
        onOpenChange={setShowBulkRoleDialog}
        count={selectedUsers.length}
        newRole={bulkNewRole}
        setNewRole={setBulkNewRole}
        onConfirm={handleBulkRoleUpdate}
      />
    </div>
  );
}

export default RoleManagementPanel;
