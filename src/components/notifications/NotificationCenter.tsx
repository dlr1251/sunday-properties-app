import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  DollarSign,
  MessageCircle,
  FileText,
  Clock,
  Star
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'offer' | 'counter_offer' | 'acceptance' | 'rejection' | 'visit' | 'message' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  propertyId?: string;
  offerId?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate real-time notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'offer',
        title: 'Nueva Oferta Recibida',
        message: 'María González hizo una oferta de $450,000,000 por tu apartamento en El Poblado',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        read: false,
        propertyId: 'prop-1',
        offerId: 'offer-1',
        priority: 'high'
      },
      {
        id: '2',
        type: 'counter_offer',
        title: 'Contraoferta Recibida',
        message: 'El vendedor contraofertó tu oferta con un precio de $480,000,000',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        propertyId: 'prop-2',
        offerId: 'offer-2',
        priority: 'high'
      },
      {
        id: '3',
        type: 'visit',
        title: 'Visita Programada',
        message: 'Tu visita al apartamento en Laureles está programada para mañana a las 2:00 PM',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        read: true,
        propertyId: 'prop-3',
        priority: 'medium'
      },
      {
        id: '4',
        type: 'milestone',
        title: 'Hito Alcanzado',
        message: '¡Felicidades! Has completado el 75% de la negociación',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: 'low'
      },
      {
        id: '5',
        type: 'rejection',
        title: 'Oferta Rechazada',
        message: 'Tu oferta de $420,000,000 fue rechazada automáticamente por estar por debajo del precio mínimo',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        read: true,
        propertyId: 'prop-4',
        offerId: 'offer-3',
        priority: 'medium'
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'offer':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'counter_offer':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'acceptance':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejection':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'visit':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'milestone':
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como leídas
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full">
            Ver todas las notificaciones
          </Button>
        </div>
      </Card>
    </div>
  );
};
