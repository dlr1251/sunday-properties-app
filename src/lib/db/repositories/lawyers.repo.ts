import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';

// Lawyer profile interface (extending user profile)
export interface LawyerProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'lawyer';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  // Lawyer-specific fields
  bio?: string;
  company?: string;
  license_number?: string;
  specializations?: string[];
  languages?: string[];
  experience_years?: number;
  verified_at?: string;
  avatar_url?: string;
  // Computed fields
  cases_count?: number;
  active_cases_count?: number;
  completed_cases_count?: number;
  rating?: number;
  reviews_count?: number;
}

// Lawyer filters
export interface LawyerFilters {
  search?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  specializations?: string[];
  experience_min?: number;
  experience_max?: number;
  languages?: string[];
  dateFrom?: string;
  dateTo?: string;
}

// Create lawyer input
export interface CreateLawyerInput {
  email: string;
  name: string;
  phone?: string;
  bio?: string;
  company?: string;
  license_number?: string;
  specializations?: string[];
  languages?: string[];
  experience_years?: number;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

// Update lawyer input
export interface UpdateLawyerInput {
  id: string;
  name?: string;
  phone?: string;
  bio?: string;
  company?: string;
  license_number?: string;
  specializations?: string[];
  languages?: string[];
  experience_years?: number;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
}

export class LawyersRepository {
  /**
   * Get lawyers with filters
   */
  async getLawyers(filters: LawyerFilters = {}): Promise<Result<LawyerProfile[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          cases:cases(id, status)
        `)
        .eq('role', 'lawyer')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }
      if (filters.search) {
        query = query.or(`
          full_name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%,
          company.ilike.%${filters.search}%
        `);
      }
      if (filters.specializations && filters.specializations.length > 0) {
        query = query.overlaps('specializations', filters.specializations);
      }
      if (filters.languages && filters.languages.length > 0) {
        query = query.overlaps('languages', filters.languages);
      }
      if (filters.experience_min !== undefined) {
        query = query.gte('experience_years', filters.experience_min);
      }
      if (filters.experience_max !== undefined) {
        query = query.lte('experience_years', filters.experience_max);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch lawyers', { filters, error });
        throw createDatabaseError('Error al cargar los abogados', error);
      }

      // Transform data and calculate counts from cases array
      const lawyers = (data || []).map(lawyer => {
        const cases = lawyer.cases || [];
        const cases_count = cases.length;
        const active_cases_count = cases.filter((c: any) => c.status === 'active').length;
        const completed_cases_count = cases.filter((c: any) => c.status === 'completed' || c.status === 'closed').length;

        return {
          ...lawyer,
          name: lawyer.full_name || lawyer.name,
          cases_count,
          active_cases_count,
          completed_cases_count,
          rating: 4.5, // Would be calculated from reviews
          reviews_count: 0, // Would be counted from reviews table
        };
      });

      return lawyers;
    });
  }

  /**
   * Get a specific lawyer by ID
   */
  async getLawyerById(id: string): Promise<Result<LawyerProfile, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          cases:cases(id, status)
        `)
        .eq('id', id)
        .eq('role', 'lawyer')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Lawyer', id);
        }
        logError('Failed to fetch lawyer', { id, error });
        throw createDatabaseError('Error al cargar el abogado', error);
      }

      // Calculate counts from cases array
      const cases = data.cases || [];
      const cases_count = cases.length;
      const active_cases_count = cases.filter((c: any) => c.status === 'active').length;
      const completed_cases_count = cases.filter((c: any) => c.status === 'completed' || c.status === 'closed').length;

      // Transform data and add computed fields
      const lawyer = {
        ...data,
        name: data.full_name || data.name,
        cases_count,
        active_cases_count,
        completed_cases_count,
        rating: 4.5, // Would be calculated from reviews
        reviews_count: 0, // Would be counted from reviews table
      };

      return lawyer;
    });
  }

  /**
   * Create a new lawyer
   */
  async createLawyer(input: CreateLawyerInput): Promise<Result<LawyerProfile, AppError>> {
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
          role: 'lawyer',
          verification_status: input.verification_status || 'unverified',
          bio: input.bio,
          company: input.company,
          license_number: input.license_number,
          specializations: input.specializations,
          languages: input.languages,
          experience_years: input.experience_years,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          cases:cases(id, status)
        `)
        .single();

      if (error) {
        logError('Failed to create lawyer', { input, error });
        throw createDatabaseError('Error al crear el abogado', error);
      }

      // Calculate counts from cases array
      const cases = data.cases || [];
      const cases_count = cases.length;
      const active_cases_count = cases.filter((c: any) => c.status === 'active').length;
      const completed_cases_count = cases.filter((c: any) => c.status === 'completed' || c.status === 'closed').length;

      // Transform data and add computed fields
      const lawyer = {
        ...data,
        name: data.full_name || data.name,
        cases_count,
        active_cases_count,
        completed_cases_count,
        rating: 4.5,
        reviews_count: 0,
      };

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: data.id,
          action: 'lawyer_created',
          details: {
            created_by: userData.user.id,
            created_at: new Date().toISOString(),
            specializations: input.specializations,
            experience_years: input.experience_years
          }
        });

      return lawyer;
    });
  }

  /**
   * Update lawyer profile
   */
  async updateLawyer(input: UpdateLawyerInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Only include fields that are provided
      if (input.name !== undefined) updateData.name = input.name;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.company !== undefined) updateData.company = input.company;
      if (input.license_number !== undefined) updateData.license_number = input.license_number;
      if (input.specializations !== undefined) updateData.specializations = input.specializations;
      if (input.languages !== undefined) updateData.languages = input.languages;
      if (input.experience_years !== undefined) updateData.experience_years = input.experience_years;
      if (input.verification_status !== undefined) updateData.verification_status = input.verification_status;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', input.id)
        .eq('role', 'lawyer');

      if (error) {
        logError('Failed to update lawyer', { input, error });
        throw createDatabaseError('Error al actualizar el abogado', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: input.id,
          action: 'lawyer_updated',
          details: {
            updated_by: userData.user.id,
            changes: updateData,
            updated_at: new Date().toISOString()
          }
        });

      return undefined;
    });
  }

  /**
   * Delete a lawyer
   */
  async deleteLawyer(lawyerId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      // Check if lawyer has active cases
      const { data: lawyerData } = await supabase
        .from('profiles')
        .select(`
          cases:cases(id, status)
        `)
        .eq('id', lawyerId)
        .eq('role', 'lawyer')
        .single();

      const activeCases = (lawyerData?.cases || []).filter((c: any) => c.status === 'active');
      if (activeCases.length > 0) {
        throw new AppError(
          'No se puede eliminar el abogado porque tiene casos activos',
          'BUSINESS_ERROR'
        );
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', lawyerId)
        .eq('role', 'lawyer');

      if (error) {
        logError('Failed to delete lawyer', { lawyerId, error });
        throw createDatabaseError('Error al eliminar el abogado', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: lawyerId,
          action: 'lawyer_deleted',
          details: {
            deleted_by: userData.user.id,
            deleted_at: new Date().toISOString()
          }
        });

      return undefined;
    });
  }

  /**
   * Get lawyer statistics
   */
  async getLawyerStats(): Promise<Result<{
    total: number;
    verified: number;
    pending: number;
    active_cases: number;
    completed_cases: number;
    average_rating: number;
    top_specializations: Array<{ specialization: string; count: number }>;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, specializations, cases:cases(status)')
        .eq('role', 'lawyer');

      if (error) {
        logError('Failed to fetch lawyer stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de abogados', error);
      }

      const total = data?.length || 0;
      const verified = data?.filter(l => l.verification_status === 'verified').length || 0;
      const pending = data?.filter(l => l.verification_status === 'pending').length || 0;

      const allCases = data?.flatMap(l => l.cases || []) || [];
      const active_cases = allCases.filter(c => c.status === 'active').length;
      const completed_cases = allCases.filter(c => c.status === 'completed').length;

      // Calculate top specializations
      const specializationCount: Record<string, number> = {};
      data?.forEach(lawyer => {
        lawyer.specializations?.forEach(spec => {
          specializationCount[spec] = (specializationCount[spec] || 0) + 1;
        });
      });

      const top_specializations = Object.entries(specializationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([specialization, count]) => ({ specialization, count }));

      return {
        total,
        verified,
        pending,
        active_cases,
        completed_cases,
        average_rating: 4.5, // Would be calculated from actual reviews
        top_specializations
      };
    });
  }
}

// Export singleton instance
export const lawyersRepository = new LawyersRepository();
