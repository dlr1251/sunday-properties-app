import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface VisitAvailability {
  id: string;
  property_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  advance_booking_days: number;
  max_visits_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlockedDate {
  id: string;
  property_id: string;
  blocked_date: string;
  reason?: string;
  created_by: string;
  created_at: string;
}

export const useVisitAvailability = (propertyId: string) => {
  const [availability, setAvailability] = useState<VisitAvailability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('property_visit_availability')
        .select('*')
        .eq('property_id', propertyId)
        .order('day_of_week', { ascending: true });

      if (fetchError) throw fetchError;

      setAvailability(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar disponibilidad';
      setError(message);
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  const fetchBlockedDates = useCallback(async () => {
    if (!propertyId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('blocked_dates')
        .select('*')
        .eq('property_id', propertyId)
        .order('blocked_date', { ascending: true });

      if (fetchError) throw fetchError;

      setBlockedDates(data || []);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
    }
  }, [propertyId]);

  const saveAvailability = useCallback(async (
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    advanceBookingDays: number = 1,
    maxVisitsPerDay: number = 3
  ) => {
    try {
      // Check if availability already exists for this day
      const existing = availability.find(a => a.day_of_week === dayOfWeek);

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('property_visit_availability')
          .update({
            start_time: startTime,
            end_time: endTime,
            advance_booking_days: advanceBookingDays,
            max_visits_per_day: maxVisitsPerDay,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        toast.success('Disponibilidad actualizada');
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('property_visit_availability')
          .insert({
            property_id: propertyId,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            advance_booking_days: advanceBookingDays,
            max_visits_per_day: maxVisitsPerDay,
            is_active: true
          });

        if (insertError) throw insertError;
        toast.success('Disponibilidad agregada');
      }

      await fetchAvailability();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar disponibilidad';
      toast.error(message);
      console.error('Error saving availability:', err);
      return false;
    }
  }, [propertyId, availability, fetchAvailability]);

  const deleteAvailability = useCallback(async (availabilityId: string) => {
    try {
      const { error } = await supabase
        .from('property_visit_availability')
        .delete()
        .eq('id', availabilityId);

      if (error) throw error;

      toast.success('Disponibilidad eliminada');
      await fetchAvailability();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar disponibilidad';
      toast.error(message);
      console.error('Error deleting availability:', err);
      return false;
    }
  }, [fetchAvailability]);

  const toggleAvailability = useCallback(async (availabilityId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('property_visit_availability')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', availabilityId);

      if (error) throw error;

      toast.success(isActive ? 'Disponibilidad activada' : 'Disponibilidad desactivada');
      await fetchAvailability();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar disponibilidad';
      toast.error(message);
      console.error('Error toggling availability:', err);
      return false;
    }
  }, [fetchAvailability]);

  const addBlockedDate = useCallback(async (date: string, reason?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuario no autenticado');

      const { error } = await supabase
        .from('blocked_dates')
        .insert({
          property_id: propertyId,
          blocked_date: date,
          reason: reason,
          created_by: userData.user.id
        });

      if (error) throw error;

      toast.success('Fecha bloqueada');
      await fetchBlockedDates();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al bloquear fecha';
      toast.error(message);
      console.error('Error adding blocked date:', err);
      return false;
    }
  }, [propertyId, fetchBlockedDates]);

  const removeBlockedDate = useCallback(async (blockedDateId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_dates')
        .delete()
        .eq('id', blockedDateId);

      if (error) throw error;

      toast.success('Fecha desbloqueada');
      await fetchBlockedDates();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al desbloquear fecha';
      toast.error(message);
      console.error('Error removing blocked date:', err);
      return false;
    }
  }, [fetchBlockedDates]);

  return {
    availability,
    blockedDates,
    loading,
    error,
    fetchAvailability,
    fetchBlockedDates,
    saveAvailability,
    deleteAvailability,
    toggleAvailability,
    addBlockedDate,
    removeBlockedDate
  };
};

