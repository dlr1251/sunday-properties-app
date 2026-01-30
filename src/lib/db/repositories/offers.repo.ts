import { supabase } from '../../supabase';
import { Result, ok, err, tryCatch } from '../../utils/result';
import { AppError, createDatabaseError, createNotFoundError } from '../../utils/errors';
import { logError } from '../../utils/logger';
import { 
  OfferStatus, 
  PaymentMethod,
  CreateOfferInput, 
  CounterOfferInput, 
  UpdateOfferStatusInput,
  OfferFilters 
} from '../../validation/offers.schema';
import { featureFlagService, FeatureFlag } from '../../featureFlags';
import { offerConditionsService, CreateConditionInput } from '../../../services/offerConditions.service';
import { OfferCondition } from '../../../types/database';

// Offer interface (matching database schema)
export interface Offer {
  id: string;
  property_id: string;
  buyer_id: string;
  offer_price: number;
  original_price: number;
  payment_method: PaymentMethod;
  financing_details?: any;
  crypto_details?: any;
  closing_date: string;
  conditions: string[];
  status: OfferStatus;
  counter_offer?: any;
  metrics: any;
  created_at: string;
  expires_at: string;
  updated_at: string;
  // NPV fields (new)
  calculated_npv?: number | null;
  risk_adjusted_npv?: number | null;
  npv_breakdown?: any | null;
  npv_calculated_at?: string | null;
  // Joined data
  property?: {
    id: string;
    title: string;
    address: string;
    price: number;
    owner_id: string;
    owner?: {
      id: string;
      full_name?: string;
      email: string;
      phone?: string;
      location?: string;
      verification_status?: string;
      avatar_url?: string;
      bio?: string;
    };
  };
  buyer?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

export class OffersRepository {
  /**
   * Get offers for a specific property
   */
  async getOffersByProperty(
    propertyId: string,
    filters?: OfferFilters
  ): Promise<Result<Offer[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('offers')
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.buyerId) {
        query = query.eq('buyer_id', filters.buyerId);
      }
      if (filters?.minPrice) {
        query = query.gte('offer_price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('offer_price', filters.maxPrice);
      }
      if (filters?.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }
      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch offers', { propertyId, error });
        throw createDatabaseError('Error al cargar las ofertas', error);
      }

      return data || [];
    });
  }

  /**
   * Get a specific offer by ID
   */
  async getOfferById(id: string): Promise<Result<Offer, AppError>> {
    return tryCatch(async () => {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw createNotFoundError('Offer', id);
        }
        logError('Failed to fetch offer', { id, error });
        throw createDatabaseError('Error al cargar la oferta', error);
      }

      return data;
    });
  }

  /**
   * Create a new offer
   */
  async createOffer(input: CreateOfferInput): Promise<Result<Offer, AppError>> {
    return tryCatch(async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new AppError('Usuario no autenticado', 'AUTH_ERROR');
      }

      const { data, error } = await supabase
        .from('offers')
        .insert({
          property_id: input.propertyId,
          buyer_id: userData.user.id,
          offer_price: input.offerPrice,
          original_price: input.originalPrice,
          payment_method: input.paymentMethod,
          financing_details: input.financingDetails,
          crypto_details: input.cryptoDetails,
          closing_date: input.closingDate,
          conditions: input.conditions,
          status: 'pending',
          metrics: {
            price_difference: input.offerPrice - input.originalPrice,
            price_percentage: (input.offerPrice / input.originalPrice) * 100,
            created_at: new Date().toISOString()
          },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to create offer', { input, error });
        throw createDatabaseError('Error al crear la oferta', error);
      }

      return data;
    });
  }

  /**
   * Update offer status
   */
  async updateOfferStatus(
    id: string, 
    status: OfferStatus, 
    reason?: string,
    notes?: string
  ): Promise<Result<Offer, AppError>> {
    return tryCatch(async () => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (reason) {
        updateData.rejection_reason = reason;
      }
      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to update offer status', { id, status, error });
        throw createDatabaseError('Error al actualizar el estado de la oferta', error);
      }

      return data;
    });
  }

  /**
   * Create a counter offer
   */
  async createCounterOffer(input: CounterOfferInput): Promise<Result<Offer, AppError>> {
    return tryCatch(async () => {
      // First, get the original offer
      const originalOfferResult = await this.getOfferById(input.originalOfferId);
      if (!originalOfferResult.ok) {
        return originalOfferResult;
      }

      const originalOffer = originalOfferResult.data;

      // Create the counter offer
      const { data, error } = await supabase
        .from('offers')
        .insert({
          property_id: originalOffer.property_id,
          buyer_id: originalOffer.buyer_id,
          offer_price: input.counterPrice,
          original_price: originalOffer.original_price,
          payment_method: input.paymentMethod,
          financing_details: input.financingDetails,
          crypto_details: input.cryptoDetails,
          closing_date: input.closingDate,
          conditions: input.conditions,
          status: 'countered',
          counter_offer: {
            original_offer_id: input.originalOfferId,
            reason: input.reason,
            message: input.message,
            created_at: new Date().toISOString()
          },
          metrics: {
            price_difference: input.counterPrice - originalOffer.original_price,
            price_percentage: (input.counterPrice / originalOffer.original_price) * 100,
            created_at: new Date().toISOString()
          },
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .single();

      if (error) {
        logError('Failed to create counter offer', { input, error });
        throw createDatabaseError('Error al crear la contraoferta', error);
      }

      // Update the original offer status
      await this.updateOfferStatus(input.originalOfferId, 'countered');

      return data;
    });
  }

  /**
   * Accept an offer
   */
  async acceptOffer(id: string): Promise<Result<Offer, AppError>> {
    return this.updateOfferStatus(id, 'accepted');
  }

  /**
   * Reject an offer
   */
  async rejectOffer(id: string, reason?: string): Promise<Result<Offer, AppError>> {
    return this.updateOfferStatus(id, 'rejected', reason);
  }

  /**
   * Get offers by buyer
   */
  async getOffersByBuyer(
    buyerId: string,
    filters?: OfferFilters
  ): Promise<Result<Offer[], AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('offers')
        .select(`
          *,
          property:properties!offers_property_id_fkey (
            id,
            title,
            address,
            price,
            owner_id,
            owner:profiles!properties_owner_id_fkey (
              id,
              full_name,
              email,
              phone,
              location,
              verification_status,
              avatar_url,
              bio
            )
          ),
          buyer:profiles!offers_buyer_id_fkey (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('buyer_id', buyerId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.propertyId) {
        query = query.eq('property_id', filters.propertyId);
      }
      if (filters?.minPrice) {
        query = query.gte('offer_price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('offer_price', filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch buyer offers', { buyerId, error });
        throw createDatabaseError('Error al cargar las ofertas del comprador', error);
      }

      return data || [];
    });
  }

  /**
   * Get offer statistics
   */
  async getOfferStats(propertyId?: string): Promise<Result<{
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    countered: number;
    expired: number;
  }, AppError>> {
    return tryCatch(async () => {
      let query = supabase
        .from('offers')
        .select('status');

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data, error } = await query;

      if (error) {
        logError('Failed to fetch offer stats', { propertyId, error });
        throw createDatabaseError('Error al cargar estadísticas de ofertas', error);
      }

      const stats = {
        total: data?.length || 0,
        pending: data?.filter(o => o.status === 'pending').length || 0,
        accepted: data?.filter(o => o.status === 'accepted').length || 0,
        rejected: data?.filter(o => o.status === 'rejected').length || 0,
        countered: data?.filter(o => o.status === 'countered').length || 0,
        expired: data?.filter(o => o.status === 'expired').length || 0,
      };

      return stats;
    });
  }

  /**
   * NEW: Get offer with structured conditions (dual-mode support)
   */
  async getOfferWithConditions(id: string): Promise<Result<Offer & { structuredConditions?: OfferCondition[] }, AppError>> {
    return tryCatch(async () => {
      // Check if feature flag is enabled
      const { data: userData } = await supabase.auth.getUser();
      const featureFlagEnabled = userData.user 
        ? await featureFlagService.isEnabled(FeatureFlag.STRUCTURED_CONDITIONS, userData.user.id)
        : false;

      // Always get the base offer first
      const offerResult = await this.getOfferById(id);
      if (!offerResult.ok) {
        return offerResult;
      }

      const offer = offerResult.data;

      // If feature flag not enabled, return legacy format only
      if (!featureFlagEnabled) {
        return offer;
      }

      // Get structured conditions
      const conditionsResult = await offerConditionsService.getConditionsByOffer(id);
      if (conditionsResult.ok) {
        return {
          ...offer,
          structuredConditions: conditionsResult.data,
          // Keep legacy conditions for backward compatibility
          conditions: offer.conditions
        };
      }

      // If conditions fetch fails, return offer without conditions
      return offer;
    });
  }

  /**
   * NEW: Create offer with structured conditions
   */
  async createOfferWithConditions(
    input: CreateOfferInput,
    conditions: CreateConditionInput[]
  ): Promise<Result<Offer & { structuredConditions?: OfferCondition[] }, AppError>> {
    return tryCatch(async () => {
      // 1. Create offer (legacy way)
      const offerResult = await this.createOffer(input);
      if (!offerResult.ok) {
        return offerResult;
      }

      const offer = offerResult.data;

      // 2. Check if feature flag enabled
      const { data: userData } = await supabase.auth.getUser();
      const featureFlagEnabled = userData.user 
        ? await featureFlagService.isEnabled(FeatureFlag.STRUCTURED_CONDITIONS, userData.user.id)
        : false;

      // 3. If feature flag enabled and conditions provided, create structured conditions
      if (featureFlagEnabled && conditions.length > 0) {
        for (const conditionInput of conditions) {
          await offerConditionsService.createCondition({
            ...conditionInput,
            offerId: offer.id,
            proposerUserId: input.buyerId || offer.buyer_id
          });
        }
      }

      // 4. Return offer with conditions (if created)
      return this.getOfferWithConditions(offer.id);
    });
  }

  /**
   * NEW: Get offer with NPV data
   */
  async getOfferWithNPV(id: string): Promise<Result<Offer & { npvData?: any }, AppError>> {
    return tryCatch(async () => {
      const offerResult = await this.getOfferById(id);
      if (!offerResult.ok) {
        return offerResult;
      }

      const offer = offerResult.data;

      // Check if offer has NPV data
      if (offer.calculated_npv !== null && offer.calculated_npv !== undefined) {
        return {
          ...offer,
          npvData: {
            npv: offer.calculated_npv,
            riskAdjustedNPV: offer.risk_adjusted_npv,
            breakdown: offer.npv_breakdown,
            calculatedAt: offer.npv_calculated_at
          }
        };
      }

      return offer;
    });
  }
}

// Export singleton instance
export const offersRepository = new OffersRepository();
