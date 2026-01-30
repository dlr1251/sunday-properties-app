import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { getAvailableRoles, getRoleLabel } from '../../../utils/userRoles';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRoleLabel?: string;
  newRole: string;
  setNewRole: (role: string) => void;
  onConfirm: () => Promise<void> | void;
  confirming: boolean;
}

export const RoleDialog: React.FC<Props> = ({ open, onOpenChange, currentRoleLabel, newRole, setNewRole, onConfirm, confirming }) => {
  const availableRoles = getAvailableRoles();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar Rol de Usuario</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Rol Actual</Label>
            <p className="text-sm text-muted-foreground">{currentRoleLabel || ''}</p>
          </div>
          <div>
            <Label>Nuevo Rol</Label>
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
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Cambiar el rol de un usuario puede afectar significativamente sus permisos y acceso al sistema.
              Asegúrate de que el usuario entienda las implicaciones de este cambio.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm()} disabled={!newRole || confirming}>
            {confirming ? 'Actualizando...' : 'Actualizar Rol'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


