import { useState, useEffect, useCallback } from 'react';
import { reportsRepository, Report } from '../../lib/db/repositories/reports.repo';
import { Result, isOk, isErr } from '../../lib/utils/result';
import { AppError, toUserMessage } from '../../lib/utils/errors';
import { logError } from '../../lib/utils/logger';
import { ReportFilters, UpdateReportStatusInput, BulkUpdateReportsInput } from '../../lib/validation/reports.schema';
import { toast } from 'sonner';

// Use the Report interface from the repository

export const useAdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const fetchReports = useCallback(async (filters: ReportFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await reportsRepository.getReports(filters);
      
      if (isOk(result)) {
        setReports(result.data);
        setTotalCount(result.data.length);
      } else {
        const errorMessage = toUserMessage(result.error);
        setError(errorMessage);
        logError('Failed to fetch reports', { filters, error: result.error });
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      setError(errorMessage);
      logError('Failed to fetch reports', { filters, error: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const result = await reportsRepository.getReportStats();
      
      if (isOk(result)) {
        setStats(result.data);
      }
    } catch (err) {
      logError('Failed to fetch report stats', { error: err });
    }
  }, []);

  const updateReportStatus = useCallback(async (
    reportId: string,
    status: Report['status'],
    resolutionAction?: Report['resolution_action'],
    resolutionNotes?: string
  ) => {
    try {
      const input: UpdateReportStatusInput = {
        reportId,
        status,
        resolutionAction,
        resolutionNotes
      };

      const result = await reportsRepository.updateReportStatus(input);
      
      if (isOk(result)) {
        // Update local state
        setReports(prev => prev.map(report =>
          report.id === reportId ? result.data : report
        ));
        
        // Update stats
        await fetchStats();
        
        toast.success('Estado de denuncia actualizado exitosamente');
        return { success: true };
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to update report status', { reportId, status, error: result.error });
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to update report status', { reportId, status, error: err });
      return { success: false, error: errorMessage };
    }
  }, [fetchStats]);

  const bulkUpdateStatus = useCallback(async (
    reportIds: string[],
    status: Report['status'],
    resolutionAction?: Report['resolution_action'],
    resolutionNotes?: string
  ) => {
    try {
      const input: BulkUpdateReportsInput = {
        reportIds,
        status,
        resolutionAction,
        resolutionNotes
      };

      const result = await reportsRepository.bulkUpdateReports(input);
      
      if (isOk(result)) {
        // Refetch reports to get updated data
        await fetchReports();
        
        // Update stats
        await fetchStats();
        
        toast.success(`${reportIds.length} denuncia${reportIds.length !== 1 ? 's' : ''} actualizada${reportIds.length !== 1 ? 's' : ''}`);
        return { success: true };
      } else {
        const errorMessage = toUserMessage(result.error);
        toast.error(errorMessage);
        logError('Failed to bulk update reports', { reportIds, status, error: result.error });
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = toUserMessage(err);
      toast.error(errorMessage);
      logError('Failed to bulk update reports', { reportIds, status, error: err });
      return { success: false, error: errorMessage };
    }
  }, [fetchReports, fetchStats]);

  const exportReports = useCallback(() => {
    const csvData = reports.map(r => ({
      'ID Denuncia': r.id,
      'Tipo': r.report_type,
      'Título': r.title,
      'Descripción': r.description,
      'Reportador': r.reporter?.name || '',
      'Email Reportador': r.reporter?.email || '',
      'Usuario Reportado': r.reported_user?.name || '',
      'Email Reportado': r.reported_user?.email || '',
      'Propiedad Reportada': r.reported_property?.title || '',
      'Estado': r.status,
      'Prioridad': r.priority,
      'Fecha Creación': new Date(r.created_at).toLocaleDateString('es-CO'),
      'Fecha Revisión': r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString('es-CO') : '',
      'Acción Resolución': r.resolution_action || '',
      'Notas Resolución': r.resolution_notes || '',
      'Revisor': r.reviewer?.name || ''
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `denuncias_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Archivo exportado exitosamente');
  }, [reports]);

  const getStats = useCallback(() => {
    return stats || {
      total: 0,
      pending: 0,
      underReview: 0,
      resolved: 0,
      dismissed: 0,
      escalated: 0,
      highPriority: 0,
      critical: 0,
      todayReports: 0
    };
  }, [stats]);

  // Auto-fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    reports,
    loading,
    error,
    totalCount,
    fetchReports,
    updateReportStatus,
    bulkUpdateStatus,
    exportReports,
    getStats
  };
};
