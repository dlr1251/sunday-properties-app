import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Users, Shield, CheckCircle } from 'lucide-react';

interface Props {
  stats: {
    total_users: number;
    super_admins: number;
    admins: number;
    verified_users: number;
  } | null;
}

export const RoleStatsCards: React.FC<Props> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="mx-auto h-8 w-8 text-blue-500 mb-2" />
            <p className="text-sm text-muted-foreground">Total Usuarios</p>
            <p className="text-3xl font-bold">{stats.total_users}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Shield className="mx-auto h-8 w-8 text-purple-500 mb-2" />
            <p className="text-sm text-muted-foreground">Administradores</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.super_admins + stats.admins}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">Verificados</p>
            <p className="text-3xl font-bold text-green-600">{stats.verified_users}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


