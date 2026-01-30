import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getRoleLabel } from '../utils/userRoles';
import { fetchUsersService, updateUserRoleService, getRoleStatsService } from '../services/users';
import type { UserWithRole, RoleStats } from '../types/entities';

// moved to services/users.ts

export const useRoleManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<RoleStats | null>(null);

  const fetchUsers = async (page = 1, limit = 20, search?: string, roleFilter?: string) => {
    setLoading(true);
    try {
      setError(null);
      const res = await fetchUsersService(page, limit, search, roleFilter);
      if (!res.ok) throw new Error(res.error);
      setUsers(res.data.users);
      setTotalCount(res.data.count);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserWithRole['role']) => {
    try {
      const res = await updateUserRoleService(userId, newRole);
      if (!res.ok) throw new Error(res.error);

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));

      // Log the role change
      // Notifications/audit handled elsewhere if needed

      toast.success('Rol actualizado exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
      return { success: false, error: error.message };
    }
  };

  const bulkUpdateRoles = async (userIds: string[], newRole: UserWithRole['role']) => {
    try {
      for (const userId of userIds) {
        const result = await updateUserRole(userId, newRole);
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      toast.success(`Roles actualizados para ${userIds.length} usuario${userIds.length !== 1 ? 's' : ''}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error bulk updating roles:', error);
      toast.error('Error en actualización masiva');
      return { success: false, error: error.message };
    }
  };

  const getRoleStats = async () => {
    try {
      const res = await getRoleStatsService();
      if (!res.ok) throw new Error(res.error);
      setStats(res.data);
      return res.data;
    } catch (error: any) {
      console.error('Error getting role stats:', error);
      return null;
    }
  };

  const exportUsers = () => {
    const csvData = users.map(u => ({
      'ID': u.id,
      'Nombre': u.name,
      'Email': u.email,
      'Rol': getRoleLabel(u.role),
      'Estado Verificación': u.verification_status === 'verified' ? 'Verificado' :
                           u.verification_status === 'pending' ? 'Pendiente' :
                           u.verification_status === 'rejected' ? 'Rechazado' : 'No verificado',
      'Email Confirmado': u.email_confirmed_at ? 'Sí' : 'No',
      'Propiedades': u.properties_count || 0,
      'Denuncias': u.reports_count || 0,
      'Visitas': u.visits_count || 0,
      'Ofertas': u.offers_count || 0,
      'Fecha Registro': new Date(u.created_at).toLocaleDateString('es-CO'),
      'Último Acceso': u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('es-CO') : 'Nunca'
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Archivo exportado exitosamente');
  };

  return {
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
  };
};

// Helper function to get role labels
// role helpers moved to utils/userRoles.ts
