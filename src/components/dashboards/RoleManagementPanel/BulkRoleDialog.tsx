import { useTranslation } from 'react-i18next';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { getAvailableRoles } from '../../../utils/userRoles';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  newRole: string;
  setNewRole: (role: string) => void;
  onConfirm: () => Promise<void> | void;
}

export const BulkRoleDialog: React.FC<Props> = ({
  open, onOpenChange, count, newRole, setNewRole, onConfirm }) => {
    const { t } = useTranslation();
  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('admin.changeRoleBulk')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('admin.bulkRoleNewLabel', { count })}</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder={t('admin.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm text-red-800">
              <strong>{t('admin.criticalWarning')}</strong> {t('admin.bulkRoleCriticalBody', { count })}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => onConfirm()} disabled={!newRole} variant="destructive">
            {t('admin.applyBulkChange')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


