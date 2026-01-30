import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Visit {
  id: string;
  property_id: string;
  visitor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  visit_price: number;
  paid: boolean;
  payment_method?: 'cash' | 'card' | 'crypto';
  nda_accepted: boolean;
  feedback?: string;
  rating?: number;
  notes?: string;
  documents_unlocked: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Joined data
  property?: {
    id: string;
    title: string;
    address: string;
    owner_id: string;
  };
  visitor?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface VisitRequest {
  id: string;
  property_id: string;
  requester_id: string;
  requested_date: string;
  requested_time: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  owner_notes?: string;
  responded_at?: string;
  visit_notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useVisits = (userId?: string) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVisits = useCallback(async (filters?: {
    propertyId?: string;
    visitorId?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 useVisits.fetchVisits called with filters:', filters);
      
      let query = supabase
        .from('visits')
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .order('scheduled_date', { ascending: false });

      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }
      if (filters?.visitorId) {
        console.log('Filtering by visitor_id:', filters.visitorId);
        query = query.eq('visitor_id', filters.visitorId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Error fetching visits:', fetchError);
        throw fetchError;
      }

      console.log(`✅ Found ${data?.length || 0} visits`, data);
      setVisits(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar visitas';
      setError(message);
      console.error('❌ Error fetching visits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVisitRequests = useCallback(async (propertyId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('visit_requests')
        .select('*')
        .eq('property_id', propertyId)
        .order('requested_date', { ascending: false });

      if (fetchError) throw fetchError;

      setVisitRequests(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      setError(message);
      console.error('Error fetching visit requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createVisitRequest = useCallback(async (
    propertyId: string,
    requestedDate: string,
    requestedTime: string
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('visit_requests')
        .insert({
          property_id: propertyId,
          requester_id: userData.user.id,
          requested_date: requestedDate,
          requested_time: requestedTime,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Solicitud de visita enviada');
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear solicitud';
      toast.error(message);
      console.error('Error creating visit request:', err);
      return { success: false, error: message };
    }
  }, []);

  const confirmVisitRequest = useCallback(async (
    requestId: string,
    ownerNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('visit_requests')
        .update({
          status: 'confirmed',
          owner_notes: ownerNotes,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Visita confirmada');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al confirmar visita';
      toast.error(message);
      console.error('Error confirming visit:', err);
      return false;
    }
  }, []);

  const rejectVisitRequest = useCallback(async (
    requestId: string,
    ownerNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('visit_requests')
        .update({
          status: 'rejected',
          owner_notes: ownerNotes,
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Visita rechazada');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al rechazar visita';
      toast.error(message);
      console.error('Error rejecting visit:', err);
      return false;
    }
  }, []);

  const createVisit = useCallback(async (visitData: {
    property_id: string;
    visitor_id: string;
    scheduled_date: string;
    scheduled_time: string;
    visit_price: number;
    payment_method?: 'cash' | 'card' | 'crypto';
  }) => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          ...visitData,
          status: 'pending',
          paid: false,
          nda_accepted: false,
          documents_unlocked: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Visita agendada');
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al agendar visita';
      toast.error(message);
      console.error('Error creating visit:', err);
      return { success: false, error: message };
    }
  }, []);

  const updateVisitStatus = useCallback(async (
    visitId: string,
    status: Visit['status'],
    notes?: string
  ) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.documents_unlocked = true; // Unlock documents on completion
      }

      const { error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', visitId);

      if (error) throw error;

      toast.success('Estado de visita actualizado');
      await fetchVisits();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar visita';
      toast.error(message);
      console.error('Error updating visit status:', err);
      return false;
    }
  }, [fetchVisits]);

  const markVisitAsPaid = useCallback(async (
    visitId: string,
    paymentMethod: 'cash' | 'card' | 'crypto'
  ) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          paid: true,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast.success('Pago registrado');
      await fetchVisits();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al registrar pago';
      toast.error(message);
      console.error('Error marking visit as paid:', err);
      return false;
    }
  }, [fetchVisits]);

  const acceptNDA = useCallback(async (visitId: string) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          nda_accepted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast.success('NDA aceptado');
      await fetchVisits();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al aceptar NDA';
      toast.error(message);
      console.error('Error accepting NDA:', err);
      return false;
    }
  }, [fetchVisits]);

  const submitFeedback = useCallback(async (
    visitId: string,
    feedback: string,
    rating: number
  ) => {
    try {
      const { error } = await supabase
        .from('visits')
        .update({
          feedback,
          rating,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitId);

      if (error) throw error;

      toast.success('Feedback enviado');
      await fetchVisits();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar feedback';
      toast.error(message);
      console.error('Error submitting feedback:', err);
      return false;
    }
  }, [fetchVisits]);

  const checkUserHasVisited = useCallback(async (
    propertyId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('id')
        .eq('property_id', propertyId)
        .eq('visitor_id', userId)
        .eq('status', 'completed')
        .limit(1);

      if (error) throw error;

      return (data?.length || 0) > 0;
    } catch (err) {
      console.error('Error checking visit status:', err);
      return false;
    }
  }, []);

  return {
    visits,
    visitRequests,
    loading,
    error,
    fetchVisits,
    fetchVisitRequests,
    createVisitRequest,
    confirmVisitRequest,
    rejectVisitRequest,
    createVisit,
    updateVisitStatus,
    markVisitAsPaid,
    acceptNDA,
    submitFeedback,
    checkUserHasVisited
  };
};
