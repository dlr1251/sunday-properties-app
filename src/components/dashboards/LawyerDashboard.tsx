import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Briefcase, 
  MessageSquare, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CaseManager } from '../lawyer/CaseManager';
import { ChatPanel } from '../chat/ChatPanel';

export const LawyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');

  // Mock data - in real app this would come from Supabase
  const stats = {
    activeCases: 2,
    documentsPending: 3,
    unreadMessages: 5,
    completedCases: 8,
  };

  const cases = [
    {
      id: '1',
      caseNumber: 'CASE-2024-001',
      title: 'Compraventa Apartamento El Poblado',
      buyer: 'Laura Fernández',
      seller: 'Pedro Sánchez',
      status: 'active',
      documents: 2,
      lastActivity: 'Hace 2 horas',
      priority: 'high',
    },
    {
      id: '2',
      caseNumber: 'CASE-2024-002',
      title: 'Compraventa Casa El Poblado',
      buyer: 'Ana Gómez',
      seller: 'Roberto Torres',
      status: 'review',
      documents: 1,
      lastActivity: 'Hace 1 día',
      priority: 'medium',
    },
  ];

  const notifications = [
    {
      id: '1',
      type: 'document',
      title: 'Nuevo documento para revisar',
      description: 'Promesa de compraventa - Caso CASE-2024-001',
      time: 'Hace 30 minutos',
      unread: true,
    },
    {
      id: '2',
      type: 'message',
      title: 'Mensaje de cliente',
      description: 'Laura Fernández envió un mensaje',
      time: 'Hace 1 hora',
      unread: true,
    },
    {
      id: '3',
      type: 'deadline',
      title: 'Fecha límite próxima',
      description: 'Caso CASE-2024-002 - 3 días restantes',
      time: 'Hace 2 horas',
      unread: false,
    },
  ];

  const recentMessages = [
    {
      id: '1',
      sender: 'Laura Fernández',
      message: 'Dr. Morales, ¿podría revisar la promesa de compraventa?',
      time: 'Hace 30 minutos',
      unread: true,
    },
    {
      id: '2',
      sender: 'Pedro Sánchez',
      message: 'Perfecto, los términos están bien. ¿Cuándo podemos firmar?',
      time: 'Hace 1 hora',
      unread: false,
    },
    {
      id: '3',
      sender: 'Ana Gómez',
      message: 'Dra. Ruiz, los términos están perfectos. Podemos proceder.',
      time: 'Hace 2 horas',
      unread: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Activo</Badge>;
      case 'review':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">En Revisión</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Alta</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Media</Badge>;
      case 'low':
        return <Badge variant="outline">Baja</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Legal 👨‍💼
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {user?.name}. Gestiona tus casos y clientes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Abogado
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Activos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documentsPending}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes de revisión
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Sin leer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCases}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Mis Casos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
        </TabsList>

        {/* Cases Tab */}
        <TabsContent value="cases" className="space-y-4">
          <CaseManager />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Notificaciones</h2>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Marcar Todas como Leídas
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.unread ? 'border-blue-200 bg-blue-50/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {notification.type === 'document' && <FileText className="h-4 w-4 text-primary" />}
                      {notification.type === 'message' && <MessageSquare className="h-4 w-4 text-primary" />}
                      {notification.type === 'deadline' && <AlertCircle className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{notification.title}</h3>
                        {notification.unread && (
                          <Badge variant="destructive" className="text-xs">Nuevo</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <div className="h-[600px]">
            <ChatPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
