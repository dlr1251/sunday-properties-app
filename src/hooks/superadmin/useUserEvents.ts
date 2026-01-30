import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface UserEvent {
  id: string;
  type: 'registration' | 'verification_submitted' | 'verification_reviewed' | 'verification_status_changed' | 'role_changed' | 'status_changed' | 'other';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
  performedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

interface UseUserEventsResult {
  events: UserEvent[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserEvents(userId: string | null): UseUserEventsResult {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user profile to get registration date
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('created_at, verification_submitted_at, verification_reviewed_at, verification_status')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch audit logs for this user
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'user')
        .eq('resource_id', userId)
        .order('created_at', { ascending: false });

      if (auditError) throw auditError;

      const formattedEvents: UserEvent[] = [];

      // Add registration event
      if (profile?.created_at) {
        formattedEvents.push({
          id: `registration-${userId}`,
          type: 'registration',
          title: 'Registro de Usuario',
          description: 'Usuario registrado en la plataforma',
          timestamp: profile.created_at,
        });
      }

      // Add verification submitted event
      if (profile?.verification_submitted_at) {
        formattedEvents.push({
          id: `verification-submitted-${userId}`,
          type: 'verification_submitted',
          title: 'Solicitud de Verificación Enviada',
          description: 'El usuario envió documentos para verificación',
          timestamp: profile.verification_submitted_at,
        });
      }

      // Add verification reviewed event
      if (profile?.verification_reviewed_at) {
        formattedEvents.push({
          id: `verification-reviewed-${userId}`,
          type: 'verification_reviewed',
          title: 'Verificación Revisada',
          description: `Estado de verificación: ${profile.verification_status || 'pending'}`,
          timestamp: profile.verification_reviewed_at,
          metadata: {
            status: profile.verification_status,
          },
        });
      }

      // Process audit logs
      if (auditLogs) {
        // Fetch performer profiles for logs that have user_id
        const userIds = auditLogs.map((log: any) => log.user_id).filter(Boolean);
        let performersMap: Record<string, any> = {};
        
        if (userIds.length > 0) {
          const { data: performers } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          
          if (performers) {
            performersMap = performers.reduce((acc: any, p: any) => {
              acc[p.id] = p;
              return acc;
            }, {});
          }
        }

        for (const log of auditLogs) {
          let event: UserEvent | null = null;
          const performer = log.user_id ? performersMap[log.user_id] : null;

          switch (log.action_type) {
            case 'user_role_changed':
              event = {
                id: log.id,
                type: 'role_changed',
                title: 'Cambio de Rol',
                description: `Rol cambiado de "${log.changes?.old_role || 'N/A'}" a "${log.changes?.new_role || 'N/A'}"`,
                timestamp: log.created_at,
                metadata: log.changes,
                performedBy: performer
                  ? {
                      id: performer.id,
                      name: performer.full_name || 'Usuario',
                      email: performer.email || '',
                    }
                  : undefined,
              };
              break;

            case 'verification_status_changed':
              event = {
                id: log.id,
                type: 'verification_status_changed',
                title: 'Cambio de Estado de Verificación',
                description: `Estado cambiado de "${log.changes?.old_status || 'N/A'}" a "${log.changes?.new_status || 'N/A'}"`,
                timestamp: log.created_at,
                metadata: log.changes,
                performedBy: performer
                  ? {
                      id: performer.id,
                      name: performer.full_name || 'Usuario',
                      email: performer.email || '',
                    }
                  : undefined,
              };
              break;

            case 'user_created':
              // Skip if we already have registration event
              break;

            default:
              event = {
                id: log.id,
                type: 'other',
                title: log.action_type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
                description: log.changes ? JSON.stringify(log.changes) : 'Acción realizada',
                timestamp: log.created_at,
                metadata: log.changes,
                performedBy: performer
                  ? {
                      id: performer.id,
                      name: performer.full_name || 'Usuario',
                      email: performer.email || '',
                    }
                  : undefined,
              };
              break;
          }

          if (event) {
            formattedEvents.push(event);
          }
        }
      }

      // Sort events by timestamp (newest first)
      formattedEvents.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setEvents(formattedEvents);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar eventos del usuario';
      setError(errorMessage);
      console.error('Error fetching user events:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
  };
}

