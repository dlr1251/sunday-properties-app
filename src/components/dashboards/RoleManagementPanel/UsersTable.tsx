import { useTranslation } from 'react-i18next';
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Eye, Edit } from 'lucide-react';
import { getRoleBadgeColor, getRoleIcon, getVerificationStatusIcon, getRoleLabel } from '../../../utils/userRoles';
import { formatDate } from '../../../utils/format';

interface UserRowData {
  id: string;
  name: string;
  email: string;
  role: string;
  verification_status: string;
  properties_count?: number;
  visits_count?: number;
  offers_count?: number;
  created_at: string;
  last_sign_in_at: string | null;
}

interface Props {
  users: UserRowData[];
  selectedUsers: string[];
  setSelectedUsers: (updater: (prev: string[]) => string[]) => void | ((ids: string[]) => void);
  onViewUserDetails?: (userId: string) => void;
  onEditRole: (userId: string, currentRole: string) => void;
}

export const UsersTable: React.FC<Props> = ({
  users, selectedUsers, setSelectedUsers, onViewUserDetails, onEditRole }) => {
    const { t } = useTranslation();
  const allSelected = selectedUsers.length === users.length && users.length > 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedUsers(users.map(u => u.id));
                } else {
                  setSelectedUsers([]);
                }
              }}
            />
          </TableHead>
          <TableHead>{t('admin.userColumn')}</TableHead>
          <TableHead>{t('admin.currentRole')}</TableHead>
          <TableHead>{t('admin.verificationStatus')}</TableHead>
          <TableHead>{t('admin.activity')}</TableHead>
          <TableHead>{t('admin.registered')}</TableHead>
          <TableHead className="text-right">{t('common.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedUsers(prev => Array.isArray(prev) ? [...prev, user.id] : [user.id]);
                  } else {
                    setSelectedUsers(prev => Array.isArray(prev) ? prev.filter(id => id !== user.id) : []);
                  }
                }}
              />
            </TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={`${getRoleBadgeColor(user.role)} flex items-center gap-1 w-fit`}>
                {getRoleIcon(user.role)}
                {getRoleLabel(user.role)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getVerificationStatusIcon(user.verification_status)}
                <span className="text-sm">
                  {user.verification_status === 'verified' ? t('admin.status.verified') :
                   user.verification_status === 'pending' ? t('admin.status.pending') :
                   user.verification_status === 'rejected' ? t('admin.rejected') : t('admin.status.unverified')}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm space-y-1">
                <p>{t('admin.propertiesColon', { count: user.properties_count || 0 })}</p>
                <p>{t('admin.visitsColon', { count: user.visits_count || 0 })}</p>
                <p>{t('admin.offersColon', { count: user.offers_count || 0 })}</p>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <p>{formatDate(user.created_at)}</p>
              {user.last_sign_in_at && (
                <p className="text-muted-foreground">
                  {t('admin.lastSignInPrefix', { date: formatDate(user.last_sign_in_at) })}
                </p>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewUserDetails?.(user.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditRole(user.id, user.role)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};


