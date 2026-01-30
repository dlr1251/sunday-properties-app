import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';
import { 
  UserRole, 
  VerificationStatus,
  UserFilters,
  UpdateUserRoleInput,
  UpdateVerificationInput,
  CreateUserInput,
  BulkUserActionsInput 
} from '../../validation/users.schema';

// User profile interface (matching database schema)
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  verification_status: VerificationStatus;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields
  properties_count?: number;
  offers_count?: number;
  visits_count?: number;
}

export class UsersRepository {
  /**
   * Get users with filters
   */
  async getUsers(filters: UserFilters = {}): Promise<Result<UserProfile[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      if (filters.verificationStatus && filters.verificationStatus !== 'all') {
        query = query.eq('verification_status', filters.verificationStatus);
      }
      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%
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
        logError('Failed to fetch users', { filters, error });
        throw createDatabaseError('Error al cargar los usuarios', error);
      }

      // Transform data and add computed fields
      const users = (data || []).map(user => ({
        ...user,
        properties_count: 0, // Will be calculated separately when needed
        offers_count: 0,     // Will be calculated separately when needed
        visits_count: 0      // Will be calculated separately when needed
      }));

      return users;
    });
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(id: string): Promise<Result<UserProfile, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          properties:properties!properties_owner_id_fkey(count),
          offers:offers!offers_buyer_id_fkey(count),
          visits:visits!visits_visitor_id_fkey(count)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('User', id);
        }
        logError('Failed to fetch user', { id, error });
        throw createDatabaseError('Error al cargar el usuario', error);
      }

      // Transform data and add computed fields
      const user = {
        ...data,
        properties_count: data.properties?.[0]?.count || 0,
        offers_count: data.offers?.[0]?.count || 0,
        visits_count: data.visits?.[0]?.count || 0
      };

      return user;
    });
  }

  /**
   * Update user role
   */
  async updateUserRole(input: UpdateUserRoleInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          role: input.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.userId);

      if (error) {
        logError('Failed to update user role', { input, error });
        throw createDatabaseError('Error al actualizar el rol del usuario', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: input.userId,
          action: 'role_updated',
          details: {
            old_role: 'unknown', // Would need to fetch previous value
            new_role: input.role,
            reason: input.reason,
            notes: input.notes,
            updated_by: userData.user.id
          }
        });

      return undefined;
    });
  }

  /**
   * Update verification status
   */
  async updateVerificationStatus(input: UpdateVerificationInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          verification_status: input.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.userId);

      if (error) {
        logError('Failed to update verification status', { input, error });
        throw createDatabaseError('Error al actualizar el estado de verificación', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: input.userId,
          action: 'verification_updated',
          details: {
            new_status: input.status,
            notes: input.notes,
            documents: input.documents,
            updated_by: userData.user.id
          }
        });

      return undefined;
    });
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      // First, check if user has any active data
      const { data: userData_check } = await supabase
        .from('profiles')
        .select(`
          properties:properties!properties_owner_id_fkey(count),
          offers:offers!offers_buyer_id_fkey(count),
          visits:visits!visits_visitor_id_fkey(count)
        `)
        .eq('id', userId)
        .single();

      if (userData_check) {
        const hasProperties = (userData_check.properties?.[0]?.count || 0) > 0;
        const hasOffers = (userData_check.offers?.[0]?.count || 0) > 0;
        const hasVisits = (userData_check.visits?.[0]?.count || 0) > 0;

        if (hasProperties || hasOffers || hasVisits) {
          throw new AppError(
            'No se puede eliminar el usuario porque tiene propiedades, ofertas o visitas asociadas',
            'BUSINESS_ERROR'
          );
        }
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        logError('Failed to delete user', { userId, error });
        throw createDatabaseError('Error al eliminar el usuario', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'user_deleted',
          details: {
            deleted_by: userData.user.id,
            deleted_at: new Date().toISOString()
          }
        });

      return undefined;
    });
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(input: CreateUserInput): Promise<Result<UserProfile, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', input.email)
        .single();

      if (existingUser) {
        throw new AppError('Ya existe un usuario con este email', 'BUSINESS_ERROR');
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          email: input.email,
          name: input.name,
          phone: input.phone,
          role: input.role,
          verification_status: input.verificationStatus,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          properties:properties!properties_owner_id_fkey(count),
          offers:offers!offers_buyer_id_fkey(count),
          visits:visits!visits_visitor_id_fkey(count)
        `)
        .single();

      if (error) {
        logError('Failed to create user', { input, error });
        throw createDatabaseError('Error al crear el usuario', error);
      }

      // Transform data and add computed fields
      const user = {
        ...data,
        properties_count: data.properties?.[0]?.count || 0,
        offers_count: data.offers?.[0]?.count || 0,
        visits_count: data.visits?.[0]?.count || 0
      };

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: data.id,
          action: 'user_created',
          details: {
            created_by: userData.user.id,
            created_at: new Date().toISOString(),
            role: input.role,
            verification_status: input.verificationStatus
          }
        });

      return user;
    });
  }

  /**
   * Bulk user actions
   */
  async bulkUserActions(input: BulkUserActionsInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      for (const userId of input.userIds) {
        switch (input.action) {
          case 'update_role':
            if (input.role) {
              await this.updateUserRole({
                userId,
                role: input.role,
                reason: input.reason,
                notes: input.notes
              });
            }
            break;
          case 'update_verification':
            if (input.verificationStatus) {
              await this.updateVerificationStatus({
                userId,
                status: input.verificationStatus,
                notes: input.notes
              });
            }
            break;
          case 'delete':
            await this.deleteUser(userId);
            break;
          case 'suspend':
            // Implement suspension logic
            await supabase
              .from('profiles')
              .update({
                role: 'suspended',
                updated_at: new Date().toISOString()
              })
              .eq('id', userId);
            break;
        }
      }

      return undefined;
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<Result<{
    total: number;
    byRole: Record<UserRole, number>;
    byVerificationStatus: Record<VerificationStatus, number>;
    newToday: number;
    activeUsers: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, verification_status, created_at');

      if (error) {
        logError('Failed to fetch user stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de usuarios', error);
      }

      const today = new Date().toISOString().split('T')[0];
      const newToday = data?.filter(u => u.created_at.startsWith(today)).length || 0;
      const activeUsers = 0; // Will be calculated separately when needed

      const byRole = data?.reduce((acc, user) => {
        acc[user.role as UserRole] = (acc[user.role as UserRole] || 0) + 1;
        return acc;
      }, {} as Record<UserRole, number>) || {};

      const byVerificationStatus = data?.reduce((acc, user) => {
        acc[user.verification_status as VerificationStatus] = (acc[user.verification_status as VerificationStatus] || 0) + 1;
        return acc;
      }, {} as Record<VerificationStatus, number>) || {};

      return {
        total: data?.length || 0,
        byRole,
        byVerificationStatus,
        newToday,
        activeUsers
      };
    });
  }
}

// Export singleton instance
export const usersRepository = new UsersRepository();
