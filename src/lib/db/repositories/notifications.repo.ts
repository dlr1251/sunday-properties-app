import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';

// Notification interface (matching database schema)
export interface Notification {
  id: string;
  user_id: string;
  type: 'visit_scheduled' | 'offer_received' | 'offer_accepted' | 'contract_ready' | 'payment_received' | 'report_status_update' | 'account_action' | 'verification_update' | 'general';
  title: string;
  message: string;
  read: boolean;
  related_id?: string;
  related_type?: 'property' | 'offer' | 'visit' | 'contract' | 'report' | 'verification';
  data?: any;
  created_at: string;
  read_at?: string;
}

// Create notification input
export interface CreateNotificationInput {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: Notification['related_type'];
  data?: any;
}

// Notification filters
export interface NotificationFilters {
  userId?: string;
  type?: string;
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export class NotificationsRepository {
  /**
   * Create a notification
   */
  async createNotification(input: CreateNotificationInput): Promise<Result<Notification, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          related_id: input.relatedId,
          related_type: input.relatedType,
          data: input.data,
          read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        logError('Failed to create notification', { input, error });
        throw createDatabaseError('Error al crear la notificación', error);
      }

      return data;
    });
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ): Promise<Result<Notification[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      if (filters.read !== undefined) {
        query = query.eq('read', filters.read);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch notifications', { userId, filters, error });
        throw createDatabaseError('Error al cargar las notificaciones', error);
      }

      return data || [];
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Result<Notification, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        logError('Failed to mark notification as read', { notificationId, error });
        throw createDatabaseError('Error al marcar la notificación como leída', error);
      }

      return data;
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        logError('Failed to mark all notifications as read', { userId, error });
        throw createDatabaseError('Error al marcar todas las notificaciones como leídas', error);
      }

      return undefined;
    });
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        logError('Failed to delete notification', { notificationId, error });
        throw createDatabaseError('Error al eliminar la notificación', error);
      }

      return undefined;
    });
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<Result<number, AppError>> {
    return tryCatch(async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) {
        logError('Failed to get unread count', { userId, error });
        throw createDatabaseError('Error al obtener el conteo de notificaciones no leídas', error);
      }

      return count || 0;
    });
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string): Promise<Result<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    newToday: number;
  }, AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('notifications')
        .select('type, read, created_at');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch notification stats', { userId, error });
        throw createDatabaseError('Error al cargar estadísticas de notificaciones', error);
      }

      const today = new Date().toISOString().split('T')[0];
      const newToday = data?.filter(n => n.created_at.startsWith(today)).length || 0;

      const byType = data?.reduce((acc, notification) => {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        total: data?.length || 0,
        unread: data?.filter(n => !n.read).length || 0,
        byType,
        newToday
      };
    });
  }

  /**
   * Create notification for report resolution
   */
  async createReportResolutionNotification(
    reporterId: string,
    reportId: string,
    status: string,
    action?: string,
    notes?: string
  ): Promise<Result<Notification, AppError>> {
    let title: string;
    let message: string;

    switch (status) {
      case 'resolved':
        title = 'Denuncia Resuelta';
        message = `Tu denuncia ha sido resuelta. ${notes ? `Notas: ${notes}` : ''}`;
        break;
      case 'dismissed':
        title = 'Denuncia Desestimada';
        message = `Tu denuncia ha sido desestimada. ${notes ? `Notas: ${notes}` : ''}`;
        break;
      case 'under_review':
        title = 'Denuncia en Revisión';
        message = 'Tu denuncia está siendo revisada por nuestro equipo.';
        break;
      default:
        return err(new AppError('Estado de denuncia no válido', 'VALIDATION_ERROR'));
    }

    return this.createNotification({
      userId: reporterId,
      type: 'report_status_update',
      title,
      message,
      relatedId: reportId,
      relatedType: 'report',
      data: {
        report_id: reportId,
        status,
        resolution_action: action
      }
    });
  }

  /**
   * Create notification for account action
   */
  async createAccountActionNotification(
    userId: string,
    action: string,
    reason?: string
  ): Promise<Result<Notification, AppError>> {
    return this.createNotification({
      userId,
      type: 'account_action',
      title: 'Acción en tu cuenta',
      message: `Se ha tomado una acción en tu cuenta: ${action}. ${reason ? `Razón: ${reason}` : ''}`,
      data: {
        action,
        reason
      }
    });
  }

  /**
   * Create notification for verification update
   */
  async createVerificationUpdateNotification(
    userId: string,
    verificationId: string,
    status: string,
    notes?: string
  ): Promise<Result<Notification, AppError>> {
    let title: string;
    let message: string;

    switch (status) {
      case 'verified':
        title = 'Verificación Aprobada';
        message = 'Tu solicitud de verificación ha sido aprobada.';
        break;
      case 'rejected':
        title = 'Verificación Rechazada';
        message = `Tu solicitud de verificación ha sido rechazada. ${notes ? `Razón: ${notes}` : ''}`;
        break;
      case 'pending':
        title = 'Verificación en Proceso';
        message = 'Tu solicitud de verificación está siendo revisada.';
        break;
      default:
        return err(new AppError('Estado de verificación no válido', 'VALIDATION_ERROR'));
    }

    return this.createNotification({
      userId,
      type: 'verification_update',
      title,
      message,
      relatedId: verificationId,
      relatedType: 'verification',
      data: {
        verification_id: verificationId,
        status,
        notes
      }
    });
  }
}

// Export singleton instance
export const notificationsRepository = new NotificationsRepository();
