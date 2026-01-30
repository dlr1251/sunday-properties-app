import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '../../hooks/useUsers';
import { Crown, Briefcase, RefreshCw, Search, UserPlus, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface AdminsManagementPanelProps {
  isDarkMode?: boolean;
}

export const AdminsManagementPanel = ({ isDarkMode = true }: AdminsManagementPanelProps) => {
  const { users, loading, error, refetch, updateRole } = useUsers();
  const [search, setSearch] = useState('');

  const admins = useMemo(() => {
    const term = search.toLowerCase();
    return users
      .filter(u => u.role === 'admin' || u.role === 'super_admin')
      .filter(u => !term || u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
  }, [users, search]);

  const darkCard = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';
  const selectClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : '';

  const promote = async (userId: string) => {
    try {
      const success = await updateRole({ userId, role: 'super_admin' as any });
      if (success) {
        toast.success('Usuario promovido a Super Admin');
        refetch();
      } else {
        toast.error('Error al promover usuario');
      }
    } catch (error) {
      toast.error('Error al promover usuario');
    }
  };

  const demote = async (userId: string) => {
    try {
      const success = await updateRole({ userId, role: 'admin' as any });
      if (success) {
        toast.success('Usuario degradado a Admin');
        refetch();
      } else {
        toast.error('Error al degradar usuario');
      }
    } catch (error) {
      toast.error('Error al degradar usuario');
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const success = await updateRole({ userId, role: 'registered' as any });
      if (success) {
        toast.success('Usuario removido de rol administrativo');
        refetch();
      } else {
        toast.error('Error al remover permisos administrativos');
      }
    } catch (error) {
      toast.error('Error al remover permisos administrativos');
    }
  };

  return (
    <div className="space-y-6">
      <Card className={darkCard}>
        <CardHeader className={darkCard}>
          <CardTitle className={textPrimary}>Administradores</CardTitle>
        </CardHeader>
        <CardContent className={darkCard}>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${textSecondary}`} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar admin por nombre o email"
                className={`pl-9 ${inputClasses}`}
              />
            </div>
            <Button variant="outline" onClick={() => refetch()} className={isDarkMode ? 'border-gray-600 hover:bg-gray-700 dark:text-white' : ''}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : ''}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Admin
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admins.map((u) => (
              <Card key={u.id} className={darkCard}>
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`text-sm ${textSecondary} truncate`}>{u.email}</div>
                        <div className={`text-lg font-semibold ${textPrimary} truncate`}>{u.name || 'Sin nombre'}</div>
                        <div className={`text-xs ${textSecondary} mt-1`}>
                          Creado: {new Date(u.created_at).toLocaleDateString('es-CO')}
                        </div>
                      </div>
                      <Badge variant={u.role === 'super_admin' ? 'default' : 'secondary'} className="ml-2 shrink-0">
                        {u.role === 'super_admin' ? <Crown className="h-3 w-3 mr-1" /> : <Briefcase className="h-3 w-3 mr-1" />}
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {u.role === 'admin' && (
                        <Button
                          size="sm"
                          onClick={() => promote(u.id)}
                          className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} flex-1`}
                        >
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Super Admin
                        </Button>
                      )}

                      {u.role === 'super_admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => demote(u.id)}
                          className={`${isDarkMode ? 'border-gray-600 hover:bg-gray-700' : ''} flex-1`}
                        >
                          <ChevronDown className="h-3 w-3 mr-1" />
                          Admin
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAdmin(u.id)}
                        className={`${isDarkMode ? 'border-red-600 text-red-400 hover:bg-red-950' : 'border-red-300 text-red-600 hover:bg-red-50'} flex-1`}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminsManagementPanel;


