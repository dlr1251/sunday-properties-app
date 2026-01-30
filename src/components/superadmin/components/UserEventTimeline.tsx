import React from 'react';
import { useUserEvents, UserEvent } from '../../../hooks/superadmin/useUserEvents';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  UserCog, 
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';

interface UserEventTimelineProps {
  userId: string | null;
}

const getEventIcon = (type: UserEvent['type']) => {
  switch (type) {
    case 'registration':
      return <UserPlus className="h-4 w-4" />;
    case 'verification_submitted':
      return <Shield className="h-4 w-4" />;
    case 'verification_reviewed':
    case 'verification_status_changed':
      return <CheckCircle className="h-4 w-4" />;
    case 'role_changed':
      return <UserCog className="h-4 w-4" />;
    case 'status_changed':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getEventColor = (type: UserEvent['type']) => {
  switch (type) {
    case 'registration':
      return 'bg-blue-500';
    case 'verification_submitted':
      return 'bg-yellow-500';
    case 'verification_reviewed':
    case 'verification_status_changed':
      return 'bg-green-500';
    case 'role_changed':
      return 'bg-purple-500';
    case 'status_changed':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

export function UserEventTimeline({ userId }: UserEventTimelineProps) {
  const { events, loading, error } = useUserEvents(userId);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <AlertCircle className="h-5 w-5 mx-auto mb-2" />
        <p>Error al cargar eventos: {error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        <Clock className="h-5 w-5 mx-auto mb-2 opacity-50" />
        <p>No hay eventos registrados</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-4">
            {/* Event icon */}
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${getEventColor(event.type)} text-white`}>
              {getEventIcon(event.type)}
            </div>
            
            {/* Event content */}
            <div className="flex-1 pb-6">
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                    
                    {event.performedBy && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Por: {event.performedBy.name} ({event.performedBy.email})
                      </p>
                    )}
                    
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-right">
                    <div className="text-xs font-medium">
                      {format(new Date(event.timestamp), 'dd/MM/yyyy', { locale: es })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(event.timestamp), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

