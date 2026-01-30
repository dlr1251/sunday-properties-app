import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';

// Agent profile interface (extending user profile)
export interface AgentProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'agent';
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected';
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  // Agent-specific fields
  bio?: string;
  company?: string;
  license_number?: string;
  specializations?: string[];
  languages?: string[];
  experience_years?: number;
  verified_at?: string;
  avatar_url?: string;
  // Computed fields
  properties_count?: number;
  active_properties_count?: number;
  sold_properties_count?: number;
  total_sales_value?: number;
  commission_earned?: number;
  rating?: number;
  reviews_count?: number;
}

// Agent filters
export interface AgentFilters {
  search?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  specializations?: string[];
  experience_min?: number;
  experience_max?: number;
  languages?: string[];
  performance_min?: number; // Minimum rating
  dateFrom?: string;
  dateTo?: string;
}

// Create agent input
export interface CreateAgentInput {
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

// Update agent input
export interface UpdateAgentInput {
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

export class AgentsRepository {
  /**
   * Get agents with filters
   */
  async getAgents(filters: AgentFilters = {}): Promise<Result<AgentProfile[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          properties:properties!properties_owner_id_fkey(count),
          active_properties:properties(count, status.eq.published),
          sold_properties:properties(count, status.eq.sold)
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
      }
      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
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
        logError('Failed to fetch agents', { filters, error });
        throw createDatabaseError('Error al cargar los agentes', error);
      }

      // Transform data and add computed fields
      const agents = (data || []).map(agent => ({
        ...agent,
        properties_count: agent.properties?.[0]?.count || 0,
        active_properties_count: agent.active_properties?.[0]?.count || 0,
        sold_properties_count: agent.sold_properties?.[0]?.count || 0,
        total_sales_value: 0, // Would be calculated from sold properties
        commission_earned: 0, // Would be calculated from commissions
        rating: 4.5, // Would be calculated from reviews
        reviews_count: 0, // Would be counted from reviews table
      }));

      return agents;
    });
  }

  /**
   * Get a specific agent by ID
   */
  async getAgentById(id: string): Promise<Result<AgentProfile, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          properties:properties!properties_owner_id_fkey(count),
          active_properties:properties(count, status.eq.published),
          sold_properties:properties(count, status.eq.sold)
        `)
        .eq('id', id)
        .eq('role', 'agent')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Agent', id);
        }
        logError('Failed to fetch agent', { id, error });
        throw createDatabaseError('Error al cargar el agente', error);
      }

      // Transform data and add computed fields
      const agent = {
        ...data,
        properties_count: data.properties?.[0]?.count || 0,
        active_properties_count: data.active_properties?.[0]?.count || 0,
        sold_properties_count: data.sold_properties?.[0]?.count || 0,
        total_sales_value: 0, // Would be calculated from sold properties
        commission_earned: 0, // Would be calculated from commissions
        rating: 4.5, // Would be calculated from reviews
        reviews_count: 0, // Would be counted from reviews table
      };

      return agent;
    });
  }

  /**
   * Create a new agent
   */
  async createAgent(input: CreateAgentInput): Promise<Result<AgentProfile, AppError>> {
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
          role: 'agent',
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
          properties:properties!properties_owner_id_fkey(count),
          active_properties:properties(count, status.eq.published),
          sold_properties:properties(count, status.eq.sold)
        `)
        .single();

      if (error) {
        logError('Failed to create agent', { input, error });
        throw createDatabaseError('Error al crear el agente', error);
      }

      // Transform data and add computed fields
      const agent = {
        ...data,
        properties_count: data.properties?.[0]?.count || 0,
        active_properties_count: data.active_properties?.[0]?.count || 0,
        sold_properties_count: data.sold_properties?.[0]?.count || 0,
        total_sales_value: 0,
        commission_earned: 0,
        rating: 4.5,
        reviews_count: 0,
      };

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: data.id,
          action: 'agent_created',
          details: {
            created_by: userData.user.id,
            created_at: new Date().toISOString(),
            specializations: input.specializations,
            experience_years: input.experience_years
          }
        });

      return agent;
    });
  }

  /**
   * Update agent profile
   */
  async updateAgent(input: UpdateAgentInput): Promise<Result<void, AppError>> {
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
        .eq('role', 'agent');

      if (error) {
        logError('Failed to update agent', { input, error });
        throw createDatabaseError('Error al actualizar el agente', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: input.id,
          action: 'agent_updated',
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
   * Delete an agent
   */
  async deleteAgent(agentId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      // Check if agent has active properties
      const { data: agentData } = await supabase
        .from('profiles')
        .select(`
          properties:properties(count, status.eq.published)
        `)
        .eq('id', agentId)
        .eq('role', 'agent')
        .single();

      if (agentData?.properties?.[0]?.count > 0) {
        throw new AppError(
          'No se puede eliminar el agente porque tiene propiedades activas',
          'BUSINESS_ERROR'
        );
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', agentId)
        .eq('role', 'agent');

      if (error) {
        logError('Failed to delete agent', { agentId, error });
        throw createDatabaseError('Error al eliminar el agente', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: agentId,
          action: 'agent_deleted',
          details: {
            deleted_by: userData.user.id,
            deleted_at: new Date().toISOString()
          }
        });

      return undefined;
    });
  }

  /**
   * Get agent statistics
   */
  async getAgentStats(): Promise<Result<{
    total: number;
    verified: number;
    pending: number;
    active_properties: number;
    sold_properties: number;
    total_sales_value: number;
    average_rating: number;
    top_specializations: Array<{ specialization: string; count: number }>;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, specializations, properties:properties(status, price)')
        .eq('role', 'agent');

      if (error) {
        logError('Failed to fetch agent stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de agentes', error);
      }

      const total = data?.length || 0;
      const verified = data?.filter(a => a.verification_status === 'verified').length || 0;
      const pending = data?.filter(a => a.verification_status === 'pending').length || 0;

      const allProperties = data?.flatMap(a => a.properties || []) || [];
      const active_properties = allProperties.filter(p => p.status === 'published').length;
      const sold_properties = allProperties.filter(p => p.status === 'sold').length;
      const total_sales_value = allProperties
        .filter(p => p.status === 'sold')
        .reduce((sum, p) => sum + (p.price || 0), 0);

      // Calculate top specializations
      const specializationCount: Record<string, number> = {};
      data?.forEach(agent => {
        agent.specializations?.forEach(spec => {
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
        active_properties,
        sold_properties,
        total_sales_value,
        average_rating: 4.5, // Would be calculated from actual reviews
        top_specializations
      };
    });
  }
}

// Export singleton instance
export const agentsRepository = new AgentsRepository();
