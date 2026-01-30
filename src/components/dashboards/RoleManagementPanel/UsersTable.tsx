import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Eye, Edit } from 'lucide-react';
import { getRoleBadgeColor, getRoleIcon, getVerificationStatusIcon, getRoleLabel } from '../../../utils/userRoles';

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

export const UsersTable: React.FC<Props> = ({ users, selectedUsers, setSelectedUsers, onViewUserDetails, onEditRole }) => {
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
          <TableHead>Usuario</TableHead>
          <TableHead>Rol Actual</TableHead>
          <TableHead>Verificación</TableHead>
          <TableHead>Actividad</TableHead>
          <TableHead>Registro</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
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
                  {user.verification_status === 'verified' ? 'Verificado' :
                   user.verification_status === 'pending' ? 'Pendiente' :
                   user.verification_status === 'rejected' ? 'Rechazado' : 'No verificado'}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm space-y-1">
                <p>Propiedades: {user.properties_count || 0}</p>
                <p>Visitas: {user.visits_count || 0}</p>
                <p>Ofertas: {user.offers_count || 0}</p>
              </div>
            </TableCell>
            <TableCell className="text-sm">
              <p>{new Date(user.created_at).toLocaleDateString('es-CO')}</p>
              {user.last_sign_in_at && (
                <p className="text-muted-foreground">
                  Último acceso: {new Date(user.last_sign_in_at).toLocaleDateString('es-CO')}
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


