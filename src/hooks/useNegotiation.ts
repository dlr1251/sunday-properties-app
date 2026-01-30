import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Offer, OfferHistory, NegotiationRules, IntentLetter, OfferComparison } from '../types/database';

export const useNegotiation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate offer against seller's rules
  const validateOffer = async (propertyId: string, offerData: any) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('validate_offer_against_rules', {
        p_property_id: propertyId,
        p_offer_price: offerData.offerPrice,
        p_payment_method: offerData.paymentMethod,
        p_closing_date: offerData.closingDate
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error validating offer');
      return { valid: false, reason: 'Error de validación' };
    } finally {
      setLoading(false);
    }
  };

  // Submit a new offer
  const submitOffer = async (offerData: any) => {
    try {
      setLoading(true);
      setError(null);

      // First validate the offer
      const validation = await validateOffer(offerData.propertyId, offerData);
      if (!validation.valid) {
        throw new Error(validation.reason || 'Oferta no válida');
      }

      // Insert the offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          property_id: offerData.propertyId,
          buyer_id: offerData.buyerId,
          offer_price: offerData.offerPrice,
          original_price: offerData.originalPrice,
          payment_method: offerData.paymentMethod,
          financing_details: offerData.financingDetails,
          crypto_details: offerData.cryptoDetails,
          closing_date: offerData.closingDate,
          conditions: offerData.conditions,
          currency: offerData.currency,
          exchange_rate: offerData.exchangeRate,
          expires_at: offerData.expiresAt,
          status: 'pending'
        })
        .select()
        .single();

      if (offerError) {
        throw new Error(offerError.message);
      }

      // Create initial history entry
      await createOfferHistoryEntry(offer.id, {
        version: 1,
        action: 'created',
        actorId: offerData.buyerId,
        actorRole: 'buyer',
        offerPrice: offerData.offerPrice,
        paymentMethod: offerData.paymentMethod,
        closingDate: offerData.closingDate,
        conditions: offerData.conditions
      });

      return offer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error submitting offer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create offer history entry
  const createOfferHistoryEntry = async (offerId: string, historyData: any) => {
    try {
      const { data, error } = await supabase
        .from('offer_history')
        .insert({
          offer_id: offerId,
          ...historyData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      console.error('Error creating offer history entry:', err);
      throw err;
    }
  };

  // Counter offer
  const counterOffer = async (offerId: string, changes: any, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get current offer
      const { data: currentOffer, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Update offer with new terms
      const { data: updatedOffer, error: updateError } = await supabase
        .from('offers')
        .update({
          offer_price: changes.offerPrice || currentOffer.offer_price,
          payment_method: changes.paymentMethod || currentOffer.payment_method,
          closing_date: changes.closingDate || currentOffer.closing_date,
          conditions: changes.conditions || currentOffer.conditions,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Create history entry
      await createOfferHistoryEntry(offerId, {
        version: (currentOffer.version || 0) + 1,
        action: 'countered',
        actorId: changes.actorId,
        actorRole: changes.actorRole,
        offerPrice: updatedOffer.offer_price,
        paymentMethod: updatedOffer.payment_method,
        closingDate: updatedOffer.closing_date,
        conditions: updatedOffer.conditions,
        changes: changes,
        reason: reason
      });

      return updatedOffer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating counter offer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Accept offer
  const acceptOffer = async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Update offer status
      const { data: offer, error: updateError } = await supabase
        .from('offers')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Reject all other offers for the same property
      await supabase
        .from('offers')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('property_id', offer.property_id)
        .neq('id', offerId);

      // Create history entry
      await createOfferHistoryEntry(offerId, {
        version: (offer.version || 0) + 1,
        action: 'accepted',
        actorId: offer.seller_id,
        actorRole: 'seller',
        offerPrice: offer.offer_price,
        paymentMethod: offer.payment_method,
        closingDate: offer.closing_date,
        conditions: offer.conditions
      });

      return offer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error accepting offer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reject offer
  const rejectOffer = async (offerId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get current offer
      const { data: currentOffer, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Update offer status
      const { data: offer, error: updateError } = await supabase
        .from('offers')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', offerId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Create history entry
      await createOfferHistoryEntry(offerId, {
        version: (currentOffer.version || 0) + 1,
        action: 'rejected',
        actorId: currentOffer.seller_id,
        actorRole: 'seller',
        offerPrice: currentOffer.offer_price,
        paymentMethod: currentOffer.payment_method,
        closingDate: currentOffer.closing_date,
        conditions: currentOffer.conditions,
        reason: reason
      });

      return offer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting offer');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get offer history
  const getOfferHistory = async (offerId: string) => {
    try {
      const { data, error } = await supabase
        .from('offer_history')
        .select(`
          *,
          actor:users!offer_history_actor_id_fkey(*)
        `)
        .eq('offer_id', offerId)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching offer history');
      return [];
    }
  };

  // Compare offers
  const compareOffers = async (propertyId: string, offerIds: string[]) => {
    try {
      const { data: offers, error } = await supabase
        .from('offers')
        .select(`
          *,
          buyer:users!offers_buyer_id_fkey(*),
          property:properties!offers_property_id_fkey(*)
        `)
        .in('id', offerIds);

      if (error) {
        throw new Error(error.message);
      }

      // Calculate comparison metrics
      const comparisonData = offers?.map(offer => {
        const closingDate = new Date(offer.closing_date);
        const today = new Date();
        const closingDays = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate competitiveness score
        const avgPrice = offers.reduce((sum, o) => sum + o.offer_price, 0) / offers.length;
        const competitiveness = Math.min(100, Math.max(0, (offer.offer_price / avgPrice) * 100));

        // Calculate risk score
        let riskScore = 0;
        if (offer.payment_method === 'cash') riskScore = 10;
        else if (offer.payment_method === 'financing') riskScore = 30;
        else if (offer.payment_method === 'crypto') riskScore = 50;
        else riskScore = 40;

        if (offer.conditions && offer.conditions.length > 0) {
          riskScore += offer.conditions.length * 5;
        }

        return {
          offerId: offer.id,
          buyerName: offer.buyer?.name || 'Comprador',
          price: offer.offer_price,
          paymentMethod: offer.payment_method,
          closingDays,
          competitiveness: Math.round(competitiveness),
          riskScore: Math.min(100, riskScore),
          conditions: offer.conditions || []
        };
      });

      return comparisonData || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error comparing offers');
      return [];
    }
  };

  // Calculate competitiveness score
  const calculateCompetitiveness = (offer: any, marketData: any) => {
    const baseScore = 50;
    const priceScore = Math.min(30, (offer.offerPrice / marketData.averagePrice) * 30);
    const paymentScore = offer.paymentMethod === 'cash' ? 20 : 10;
    const speedScore = offer.closingDays <= 30 ? 20 : 10;
    
    return Math.min(100, baseScore + priceScore + paymentScore + speedScore);
  };

  // Generate intent letter
  const generateIntentLetter = async (offerId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get offer details
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .select(`
          *,
          buyer:users!offers_buyer_id_fkey(*),
          seller:users!offers_seller_id_fkey(*),
          property:properties!offers_property_id_fkey(*)
        `)
        .eq('id', offerId)
        .single();

      if (offerError) {
        throw new Error(offerError.message);
      }

      // Generate intent letter content
      const content = `
CARTA DE INTENCIÓN DE COMPRAVENTA

Por medio de la presente, ${offer.buyer?.name} (Comprador) y ${offer.seller?.name} (Vendedor) manifiestan su intención de celebrar un contrato de compraventa sobre el inmueble ubicado en ${offer.property?.address}.

CONDICIONES PRINCIPALES:
- Precio acordado: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(offer.offer_price)}
- Método de pago: ${offer.payment_method}
- Fecha de cierre: ${new Date(offer.closing_date).toLocaleDateString('es-CO')}
- Condiciones especiales: ${offer.conditions?.join(', ') || 'Ninguna'}

Esta carta de intención tiene una vigencia de 30 días a partir de la fecha de firma.

Firma del Comprador: _________________ Fecha: _________
Firma del Vendedor: _________________ Fecha: _________
      `;

      // Create intent letter
      const { data: intentLetter, error: letterError } = await supabase
        .from('intent_letters')
        .insert({
          offer_id: offerId,
          property_id: offer.property_id,
          buyer_id: offer.buyer_id,
          seller_id: offer.seller_id,
          content: content.trim(),
          status: 'draft'
        })
        .select()
        .single();

      if (letterError) {
        throw new Error(letterError.message);
      }

      return intentLetter;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating intent letter');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign intent letter
  const signIntentLetter = async (letterId: string, signature: string, role: 'buyer' | 'seller') => {
    try {
      setLoading(true);
      setError(null);

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (role === 'buyer') {
        updateData.buyer_signature = signature;
        updateData.buyer_signed_at = new Date().toISOString();
      } else {
        updateData.seller_signature = signature;
        updateData.seller_signed_at = new Date().toISOString();
      }

      // Check if both parties have signed
      const { data: letter, error: fetchError } = await supabase
        .from('intent_letters')
        .select('*')
        .eq('id', letterId)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const bothSigned = (role === 'buyer' ? letter.seller_signature : letter.buyer_signature) && signature;

      if (bothSigned) {
        updateData.status = 'signed';
      } else {
        updateData.status = 'pending_signatures';
      }

      const { data, error } = await supabase
        .from('intent_letters')
        .update(updateData)
        .eq('id', letterId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error signing intent letter');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get negotiation rules for a property
  const getNegotiationRules = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('negotiation_rules')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found error
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching negotiation rules');
      return null;
    }
  };

  // Save negotiation rules
  const saveNegotiationRules = async (propertyId: string, rules: Partial<NegotiationRules>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('negotiation_rules')
        .upsert({
          property_id: propertyId,
          ...rules,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving negotiation rules');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    validateOffer,
    submitOffer,
    counterOffer,
    acceptOffer,
    rejectOffer,
    getOfferHistory,
    compareOffers,
    calculateCompetitiveness,
    generateIntentLetter,
    signIntentLetter,
    getNegotiationRules,
    saveNegotiationRules
  };
};
