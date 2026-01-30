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

export const BulkRoleDialog: React.FC<Props> = ({ open, onOpenChange, count, newRole, setNewRole, onConfirm }) => {
  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Rol Masivamente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nuevo Rol para {count} usuario{count !== 1 ? 's' : ''}</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol..." />
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
              <strong>Advertencia crítica:</strong> Esta acción afectará a {count} usuario{count !== 1 ? 's' : ''}.
              Los usuarios recibirán una notificación sobre el cambio de rol.
              Esta acción no se puede deshacer fácilmente.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm()} disabled={!newRole} variant="destructive">
            Aplicar Cambio Masivo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


