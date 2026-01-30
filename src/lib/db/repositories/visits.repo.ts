import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';
import { 
  VisitStatus, 
  RescheduleVisitInput, 
  VisitNotesInput, 
  UpdateVisitStatusInput,
  VisitFilters,
  CreateVisitInput 
} from '../../validation/visits.schema';

// Visit interface (matching database schema)
export interface Visit {
  id: string;
  property_id: string;
  visitor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: VisitStatus;
  visit_price: number;
  paid: boolean;
  payment_method?: 'cash' | 'card' | 'crypto';
  nda_accepted: boolean;
  feedback?: string;
  rating?: number;
  notes?: string;
  seller_notes?: string;
  documents_unlocked: boolean;
  reschedule_count?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  // Joined data
  property?: {
    id: string;
    title: string;
    address: string;
    neighborhood: string;
    city: string;
    owner_id: string;
  };
  visitor?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  type?: 'incoming' | 'scheduled';
}

export class VisitsRepository {
  /**
   * Get visits for a specific user
   */
  async getVisitsByUser(
    userId: string, 
    type?: 'incoming' | 'scheduled',
    filters?: VisitFilters
  ): Promise<Result<Visit[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('visits')
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      // Apply user filter based on type
      if (type === 'incoming') {
        // Visits to properties owned by the user
        query = query.eq('property.owner_id', userId);
      } else if (type === 'scheduled') {
        // Visits scheduled by the user
        query = query.eq('visitor_id', userId);
      } else {
        // All visits (for admin)
        // No additional filter needed
      }

      // Apply additional filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('scheduled_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('scheduled_date', filters.dateTo);
      }
      if (filters?.search) {
        query = query.or(`
          property.title.ilike.%${filters.search}%,
          property.address.ilike.%${filters.search}%,
          visitor.name.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch visits', { userId, type, error });
        throw createDatabaseError('Error al cargar las visitas', error);
      }

      // Transform data and add type information
      const visits = (data || []).map(visit => ({
        ...visit,
        type: visit.property?.owner_id === userId ? 'incoming' : 'scheduled'
      }));

      return visits;
    });
  }

  /**
   * Get a specific visit by ID
   */
  async getVisitById(id: string): Promise<Result<Visit, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Visit', id);
        }
        logError('Failed to fetch visit', { id, error });
        throw createDatabaseError('Error al cargar la visita', error);
      }

      return data;
    });
  }

  /**
   * Update visit status
   */
  async updateVisitStatus(
    id: string, 
    status: VisitStatus, 
    notes?: string,
    reason?: string
  ): Promise<Result<Visit, AppError>> {
    return tryCatch(async () => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }
      if (reason) {
        updateData.cancellation_reason = reason;
      }
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to update visit status', { id, status, error });
        throw createDatabaseError('Error al actualizar el estado de la visita', error);
      }

      return data;
    });
  }

  /**
   * Reschedule a visit
   */
  async rescheduleVisit(input: RescheduleVisitInput): Promise<Result<Visit, AppError>> {
    return tryCatch(async () => {
      // First, get current visit to check reschedule_count
      const { data: currentVisit, error: fetchError } = await supabase
        .from('visits')
        .select('reschedule_count, notes')
        .eq('id', input.visitId)
        .single();

      if (fetchError) {
        logError('Failed to fetch visit for reschedule', { input, error: fetchError });
        throw createDatabaseError('Error al obtener la visita', fetchError);
      }

      const currentRescheduleCount = currentVisit?.reschedule_count || 0;
      const newRescheduleCount = currentRescheduleCount + 1;
      
      // Build notes with reschedule reason
      const existingNotes = currentVisit?.notes || '';
      const rescheduleNote = `\n[Reprogramada #${newRescheduleCount}] ${input.reason || 'Sin razón especificada'} - ${new Date().toLocaleString('es-CO')}`;
      const updatedNotes = existingNotes ? `${existingNotes}${rescheduleNote}` : rescheduleNote.trim();

      const { data, error } = await supabase
        .from('visits')
        .update({
          scheduled_date: input.scheduledDate,
          scheduled_time: input.scheduledTime,
          status: 'confirmed',
          reschedule_count: newRescheduleCount,
          updated_at: new Date().toISOString(),
          notes: updatedNotes
        })
        .eq('id', input.visitId)
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to reschedule visit', { input, error });
        throw createDatabaseError('Error al reprogramar la visita', error);
      }

      return data;
    });
  }

  /**
   * Add notes to a visit
   */
  async addNotes(input: VisitNotesInput): Promise<Result<Visit, AppError>> {
    return tryCatch(async () => {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (input.type === 'seller') {
        updateData.seller_notes = input.notes;
      } else {
        updateData.notes = input.notes;
      }

      const { data, error } = await supabase
        .from('visits')
        .update(updateData)
        .eq('id', input.visitId)
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to add visit notes', { input, error });
        throw createDatabaseError('Error al agregar notas a la visita', error);
      }

      return data;
    });
  }

  /**
   * Create a new visit
   */
  async createVisit(input: CreateVisitInput): Promise<Result<Visit, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('visits')
        .insert({
          property_id: input.propertyId,
          visitor_id: (await supabase.auth.getUser()).data.user?.id,
          scheduled_date: input.scheduledDate,
          scheduled_time: input.scheduledTime,
          status: 'pending',
          visit_price: 0, // This should be fetched from property
          paid: false,
          nda_accepted: input.ndaAccepted,
          notes: input.notes,
          visitor_name: input.visitorName,
          visitor_phone: input.visitorPhone,
          visitor_email: input.visitorEmail
        })
        .select(`
          *,
          property:properties!visits_property_id_fkey (
            id,
            title,
            address,
            neighborhood,
            city,
            owner_id
          ),
          visitor:profiles!visits_visitor_id_fkey (
            id,
            name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to create visit', { input, error });
        throw createDatabaseError('Error al crear la visita', error);
      }

      return data;
    });
  }

  /**
   * Cancel a visit
   */
  async cancelVisit(id: string, reason: string): Promise<Result<Visit, AppError>> {
    return this.updateVisitStatus(id, 'cancelled', undefined, reason);
  }

  /**
   * Get visit statistics for a user
   */
  async getVisitStats(userId: string): Promise<Result<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('visits')
        .select('status')
        .or(`visitor_id.eq.${userId},property.owner_id.eq.${userId}`);

      if (error) {
        logError('Failed to fetch visit stats', { userId, error });
        throw createDatabaseError('Error al cargar estadísticas de visitas', error);
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(v => v.status === 'pending').length || 0,
        confirmed: data?.filter(v => v.status === 'confirmed').length || 0,
        completed: data?.filter(v => v.status === 'completed').length || 0,
        cancelled: data?.filter(v => v.status === 'cancelled').length || 0,
      };

      return stats;
    });
  }
}

// Export singleton instance
export const visitsRepository = new VisitsRepository();
