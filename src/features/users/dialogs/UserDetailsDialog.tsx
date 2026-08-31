import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityDialog from '../../../components/data/EntityDialog';

export type UserDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
    verification_status?: string | null;
    created_at?: string | null;
    last_sign_in_at?: string | null;
  } | null;
};

export function UserDetailsDialog(props: UserDetailsDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, user } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={user?.name ?? t('admin.userDetailsFallback')}>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div><span className="text-muted-foreground">{t('profile.email')}:</span> {user?.email ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('profile.role')}:</span> {user?.role ? t(`profile.roles.${user.role}`, { defaultValue: user.role }) : '—'}</div>
        <div><span className="text-muted-foreground">{t('admin.verificationStatus')}:</span> {user?.verification_status ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('common.created')}:</span> {user?.created_at ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('admin.lastSignIn')}:</span> {user?.last_sign_in_at ?? '—'}</div>
      </div>
    </EntityDialog>
  );
}

export default UserDetailsDialog;
