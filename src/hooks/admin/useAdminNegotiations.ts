import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface NegotiationOffer {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  original_price: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'counter_offered';
  created_at: string;
  updated_at: string;
  expires_at?: string;
  rejection_reason?: string;
  property_title?: string;
  property_price?: number;
  buyer_name?: string;
  buyer_email?: string;
  seller_name?: string;
  seller_email?: string;
  attachments_count?: number;
  days_since_offer?: number;
  is_expiring_soon?: boolean;
}

interface NegotiationFilters {
  status?: string;
  property_type?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  min_amount?: number;
  max_amount?: number;
}

export const useAdminNegotiations = () => {
  const [negotiations, setNegotiations] = useState<NegotiationOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNegotiations = async (filters: NegotiationFilters = {}, page = 1, limit = 20) => {
    setLoading(true);
    try {
      setError(null);

      // Build the query to get offers with related data
      let query = supabase
        .from('offers')
        .select(`
          *,
          properties!offers_property_id_fkey (
            title,
            price,
            type,
            status
          ),
          buyer:profiles!offers_buyer_id_fkey (
            name,
            email
          ),
          seller:profiles!offers_seller_id_fkey (
            name,
            email
          ),
          offer_attachments (
            id
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.property_type && filters.property_type !== 'all') {
        query = query.eq('properties.type', filters.property_type);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
      if (filters.min_amount) {
        query = query.gte('amount', filters.min_amount);
      }
      if (filters.max_amount) {
        query = query.lte('amount', filters.max_amount);
      }
      if (filters.search) {
        query = query.or(`
          properties.title.ilike.%${filters.search}%,
          buyer.name.ilike.%${filters.search}%,
          buyer.email.ilike.%${filters.search}%,
          seller.name.ilike.%${filters.search}%,
          seller.email.ilike.%${filters.search}%
        `);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform and enrich the data
      const now = new Date();
      const transformedNegotiations = (data || []).map(offer => {
        const expiresAt = offer.expires_at ? new Date(offer.expires_at) : null;
        const createdAt = new Date(offer.created_at);
        const daysSinceOffer = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const isExpiringSoon = expiresAt && (expiresAt.getTime() - now.getTime()) < (24 * 60 * 60 * 1000) && offer.status === 'pending';

        return {
          ...offer,
          property_title: offer.properties?.title,
          property_price: offer.properties?.price,
          buyer_name: offer.buyer?.name,
          buyer_email: offer.buyer?.email,
          seller_name: offer.seller?.name,
          seller_email: offer.seller?.email,
          attachments_count: offer.offer_attachments?.length || 0,
          days_since_offer: daysSinceOffer,
          is_expiring_soon: isExpiringSoon
        };
      });

      setNegotiations(transformedNegotiations);
      setTotalCount(count || 0);

    } catch (err: any) {
      console.error('Error fetching negotiations:', err);
      setError(err.message || 'Error al cargar negociaciones');
    } finally {
      setLoading(false);
    }
  };

  const interveneNegotiation = async (offerId: string, action: 'accept' | 'reject', reason?: string) => {
    try {
      const { data: offer, error: fetchError } = await supabase
        .from('offers')
        .select('*')
        .eq('id', offerId)
        .single();

      if (fetchError) throw fetchError;

      if (action === 'accept') {
        // Use the closeNegotiation function (assuming it's available)
        // For now, we'll manually close the negotiation
        const { error: closeError } = await supabase.rpc('close_negotiation_transaction', {
          offer_id: offerId
        });

        if (closeError) throw closeError;

        // Log the intervention
        await supabase.from('audit_logs').insert({
          user_id: offer.buyer_id,
          action_type: 'negotiation_intervention_accepted',
          resource_type: 'offer',
          resource_id: offerId,
          changes: {
            intervened_by: (await supabase.auth.getUser()).data.user?.id,
            reason: reason || 'Admin intervention'
          }
        });

        toast.success('Negociación aceptada exitosamente');

      } else if (action === 'reject') {
        // Update offer status
        const { error: updateError } = await supabase
          .from('offers')
          .update({
            status: 'rejected',
            rejection_reason: reason || 'Rejected by admin',
            updated_at: new Date().toISOString()
          })
          .eq('id', offerId);

        if (updateError) throw updateError;

        // Notify buyer
        await supabase.from('notifications').insert({
          user_id: offer.buyer_id,
          type: 'offer_rejected',
          title: 'Oferta Rechazada',
          message: `Tu oferta ha sido rechazada por un administrador. Razón: ${reason || 'Intervención administrativa'}`,
          data: { offer_id: offerId, reason }
        });

        // Log the intervention
        await supabase.from('audit_logs').insert({
          user_id: offer.buyer_id,
          action_type: 'negotiation_intervention_rejected',
          resource_type: 'offer',
          resource_id: offerId,
          changes: {
            intervened_by: (await supabase.auth.getUser()).data.user?.id,
            reason: reason
          }
        });

        toast.success('Oferta rechazada exitosamente');
      }

      // Update local state
      setNegotiations(prev => prev.map(n =>
        n.id === offerId ? { ...n, status: action === 'accept' ? 'accepted' : 'rejected' } : n
      ));

      return { success: true };
    } catch (error: any) {
      console.error('Error intervening in negotiation:', error);
      return { success: false, error: error.message };
    }
  };

  const getStats = () => {
    const total = negotiations.length;
    const active = negotiations.filter(n => n.status === 'pending').length;
    const accepted = negotiations.filter(n => n.status === 'accepted').length;
    const rejected = negotiations.filter(n => n.status === 'rejected').length;
    const expired = negotiations.filter(n => n.status === 'expired').length;
    const expiringSoon = negotiations.filter(n => n.is_expiring_soon).length;

    const totalValue = negotiations.reduce((sum, n) => sum + n.amount, 0);
    const avgOffer = total > 0 ? totalValue / total : 0;

    return {
      total,
      active,
      accepted,
      rejected,
      expired,
      expiringSoon,
      totalValue,
      avgOffer
    };
  };

  const exportNegotiations = () => {
    const csvData = negotiations.map(n => ({
      'ID Oferta': n.id,
      'Propiedad': n.property_title || '',
      'Precio Original': n.property_price || '',
      'Monto Oferta': n.amount,
      'Comprador': n.buyer_name || '',
      'Email Comprador': n.buyer_email || '',
      'Vendedor': n.seller_name || '',
      'Email Vendedor': n.seller_email || '',
      'Estado': n.status,
      'Fecha Creación': new Date(n.created_at).toLocaleDateString('es-CO'),
      'Fecha Expiración': n.expires_at ? new Date(n.expires_at).toLocaleDateString('es-CO') : '',
      'Adjuntos': n.attachments_count || 0,
      'Días desde Oferta': n.days_since_offer || 0
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `negociaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Archivo exportado exitosamente');
  };

  return {
    negotiations,
    loading,
    error,
    totalCount,
    fetchNegotiations,
    interveneNegotiation,
    getStats,
    exportNegotiations
  };
};
