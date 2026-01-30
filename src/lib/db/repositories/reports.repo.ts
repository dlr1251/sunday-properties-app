import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';
import { 
  ReportStatus, 
  ResolutionAction,
  ReportFilters,
  UpdateReportStatusInput,
  BulkUpdateReportsInput 
} from '../../validation/reports.schema';

// Report interface (matching database schema)
export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id?: string;
  reported_property_id?: string;
  reported_visit_id?: string;
  report_type: 'spam' | 'fraud' | 'inappropriate_content' | 'harassment' | 'fake_listing' | 'scam' | 'copyright_violation' | 'other';
  title: string;
  description: string;
  evidence_urls?: string[];
  status: ReportStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reviewed_by?: string;
  reviewed_at?: string;
  resolution_notes?: string;
  resolution_action?: ResolutionAction;
  created_at: string;
  updated_at: string;
  // Joined data
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  reported_user?: {
    id: string;
    name: string;
    email: string;
  };
  reported_property?: {
    id: string;
    title: string;
  };
  reported_visit?: {
    id: string;
    scheduled_date: string;
  };
  reviewer?: {
    id: string;
    name: string;
  };
}

export class ReportsRepository {
  /**
   * Get reports with filters
   */
  async getReports(filters: ReportFilters = {}): Promise<Result<Report[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey (
            id,
            name,
            email
          ),
          reported_user:profiles!reports_reported_user_id_fkey (
            id,
            name,
            email
          ),
          reported_property:properties!reports_reported_property_id_fkey (
            id,
            title
          ),
          reported_visit:visits!reports_reported_visit_id_fkey (
            id,
            scheduled_date
          ),
          reviewer:profiles!reports_reviewed_by_fkey (
            id,
            name
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.reportType && filters.reportType !== 'all') {
        query = query.eq('report_type', filters.reportType);
      }
      if (filters.priority && filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.search) {
        query = query.or(`
          title.ilike.%${filters.search}%,
          description.ilike.%${filters.search}%,
          reporter.name.ilike.%${filters.search}%,
          reporter.email.ilike.%${filters.search}%,
          reported_user.name.ilike.%${filters.search}%,
          reported_user.email.ilike.%${filters.search}%
        `);
      }
      if (filters.reportedUserId) {
        query = query.eq('reported_user_id', filters.reportedUserId);
      }
      if (filters.reportedPropertyId) {
        query = query.eq('reported_property_id', filters.reportedPropertyId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch reports', { filters, error });
        throw createDatabaseError('Error al cargar las denuncias', error);
      }

      return data || [];
    });
  }

  /**
   * Get a specific report by ID
   */
  async getReportById(id: string): Promise<Result<Report, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey (
            id,
            name,
            email
          ),
          reported_user:profiles!reports_reported_user_id_fkey (
            id,
            name,
            email
          ),
          reported_property:properties!reports_reported_property_id_fkey (
            id,
            title
          ),
          reported_visit:visits!reports_reported_visit_id_fkey (
            id,
            scheduled_date
          ),
          reviewer:profiles!reports_reviewed_by_fkey (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Report', id);
        }
        logError('Failed to fetch report', { id, error });
        throw createDatabaseError('Error al cargar la denuncia', error);
      }

      return data;
    });
  }

  /**
   * Update report status
   */
  async updateReportStatus(input: UpdateReportStatusInput): Promise<Result<Report, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        status: input.status,
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (input.resolutionAction) {
        updateData.resolution_action = input.resolutionAction;
      }
      if (input.resolutionNotes) {
        updateData.resolution_notes = input.resolutionNotes;
      }

      const { data, error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', input.reportId)
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey (
            id,
            name,
            email
          ),
          reported_user:profiles!reports_reported_user_id_fkey (
            id,
            name,
            email
          ),
          reported_property:properties!reports_reported_property_id_fkey (
            id,
            title
          ),
          reported_visit:visits!reports_reported_visit_id_fkey (
            id,
            scheduled_date
          ),
          reviewer:profiles!reports_reviewed_by_fkey (
            id,
            name
          )
        `)
        .single();

      if (error) {
        logError('Failed to update report status', { input, error });
        throw createDatabaseError('Error al actualizar el estado de la denuncia', error);
      }

      return data;
    });
  }

  /**
   * Bulk update reports
   */
  async bulkUpdateReports(input: BulkUpdateReportsInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        status: input.status,
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (input.resolutionAction) {
        updateData.resolution_action = input.resolutionAction;
      }
      if (input.resolutionNotes) {
        updateData.resolution_notes = input.resolutionNotes;
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .in('id', input.reportIds);

      if (error) {
        logError('Failed to bulk update reports', { input, error });
        throw createDatabaseError('Error al actualizar las denuncias', error);
      }

      return undefined;
    });
  }

  /**
   * Archive a property due to report
   */
  async archiveProperty(propertyId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('properties')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (error) {
        logError('Failed to archive property', { propertyId, error });
        throw createDatabaseError('Error al archivar la propiedad', error);
      }

      return undefined;
    });
  }

  /**
   * Cancel a visit due to report
   */
  async cancelVisit(visitId: string, reason: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { error } = await supabase
        .from('visits')
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) {
        logError('Failed to cancel visit', { visitId, reason, error });
        throw createDatabaseError('Error al cancelar la visita', error);
      }

      return undefined;
    });
  }

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<Result<{
    total: number;
    pending: number;
    underReview: number;
    resolved: number;
    dismissed: number;
    escalated: number;
    highPriority: number;
    critical: number;
    todayReports: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('status, priority, created_at');

      if (error) {
        logError('Failed to fetch report stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de denuncias', error);
      }

      const today = new Date().toISOString().split('T')[0];
      const todayReports = data?.filter(r => r.created_at.startsWith(today)).length || 0;

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(r => r.status === 'pending').length || 0,
        underReview: data?.filter(r => r.status === 'under_review').length || 0,
        resolved: data?.filter(r => r.status === 'resolved').length || 0,
        dismissed: data?.filter(r => r.status === 'dismissed').length || 0,
        escalated: data?.filter(r => r.status === 'escalated').length || 0,
        highPriority: data?.filter(r => r.priority === 'high' || r.priority === 'critical').length || 0,
        critical: data?.filter(r => r.priority === 'critical').length || 0,
        todayReports,
      };

      return stats;
    });
  }

  /**
   * Create a notification for report resolution
   */
  async createResolutionNotification(
    reportId: string,
    reporterId: string,
    status: ReportStatus,
    action?: ResolutionAction,
    notes?: string
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
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
          return undefined;
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: reporterId,
          type: 'report_status_update',
          title,
          message,
          data: {
            report_id: reportId,
            status,
            resolution_action: action
          }
        });

      if (error) {
        logError('Failed to create resolution notification', { reportId, reporterId, error });
        throw createDatabaseError('Error al crear notificación de resolución', error);
      }

      return undefined;
    });
  }
}

// Export singleton instance
export const reportsRepository = new ReportsRepository();
