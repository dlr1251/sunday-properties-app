import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  Users, 
  Home, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in real app this would come from Supabase
  const platformStats = {
    totalUsers: 1247,
    activeProperties: 89,
    pendingApprovals: 12,
    totalRevenue: 15600000, // COP
    activeCases: 23,
    completedTransactions: 156,
  };

  const userStats = {
    registered: 856,
    verified: 234,
    premium: 89,
    lawyers: 12,
    superadmins: 1,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'user_registration',
      title: 'Nuevo usuario registrado',
      description: 'Carlos Ramírez se registró como usuario verificado',
      time: 'Hace 15 minutos',
      status: 'success',
    },
    {
      id: '2',
      type: 'property_pending',
      title: 'Propiedad pendiente de aprobación',
      description: 'Apartamento en El Poblado requiere revisión',
      time: 'Hace 1 hora',
      status: 'warning',
    },
    {
      id: '3',
      type: 'case_completed',
      title: 'Caso completado',
      description: 'Dr. Morales completó el caso CASE-2024-001',
      time: 'Hace 2 horas',
      status: 'success',
    },
    {
      id: '4',
      type: 'payment_received',
      title: 'Pago recibido',
      description: 'Comisión de $450,000 COP por transacción',
      time: 'Hace 3 horas',
      status: 'success',
    },
  ];

  const pendingApprovals = [
    {
      id: '1',
      type: 'property',
      title: 'Apartamento en El Poblado',
      owner: 'María López',
      submittedAt: 'Hace 2 horas',
      status: 'pending',
    },
    {
      id: '2',
      type: 'user_verification',
      title: 'Solicitud de verificación',
      owner: 'Jorge Martínez',
      submittedAt: 'Hace 4 horas',
      status: 'pending',
    },
    {
      id: '3',
      type: 'property',
      title: 'Casa en Laureles',
      owner: 'Ana Gómez',
      submittedAt: 'Hace 6 horas',
      status: 'pending',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración 🛡️
          </h1>
          <p className="text-muted-foreground mt-1">
            SuperAdmin - Gestión completa de la plataforma
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            SuperAdmin
          </Badge>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.activeProperties}</div>
            <p className="text-xs text-muted-foreground">
              Activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Por aprobar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              Activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.completedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="properties">Propiedades</TabsTrigger>
          <TabsTrigger value="approvals">Aprobaciones</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Usuarios</CardTitle>
                <CardDescription>
                  Tipos de usuarios en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Registrados</span>
                    </div>
                    <span className="font-medium">{userStats.registered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Verificados</span>
                    </div>
                    <span className="font-medium">{userStats.verified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Premium</span>
                    </div>
                    <span className="font-medium">{userStats.premium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Abogados</span>
                    </div>
                    <span className="font-medium">{userStats.lawyers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones en la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Solicitudes Pendientes</h2>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Configurar Auto-aprobación
            </Button>
          </div>

          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{approval.title}</h3>
                        <Badge variant="outline">{approval.type}</Badge>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Pendiente
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Solicitado por: {approval.owner}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {approval.submittedAt}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Revisar
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tabs placeholder */}
        <TabsContent value="users" className="space-y-4">
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Gestión de Usuarios</h3>
            <p className="text-muted-foreground">Panel de gestión de usuarios en desarrollo...</p>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <div className="text-center py-12">
            <Home className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Gestión de Propiedades</h3>
            <p className="text-muted-foreground">Panel de gestión de propiedades en desarrollo...</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Analíticas Avanzadas</h3>
            <p className="text-muted-foreground">Panel de analíticas en desarrollo...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
