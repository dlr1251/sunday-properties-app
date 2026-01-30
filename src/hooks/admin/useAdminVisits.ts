import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface AdminVisit {
  id: string;
  property_id: string;
  buyer_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  notes?: string;
  admin_notes?: string;
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_address?: string;
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
  agent_name?: string;
  agent_email?: string;
  visit_duration?: number;
  rescheduled_from?: string;
  cancellation_reason?: string;
  feedback_rating?: number;
  feedback_comment?: string;
}

interface VisitFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  assigned_agent?: string;
  search?: string;
  property_type?: string;
}

export const useAdminVisits = () => {
  const [visits, setVisits] = useState<AdminVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVisits = async (filters: VisitFilters = {}, page = 1, limit = 20) => {
    setLoading(true);
    try {
      setError(null);

      let query = supabase
        .from('visits')
        .select(`
          *,
          properties!visits_property_id_fkey (
            title,
            address,
            type
          ),
          buyer:profiles!visits_buyer_id_fkey (
            name,
            email,
            phone
          ),
          agent:profiles!visits_assigned_agent_fkey (
            name,
            email
          ),
          visit_feedback (
            rating,
            comment
          )
        `, { count: 'exact' })
        .order('scheduled_date', { ascending: false })
        .order('scheduled_time', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('scheduled_date', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('scheduled_date', filters.date_to);
      }
      if (filters.assigned_agent && filters.assigned_agent !== 'all') {
        query = query.eq('assigned_agent', filters.assigned_agent);
      }
      if (filters.property_type && filters.property_type !== 'all') {
        query = query.eq('properties.type', filters.property_type);
      }
      if (filters.search) {
        query = query.or(`
          properties.title.ilike.%${filters.search}%,
          properties.address.ilike.%${filters.search}%,
          buyer.name.ilike.%${filters.search}%,
          buyer.email.ilike.%${filters.search}%,
          agent.name.ilike.%${filters.search}%
        `);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data
      const transformedVisits = (data || []).map(visit => ({
        ...visit,
        property_title: visit.properties?.title,
        property_address: visit.properties?.address,
        buyer_name: visit.buyer?.name,
        buyer_email: visit.buyer?.email,
        buyer_phone: visit.buyer?.phone,
        agent_name: visit.agent?.name,
        agent_email: visit.agent?.email,
        feedback_rating: visit.visit_feedback?.[0]?.rating,
        feedback_comment: visit.visit_feedback?.[0]?.comment
      }));

      setVisits(transformedVisits);
      setTotalCount(count || 0);

    } catch (err: any) {
      console.error('Error fetching admin visits:', err);
      setError(err.message || 'Error al cargar visitas');
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId: string, newStatus: AdminVisit['status'], additionalData?: {
    notes?: string;
    admin_notes?: string;
    cancellation_reason?: string;
    rescheduled_date?: string;
    rescheduled_time?: string;
  }) => {
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Add additional data based on status change
      if (additionalData) {
        if (additionalData.notes) updateData.notes = additionalData.notes;
        if (additionalData.admin_notes) updateData.admin_notes = additionalData.admin_notes;
        if (additionalData.cancellation_reason) updateData.cancellation_reason = additionalData.cancellation_reason;

        if (newStatus === 'rescheduled' && additionalData.rescheduled_date && additionalData.rescheduled_time) {
          updateData.rescheduled_from = updateData.scheduled_date;
          updateData.scheduled_date = additionalData.rescheduled_date;
          updateData.scheduled_time = additionalData.rescheduled_time;
        }
      }

      const { error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      // Update local state
      setVisits(prev => prev.map(visit =>
        visit.id === visitId ? { ...visit, ...updateData } : visit
      ));

      // Create notifications based on status change
      const visit = visits.find(v => v.id === visitId);
      if (visit) {
        let notificationType: string;
        let title: string;
        let message: string;

        switch (newStatus) {
          case 'confirmed':
            notificationType = 'visit_confirmed';
            title = 'Visita Confirmada';
            message = `Tu visita a "${visit.property_title}" ha sido confirmada para el ${new Date(visit.scheduled_date).toLocaleDateString('es-CO')} a las ${visit.scheduled_time}`;
            break;
          case 'cancelled':
            notificationType = 'visit_cancelled';
            title = 'Visita Cancelada';
            message = `Tu visita a "${visit.property_title}" ha sido cancelada. ${additionalData?.cancellation_reason ? `Razón: ${additionalData.cancellation_reason}` : ''}`;
            break;
          case 'rescheduled':
            notificationType = 'visit_rescheduled';
            title = 'Visita Reprogramada';
            message = `Tu visita a "${visit.property_title}" ha sido reprogramada para el ${new Date(additionalData?.rescheduled_date || '').toLocaleDateString('es-CO')} a las ${additionalData?.rescheduled_time}`;
            break;
          case 'completed':
            notificationType = 'visit_reminder'; // Reuse for completion
            title = 'Visita Completada';
            message = `Tu visita a "${visit.property_title}" ha sido marcada como completada`;
            break;
          default:
            return { success: true };
        }

        await supabase.from('notifications').insert({
          user_id: visit.buyer_id,
          type: notificationType,
          title,
          message,
          data: { visit_id: visitId, status: newStatus }
        });

        // Log the status change
        await supabase.from('audit_logs').insert({
          user_id: visit.buyer_id,
          action_type: `visit_${newStatus}`,
          resource_type: 'visit',
          resource_id: visitId,
          changes: {
            old_status: visit.status,
            new_status: newStatus,
            ...additionalData
          }
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating visit status:', error);
      return { success: false, error: error.message };
    }
  };

  const reassignVisit = async (visitId: string, newAgentId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          assigned_agent: newAgentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      // Get agent details for notification
      const { data: agent, error: agentError } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', newAgentId)
        .single();

      if (agentError) throw agentError;

      // Update local state
      setVisits(prev => prev.map(visit =>
        visit.id === visitId ? {
          ...visit,
          assigned_agent: newAgentId,
          agent_name: agent.name,
          agent_email: agent.email
        } : visit
      ));

      // Notify the buyer about reassignment
      const visit = visits.find(v => v.id === visitId);
      if (visit) {
        await supabase.from('notifications').insert({
          user_id: visit.buyer_id,
          type: 'visit_reminder', // Reuse for reassignment
          title: 'Visita Reasignada',
          message: `Tu visita a "${visit.property_title}" ha sido reasignada. Nuevo agente: ${agent.name}`,
          data: { visit_id: visitId, new_agent: newAgentId }
        });

        // Log the reassignment
        await supabase.from('audit_logs').insert({
          user_id: visit.buyer_id,
          action_type: 'visit_reassigned',
          resource_type: 'visit',
          resource_id: visitId,
          changes: {
            old_agent: visit.assigned_agent,
            new_agent: newAgentId,
            agent_name: agent.name
          }
        });
      }

      toast.success('Visita reasignada exitosamente');
      return { success: true };
    } catch (error: any) {
      console.error('Error reassigning visit:', error);
      toast.error('Error al reasignar visita');
      return { success: false, error: error.message };
    }
  };

  const bulkUpdateStatus = async (visitIds: string[], newStatus: AdminVisit['status'], reason?: string) => {
    try {
      for (const visitId of visitIds) {
        const result = await updateVisitStatus(visitId, newStatus, { cancellation_reason: reason });
        if (!result.success) {
          throw new Error(result.error);
        }
      }

      toast.success(`${visitIds.length} visita${visitIds.length !== 1 ? 's' : ''} actualizada${visitIds.length !== 1 ? 's' : ''}`);
      return { success: true };
    } catch (error: any) {
      console.error('Error bulk updating visits:', error);
      toast.error('Error en actualización masiva');
      return { success: false, error: error.message };
    }
  };

  const getAvailableAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('role', ['admin', 'agent', 'super_admin'])
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      return [];
    }
  };

  const exportVisits = () => {
    const csvData = visits.map(v => ({
      'ID Visita': v.id,
      'Propiedad': v.property_title || '',
      'Dirección': v.property_address || '',
      'Comprador': v.buyer_name || '',
      'Email Comprador': v.buyer_email || '',
      'Teléfono': v.buyer_phone || '',
      'Agente Asignado': v.agent_name || '',
      'Email Agente': v.agent_email || '',
      'Fecha Programada': new Date(v.scheduled_date).toLocaleDateString('es-CO'),
      'Hora': v.scheduled_time,
      'Estado': v.status,
      'Notas': v.notes || '',
      'Notas Admin': v.admin_notes || '',
      'Fecha Creación': new Date(v.created_at).toLocaleDateString('es-CO'),
      'Rating Feedback': v.feedback_rating || '',
      'Comentario Feedback': v.feedback_comment || ''
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
    a.download = `visitas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Archivo exportado exitosamente');
  };

  const getStats = () => {
    const total = visits.length;
    const pending = visits.filter(v => v.status === 'pending').length;
    const confirmed = visits.filter(v => v.status === 'confirmed').length;
    const completed = visits.filter(v => v.status === 'completed').length;
    const cancelled = visits.filter(v => v.status === 'cancelled').length;
    const noShow = visits.filter(v => v.status === 'no_show').length;

    const today = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter(v => v.scheduled_date === today).length;

    const avgRating = visits
      .filter(v => v.feedback_rating)
      .reduce((sum, v) => sum + (v.feedback_rating || 0), 0) /
      visits.filter(v => v.feedback_rating).length || 0;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      noShow,
      todayVisits,
      avgRating
    };
  };

  return {
    visits,
    loading,
    error,
    totalCount,
    fetchVisits,
    updateVisitStatus,
    reassignVisit,
    bulkUpdateStatus,
    getAvailableAgents,
    exportVisits,
    getStats
  };
};
