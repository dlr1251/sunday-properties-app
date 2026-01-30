import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';

// Deal interface (combining offer, property, and related data)
export interface Deal {
  id: string;
  offer_id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  agent_id?: string;
  lawyer_id?: string;
  status: 'draft' | 'active' | 'under_review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  offer_price: number;
  final_price?: number;
  currency: string;
  closing_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // Related data
  property?: {
    title: string;
    address: string;
    city: string;
    price: number;
    images: string[];
  };
  buyer?: {
    name: string;
    email: string;
    phone?: string;
  };
  seller?: {
    name: string;
    email: string;
    phone?: string;
  };
  agent?: {
    name: string;
    email: string;
    phone?: string;
  };
  lawyer?: {
    name: string;
    email: string;
    phone?: string;
  };
  contract_url?: string;
  last_activity?: string;
  progress_percentage?: number;
}

// Deal filters
export interface DealFilters {
  search?: string;
  status?: 'draft' | 'active' | 'under_review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  agent_id?: string;
  lawyer_id?: string;
  buyer_id?: string;
  seller_id?: string;
  dateFrom?: string;
  dateTo?: string;
  price_min?: number;
  price_max?: number;
}

// Create deal input
export interface CreateDealInput {
  offer_id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  agent_id?: string;
  lawyer_id?: string;
  status?: 'draft' | 'active' | 'under_review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
}

// Update deal input
export interface UpdateDealInput {
  id: string;
  status?: 'draft' | 'active' | 'under_review' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  agent_id?: string;
  lawyer_id?: string;
  final_price?: number;
  closing_date?: string;
  description?: string;
}

export class DealsRepository {
  /**
   * Get deals with filters
   */
  async getDeals(filters: DealFilters = {}): Promise<Result<Deal[], AppError>> {
    return tryCatch(async () => {
      // For now, we'll get offers and transform them into deals
      // In a full implementation, there would be a dedicated deals/cases table
      let query = supabase
        .from('offers')
        .select(`
          *,
          property:property_id (
            title,
            address,
            city,
            price,
            images
          ),
          buyer:buyer_id (
            name,
            email,
            phone
          ),
          seller:property_id (
            owner_id (
              name,
              email,
              phone
            )
          ),
          agent:agent_id (
            name,
            email,
            phone
          ),
          lawyer:lawyer_id (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }
      if (filters.lawyer_id) {
        query = query.eq('lawyer_id', filters.lawyer_id);
      }
      if (filters.buyer_id) {
        query = query.eq('buyer_id', filters.buyer_id);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.price_min !== undefined) {
        query = query.gte('offer_price', filters.price_min);
      }
      if (filters.price_max !== undefined) {
        query = query.lte('offer_price', filters.price_max);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch deals', { filters, error });
        throw createDatabaseError('Error al cargar las negociaciones', error);
      }

      // Transform offers into deals
      const deals = (data || []).map(offer => ({
        id: offer.id,
        offer_id: offer.id,
        property_id: offer.property_id,
        buyer_id: offer.buyer_id,
        seller_id: offer.property?.owner_id || '',
        agent_id: offer.agent_id,
        lawyer_id: offer.lawyer_id,
        status: this.mapOfferStatusToDealStatus(offer.status),
        priority: 'medium' as const, // Default priority
        offer_price: offer.offer_price,
        final_price: offer.offer_price, // For completed deals
        currency: offer.currency || 'COP',
        closing_date: offer.closing_date,
        description: offer.conditions,
        created_at: offer.created_at,
        updated_at: offer.updated_at,
        property: offer.property ? {
          title: offer.property.title,
          address: offer.property.address,
          city: offer.property.city,
          price: offer.property.price,
          images: offer.property.images || []
        } : undefined,
        buyer: offer.buyer ? {
          name: offer.buyer.name,
          email: offer.buyer.email,
          phone: offer.buyer.phone
        } : undefined,
        seller: offer.seller?.owner_id ? {
          name: offer.seller.owner_id.name,
          email: offer.seller.owner_id.email,
          phone: offer.seller.owner_id.phone
        } : undefined,
        agent: offer.agent ? {
          name: offer.agent.name,
          email: offer.agent.email,
          phone: offer.agent.phone
        } : undefined,
        lawyer: offer.lawyer ? {
          name: offer.lawyer.name,
          email: offer.lawyer.email,
          phone: offer.lawyer.phone
        } : undefined,
        last_activity: offer.updated_at,
        progress_percentage: this.calculateProgress(offer.status)
      }));

      return deals;
    });
  }

  /**
   * Map offer status to deal status
   */
  private mapOfferStatusToDealStatus(offerStatus: string): Deal['status'] {
    switch (offerStatus) {
      case 'pending':
        return 'active';
      case 'accepted':
        return 'completed';
      case 'rejected':
      case 'cancelled':
        return 'cancelled';
      case 'countered':
        return 'under_review';
      default:
        return 'draft';
    }
  }

  /**
   * Calculate deal progress percentage
   */
  private calculateProgress(status: string): number {
    switch (status) {
      case 'pending':
        return 25;
      case 'accepted':
        return 100;
      case 'countered':
        return 50;
      case 'cancelled':
      case 'rejected':
        return 0;
      default:
        return 10;
    }
  }

  /**
   * Get a specific deal by ID
   */
  async getDealById(id: string): Promise<Result<Deal, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          property:property_id (
            title,
            address,
            city,
            price,
            images
          ),
          buyer:buyer_id (
            name,
            email,
            phone
          ),
          seller:property_id (
            owner_id (
              name,
              email,
              phone
            )
          ),
          agent:agent_id (
            name,
            email,
            phone
          ),
          lawyer:lawyer_id (
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Deal', id);
        }
        logError('Failed to fetch deal', { id, error });
        throw createDatabaseError('Error al cargar la negociación', error);
      }

      // Transform offer into deal
      const deal: Deal = {
        id: data.id,
        offer_id: data.id,
        property_id: data.property_id,
        buyer_id: data.buyer_id,
        seller_id: data.property?.owner_id || '',
        agent_id: data.agent_id,
        lawyer_id: data.lawyer_id,
        status: this.mapOfferStatusToDealStatus(data.status),
        priority: 'medium',
        offer_price: data.offer_price,
        final_price: data.offer_price,
        currency: data.currency || 'COP',
        closing_date: data.closing_date,
        description: data.conditions,
        created_at: data.created_at,
        updated_at: data.updated_at,
        property: data.property ? {
          title: data.property.title,
          address: data.property.address,
          city: data.property.city,
          price: data.property.price,
          images: data.property.images || []
        } : undefined,
        buyer: data.buyer ? {
          name: data.buyer.name,
          email: data.buyer.email,
          phone: data.buyer.phone
        } : undefined,
        seller: data.seller?.owner_id ? {
          name: data.seller.owner_id.name,
          email: data.seller.owner_id.email,
          phone: data.seller.owner_id.phone
        } : undefined,
        agent: data.agent ? {
          name: data.agent.name,
          email: data.agent.email,
          phone: data.agent.phone
        } : undefined,
        lawyer: data.lawyer ? {
          name: data.lawyer.name,
          email: data.lawyer.email,
          phone: data.lawyer.phone
        } : undefined,
        last_activity: data.updated_at,
        progress_percentage: this.calculateProgress(data.status)
      };

      return deal;
    });
  }

  /**
   * Update deal
   */
  async updateDeal(input: UpdateDealInput): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Only include fields that are provided
      if (input.status !== undefined) {
        // Map deal status back to offer status
        const offerStatus = this.mapDealStatusToOfferStatus(input.status);
        updateData.status = offerStatus;
      }
      if (input.agent_id !== undefined) updateData.agent_id = input.agent_id;
      if (input.lawyer_id !== undefined) updateData.lawyer_id = input.lawyer_id;
      if (input.final_price !== undefined) updateData.offer_price = input.final_price;
      if (input.closing_date !== undefined) updateData.closing_date = input.closing_date;
      if (input.description !== undefined) updateData.conditions = input.description;

      const { error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', input.id);

      if (error) {
        logError('Failed to update deal', { input, error });
        throw createDatabaseError('Error al actualizar la negociación', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'deal_updated',
          resource_type: 'offer',
          resource_id: input.id,
          changes: updateData,
          created_at: new Date().toISOString()
        });

      return undefined;
    });
  }

  /**
   * Map deal status to offer status
   */
  private mapDealStatusToOfferStatus(dealStatus: string): string {
    switch (dealStatus) {
      case 'active':
        return 'pending';
      case 'completed':
        return 'accepted';
      case 'cancelled':
        return 'cancelled';
      case 'under_review':
        return 'countered';
      default:
        return 'pending';
    }
  }

  /**
   * Delete a deal
   */
  async deleteDeal(dealId: string): Promise<Result<void, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', dealId);

      if (error) {
        logError('Failed to delete deal', { dealId, error });
        throw createDatabaseError('Error al eliminar la negociación', error);
      }

      // Create audit log entry
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          action: 'deal_deleted',
          resource_type: 'offer',
          resource_id: dealId,
          created_at: new Date().toISOString()
        });

      return undefined;
    });
  }

  /**
   * Get deal statistics
   */
  async getDealStats(): Promise<Result<{
    total: number;
    active: number;
    completed: number;
    cancelled: number;
    total_value: number;
    average_deal_value: number;
    this_month: number;
    success_rate: number;
  }, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('status, offer_price, created_at');

      if (error) {
        logError('Failed to fetch deal stats', { error });
        throw createDatabaseError('Error al cargar estadísticas de negociaciones', error);
      }

      const total = data?.length || 0;
      const active = data?.filter(d => ['pending', 'countered'].includes(d.status)).length || 0;
      const completed = data?.filter(d => d.status === 'accepted').length || 0;
      const cancelled = data?.filter(d => ['rejected', 'cancelled'].includes(d.status)).length || 0;
      const total_value = data?.filter(d => d.status === 'accepted').reduce((sum, d) => sum + (d.offer_price || 0), 0) || 0;
      const average_deal_value = completed > 0 ? total_value / completed : 0;

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const this_month = data?.filter(d => new Date(d.created_at) >= thisMonth).length || 0;

      const success_rate = total > 0 ? (completed / total) * 100 : 0;

      return {
        total,
        active,
        completed,
        cancelled,
        total_value,
        average_deal_value,
        this_month,
        success_rate
      };
    });
  }
}

// Export singleton instance
export const dealsRepository = new DealsRepository();
