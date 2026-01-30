import React, { useEffect, useState } from 'react';
import { useSuperAdminDashboard } from '../../../hooks/admin/useAdminDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Users,
  Home,
  Handshake,
  FileText,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Crown,
  Scale,
  Briefcase,
  Activity,
  BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SuperAdminOverview() {
  const { stats, recentActivity, loading, error, refetch } = useSuperAdminDashboard();
  const navigate = useNavigate();
  const [quickStats, setQuickStats] = useState({
    pendingVerifications: 0,
    pendingProperties: 0,
    activeNegotiations: 0,
    unreadMessages: 0
  });

  useEffect(() => {
    // Fetch additional quick stats
    const fetchQuickStats = async () => {
      // This would be implemented with actual API calls
      // For now, using the stats from the hook
      setQuickStats({
        pendingVerifications: stats?.pendingVerifications || 0,
        pendingProperties: stats?.pendingProperties || 0,
        activeNegotiations: stats?.activeNegotiations || 0,
        unreadMessages: 0 // Would need to fetch from chats
      });
    };
    fetchQuickStats();
  }, [stats]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 text-lg mb-4">Error al cargar el dashboard</p>
          <Button onClick={refetch} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.verifiedUsers || 0)} verificados
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline">{stats?.lawyerUsers || 0} abogados</Badge>
              <Badge variant="outline">{stats?.adminUsers || 0} admins</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeProperties || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.pendingProperties || 0)} pendientes
            </p>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline">{formatNumber(stats?.soldProperties || 0)} vendidas</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negociaciones</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.activeNegotiations || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(stats?.completedNegotiations || 0)} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +12.5% este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Accesos directos a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=users')}
            >
              <Users className="h-5 w-5 mb-2" />
              <span>Crear Usuario</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=properties')}
            >
              <Home className="h-5 w-5 mb-2" />
              <span>Gestionar Propiedades</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=negotiations')}
            >
              <Handshake className="h-5 w-5 mb-2" />
              <span>Ver Negociaciones</span>
            </Button>
            <Button 
              variant="outline" 
              className="flex flex-col h-auto py-4"
              onClick={() => navigate('/dashboard?tab=verifications')}
            >
              <Shield className="h-5 w-5 mb-2" />
              <span>Verificaciones</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Requiere Atención
            </CardTitle>
            <CardDescription>Elementos pendientes de revisión</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStats.pendingVerifications > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">Verificaciones pendientes</span>
                </div>
                <Badge variant="destructive">{quickStats.pendingVerifications}</Badge>
              </div>
            )}
            {quickStats.pendingProperties > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Propiedades pendientes</span>
                </div>
                <Badge variant="default">{quickStats.pendingProperties}</Badge>
              </div>
            )}
            {quickStats.activeNegotiations > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Negociaciones activas</span>
                </div>
                <Badge variant="outline">{quickStats.activeNegotiations}</Badge>
              </div>
            )}
            {quickStats.pendingVerifications === 0 && quickStats.pendingProperties === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay elementos pendientes
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="mt-1">
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : activity.status === 'warning' ? (
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900">{activity.message || 'Actividad del sistema'}</p>
                    <p className="text-xs text-gray-500">{activity.timestamp || 'Ahora'}</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Estado del Sistema
          </CardTitle>
          <CardDescription>Métricas de rendimiento de la plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-sm text-gray-600">Tiempo de actividad</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">1.2s</div>
              <div className="text-sm text-gray-600">Tiempo de respuesta promedio</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {formatNumber(stats?.totalUsers || 0)}
              </div>
              <div className="text-sm text-gray-600">Usuarios activos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

