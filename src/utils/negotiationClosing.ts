import { getIntlLocale } from '../i18n';
// Negotiation Closing Utilities
// Handles offer acceptance, property status updates, and notifications

import { supabase } from '../lib/supabase';

export interface ClosingData {
  offerId: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  finalPrice: number;
  closingDate: string;
  paymentMethod: string;
  conditions: string;
}

export interface ClosingResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Close a negotiation by accepting an offer
 */
export async function closeNegotiation(closingData: ClosingData): Promise<ClosingResult> {
  try {
    // Start transaction
    const { data: transaction, error: transactionError } = await supabase.rpc('close_negotiation_transaction', {
      p_offer_id: closingData.offerId,
      p_property_id: closingData.propertyId,
      p_buyer_id: closingData.buyerId,
      p_seller_id: closingData.sellerId
    });

    if (transactionError) {
      throw transactionError;
    }

    // Create contract record (placeholder for future contract generation)
    const { error: contractError } = await supabase
      .from('contracts')
      .insert({
        offer_id: closingData.offerId,
        property_id: closingData.propertyId,
        buyer_id: closingData.buyerId,
        seller_id: closingData.sellerId,
        final_price: closingData.finalPrice,
        closing_date: closingData.closingDate,
        payment_method: closingData.paymentMethod,
        conditions: closingData.conditions,
        status: 'pending_signature'
      });

    if (contractError) {
      console.error('Contract creation error:', contractError);
      // Don't fail the whole process for contract creation issues
    }

    // Send notifications
    await Promise.all([
      // Notify buyer
      supabase.from('notifications').insert({
        user_id: closingData.buyerId,
        type: 'negotiation_closed_buyer',
        title: '¡Felicitaciones! Tu oferta fue aceptada',
        message: `Tu oferta de ${formatCurrency(closingData.finalPrice)} ha sido aceptada. El proceso de cierre comenzará pronto.`,
        data: { offer_id: closingData.offerId, property_id: closingData.propertyId }
      }),

      // Notify seller
      supabase.from('notifications').insert({
        user_id: closingData.sellerId,
        type: 'negotiation_closed_seller',
        title: 'Negociación cerrada exitosamente',
        message: `Has aceptado la oferta de ${formatCurrency(closingData.finalPrice)}. El proceso de cierre comenzará pronto.`,
        data: { offer_id: closingData.offerId, property_id: closingData.propertyId }
      }),

      // Notify other offer participants (rejected offers)
      supabase.from('notifications').insert({
        user_id: closingData.buyerId, // This should be dynamic for all rejected buyers
        type: 'offer_rejected',
        title: 'Oferta no seleccionada',
        message: 'Otra oferta fue seleccionada para esta propiedad. Gracias por tu interés.',
        data: { property_id: closingData.propertyId }
      })
    ]);

    // Log the closing in audit logs
    await supabase.from('audit_logs').insert({
      user_id: closingData.sellerId,
      action_type: 'negotiation_closed',
      resource_type: 'property',
      resource_id: closingData.propertyId,
      changes: {
        offer_accepted: closingData.offerId,
        final_price: closingData.finalPrice,
        buyer_id: closingData.buyerId
      }
    });

    return {
      success: true,
      message: 'Negociación cerrada exitosamente',
      data: transaction
    };

  } catch (error: any) {
    console.error('Error closing negotiation:', error);
    return {
      success: false,
      message: error.message || 'Error al cerrar la negociación'
    };
  }
}

/**
 * Generate PDF summary of accepted offer (placeholder)
 */
export async function generateOfferSummaryPDF(offerId: string): Promise<string | null> {
  try {
    // This would integrate with a PDF generation service like PDF-lib or similar
    // For now, return a placeholder URL
    console.log('Generating PDF summary for offer:', offerId);
    return `https://api.example.com/pdf/offer-summary/${offerId}`;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

/**
 * Cancel a negotiation (admin only)
 */
export async function cancelNegotiation(
  propertyId: string,
  reason: string,
  cancelledBy: string
): Promise<ClosingResult> {
  try {
    // Update property status
    const { error: propertyError } = await supabase
      .from('properties')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (propertyError) throw propertyError;

    // Update all offers to cancelled
    const { error: offersError } = await supabase
      .from('offers')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('property_id', propertyId)
      .neq('status', 'accepted'); // Don't cancel already accepted offers

    if (offersError) throw offersError;

    // Notify all participants
    await supabase.from('notifications').insert({
      user_id: null, // This would need to be sent to all property-related users
      type: 'negotiation_cancelled',
      title: 'Negociación cancelada',
      message: `La negociación para la propiedad ${propertyId} ha sido cancelada. Razón: ${reason}`,
      data: { property_id: propertyId, reason }
    });

    // Log the cancellation
    await supabase.from('audit_logs').insert({
      user_id: cancelledBy,
      action_type: 'negotiation_cancelled',
      resource_type: 'property',
      resource_id: propertyId,
      changes: { reason }
    });

    return {
      success: true,
      message: 'Negociación cancelada'
    };

  } catch (error: any) {
    console.error('Error cancelling negotiation:', error);
    return {
      success: false,
      message: error.message || 'Error al cancelar la negociación'
    };
  }
}

/**
 * Get negotiation status for a property
 */
export async function getNegotiationStatus(propertyId: string) {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select(`
        id,
        status,
        offer_price,
        buyer:buyer_id(id, name, email),
        created_at,
        updated_at
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const acceptedOffer = data?.find(offer => offer.status === 'accepted');
    const hasActiveOffers = data?.some(offer => ['pending', 'countered'].includes(offer.status));

    return {
      propertyId,
      status: acceptedOffer ? 'closed' : hasActiveOffers ? 'active' : 'no_offers',
      acceptedOffer,
      totalOffers: data?.length || 0,
      offers: data
    };

  } catch (error) {
    console.error('Error getting negotiation status:', error);
    return null;
  }
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}
