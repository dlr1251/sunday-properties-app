import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Heart, 
  Calendar, 
  FileText, 
  Home, 
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app this would come from Supabase
  const stats = {
    favorites: 3,
    scheduledVisits: 1,
    activeOffers: 2,
    documents: 5,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'favorite',
      title: 'Agregaste a favoritos',
      description: 'Apartamento en El Poblado',
      time: 'Hace 2 horas',
      icon: Heart,
    },
    {
      id: '2',
      type: 'visit',
      title: 'Visita programada',
      description: 'Casa en Laureles - Mañana 2:00 PM',
      time: 'Hace 1 día',
      icon: Calendar,
    },
    {
      id: '3',
      type: 'offer',
      title: 'Oferta enviada',
      description: 'Apartamento en Envigado - $280M',
      time: 'Hace 3 días',
      icon: FileText,
    },
  ];

  const quickActions = [
    {
      title: 'Explorar Propiedades',
      description: 'Descubre nuevas oportunidades',
      icon: MapPin,
      action: 'discover',
    },
    {
      title: 'Mis Favoritos',
      description: 'Propiedades guardadas',
      icon: Heart,
      action: 'favorites',
    },
    {
      title: 'Programar Visita',
      description: 'Agenda una visita',
      icon: Calendar,
      action: 'visits',
    },
    {
      title: 'Análisis Financiero',
      description: 'Calcula tu inversión',
      icon: TrendingUp,
      action: 'financial-analysis',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido a tu dashboard de Sundap Properties
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {user?.user_type === 'verified' && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Verificado
            </Badge>
          )}
          {user?.user_type === 'premium' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Premium
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.favorites}</div>
            <p className="text-xs text-muted-foreground">
              Propiedades guardadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scheduledVisits}</div>
            <p className="text-xs text-muted-foreground">
              Programadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ofertas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOffers}</div>
            <p className="text-xs text-muted-foreground">
              Activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card key={action.action} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Tus últimas acciones en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Visitas y citas programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Visita programada</p>
                  <p className="text-xs text-muted-foreground">Casa en Laureles</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Mañana 2:00 PM
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Documento listo</p>
                  <p className="text-xs text-muted-foreground">Promesa de compraventa</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  En revisión
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
