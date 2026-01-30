import React from 'react';
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
  const { open, onOpenChange, user } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={user?.name ?? 'User details'}>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div><span className="text-muted-foreground">Email:</span> {user?.email ?? '—'}</div>
        <div><span className="text-muted-foreground">Role:</span> {user?.role ?? '—'}</div>
        <div><span className="text-muted-foreground">Verification:</span> {user?.verification_status ?? '—'}</div>
        <div><span className="text-muted-foreground">Created:</span> {user?.created_at ?? '—'}</div>
        <div><span className="text-muted-foreground">Last sign-in:</span> {user?.last_sign_in_at ?? '—'}</div>
      </div>
    </EntityDialog>
  );
}

export default UserDetailsDialog;


