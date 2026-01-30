import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';
import { VerificationStatus } from '../../validation/users.schema';

// Verification interface (matching database schema)
export interface Verification {
  id: string;
  user_id: string;
  verification_type: 'identity' | 'address' | 'income' | 'employment' | 'other';
  status: VerificationStatus;
  documents: string[];
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
  };
}

// Verification filters interface
export interface VerificationFilters {
  status?: string;
  verificationType?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export class VerificationsRepository {
  /**
   * Get verifications with filters
   */
  async getVerifications(filters: VerificationFilters = {}): Promise<Result<Verification[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('verifications')
        .select(`
          *,
          user:profiles!verifications_user_id_fkey (
            id,
            name,
            email
          ),
          reviewer:profiles!verifications_reviewed_by_fkey (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.verificationType && filters.verificationType !== 'all') {
        query = query.eq('verification_type', filters.verificationType);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.search) {
        query = query.or(`
          user.name.ilike.%${filters.search}%,
          user.email.ilike.%${filters.search}%,
          notes.ilike.%${filters.search}%
        `);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch verifications', { filters, error });
        throw createDatabaseError('Error al cargar las verificaciones', error);
      }

      return data || [];
    });
  }

  /**
   * Get a specific verification by ID
   */
  async getVerificationById(id: string): Promise<Result<Verification, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select(`
          *,
          user:profiles!verifications_user_id_fkey (
            id,
            name,
            email
          ),
          reviewer:profiles!verifications_reviewed_by_fkey (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Verification', id);
        }
        logError('Failed to fetch verification', { id, error });
        throw createDatabaseError('Error al cargar la verificación', error);
      }

      return data;
    });
  }

  /**
   * Update verification status
   */
  async updateVerificationStatus(
    id: string, 
    status: VerificationStatus, 
    notes?: string,
    rejectionReason?: string
  ): Promise<Result<Verification, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        status,
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        .from('verifications')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          user:profiles!verifications_user_id_fkey (
            id,
            name,
            email
          ),
          reviewer:profiles!verifications_reviewed_by_fkey (
            id,
            name
          )
        `)
        .single();

      if (error) {
        logError('Failed to update verification status', { id, status, error });
        throw createDatabaseError('Error al actualizar el estado de verificación', error);
      }

      // Update user verification status if approved
      if (status === 'verified') {
        await supabase
          .from('profiles')
          .update({
            verification_status: 'verified',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user_id);
      } else if (status === 'rejected') {
        await supabase
          .from('profiles')
          .update({
            verification_status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user_id);
      }

      return data;
    });
  }

  /**
   * Create a new verification request
   */
  async createVerification(
    userId: string,
    verificationType: string,
    documents: string[]
  ): Promise<Result<Verification, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('verifications')
        .insert({
          user_id: userId,
          verification_type: verificationType,
          status: 'pending',
          documents,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          user:profiles!verifications_user_id_fkey (
            id,
            name,
            email
          )
        `)
        .single();

      if (error) {
        logError('Failed to create verification', { userId, verificationType, error });
        throw createDatabaseError('Error al crear la solicitud de verificación', error);
      }

      return data;
    });
  }

  /**
   * Get verifications by user
   */
  async getVerificationsByUser(userId: string): Promise<Result<Verification[], AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select(`
          *,
          user:profiles!verifications_user_id_fkey (
            id,
            name,
            email
          ),
          reviewer:profiles!verifications_reviewed_by_fkey (
            id,
            name
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logError('Failed to fetch user verifications', { userId, error });
        throw createDatabaseError('Error al cargar las verificaciones del usuario', error);
      }

      return data || [];
    });
  }

  /**
   * Get verification statistics
   */
  async getVerificationStats(): Promise<Result<{
    total: number;
    pending: number;
    verified: number;
    rejected: number;
    byType: Record<string, number>;
    newToday: number;
    averageProcessingTime: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('verifications')
        .select('status, verification_type, created_at, reviewed_at');

      if (error) {
        logError('Failed to fetch verification stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de verificaciones', error);
      }

      const today = new Date().toISOString().split('T')[0];
      const newToday = data?.filter(v => v.created_at.startsWith(today)).length || 0;

      const byType = data?.reduce((acc, verification) => {
        acc[verification.verification_type] = (acc[verification.verification_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Calculate average processing time for completed verifications
      const completedVerifications = data?.filter(v => v.reviewed_at) || [];
      const processingTimes = completedVerifications.map(v => {
        const created = new Date(v.created_at);
        const reviewed = new Date(v.reviewed_at!);
        return reviewed.getTime() - created.getTime();
      });
      const averageProcessingTime = processingTimes.length 
        ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      return {
        total: data?.length || 0,
        pending: data?.filter(v => v.status === 'pending').length || 0,
        verified: data?.filter(v => v.status === 'verified').length || 0,
        rejected: data?.filter(v => v.status === 'rejected').length || 0,
        byType,
        newToday,
        averageProcessingTime
      };
    });
  }

  /**
   * Bulk update verification status
   */
  async bulkUpdateVerificationStatus(
    verificationIds: string[],
    status: VerificationStatus,
    notes?: string
  ): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        status,
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('verifications')
        .update(updateData)
        .in('id', verificationIds);

      if (error) {
        logError('Failed to bulk update verification status', { verificationIds, status, error });
        throw createDatabaseError('Error al actualizar el estado de las verificaciones', error);
      }

      return undefined;
    });
  }
}

// Export singleton instance
export const verificationsRepository = new VerificationsRepository();
