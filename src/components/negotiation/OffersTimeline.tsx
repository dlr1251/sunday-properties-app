import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNegotiationPermissions } from '../../hooks/useNegotiationPermissions';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabase';
import { NegotiationOffer, useNegotiationData } from '../../hooks/negotiations/useNegotiationData';
import { formatDate, formatRelativeTime } from '../../utils/format';

export type OffersTimelineProps = {
  negotiationId: string;
  className?: string;
};

export const OffersTimeline: React.FC<OffersTimelineProps> = ({ negotiationId, className }) => {
  const { user } = useAuth();
  const { canEdit } = useNegotiationPermissions(negotiationId);
  const { success, error: showError } = useToast();
  const { data: negotiationData, loading: negotiationLoading } = useNegotiationData(negotiationId);
  const [submitting, setSubmitting] = React.useState(false);
  const [price, setPrice] = React.useState<number>(0);
  const [offers, setOffers] = React.useState<NegotiationOffer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load offers on mount
  React.useEffect(() => {
    let isMounted = true;

    async function loadOffers() {
      try {
        const { data, error: loadError } = await supabase
          .from('negotiation_offers')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false });

        if (loadError) {
          console.error('❌ [OffersTimeline] Failed to load offers:', loadError);
          throw loadError;
        }

        if (!isMounted) return;
        setOffers((data ?? []) as NegotiationOffer[]);
        setLoading(false);
      } catch (err: any) {
        console.error('💥 [OffersTimeline] Load error:', err);
        if (!isMounted) return;
        setError(err?.message || 'Error loading offers');
        setLoading(false);
      }
    }

    loadOffers();

    // Realtime subscription
    const channel = supabase
      .channel(`negotiation_offers:neg=${negotiationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'negotiation_offers', filter: `negotiation_id=eq.${negotiationId}` },
        (payload) => {
          console.log('📡 [OffersTimeline] Realtime event:', payload.eventType);
          setOffers((current) => {
            if (payload.eventType === 'INSERT') {
              return [payload.new as any as NegotiationOffer, ...current];
            }
            if (payload.eventType === 'UPDATE') {
              return current.map((o) => (o.id === (payload.new as any).id ? ((payload.new as any) as NegotiationOffer) : o));
            }
            if (payload.eventType === 'DELETE') {
              return current.filter((o) => o.id !== (payload.old as any).id);
            }
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [negotiationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📤 [OffersTimeline] Form submission started');
    console.log('💰 [OffersTimeline] Price to submit:', price);
    console.log('👤 [OffersTimeline] User can edit:', canEdit);

    if (!user || !canEdit) {
      console.warn('🚫 [OffersTimeline] Submission blocked - user:', !!user, 'canEdit:', canEdit);
      return;
    }

    try {
      setSubmitting(true);
      console.log('⏳ [OffersTimeline] Setting submitting state to true');

      // Get negotiation info to determine author_role and version
      const { data: negotiation } = await supabase
        .from('negotiations')
        .select('buyer_id, seller_id')
        .eq('id', negotiationId)
        .single();

      if (!negotiation) {
        throw new Error('Negociación no encontrada');
      }

      const negotiationTyped = negotiation as { buyer_id: string; seller_id: string };

      // Get existing offers to determine version
      const { data: existingOffers } = await supabase
        .from('negotiation_offers')
        .select('id, created_at')
        .eq('negotiation_id', negotiationId)
        .order('created_at', { ascending: true });

      // Determine if this is first offer or counter
      const isFirstOffer = !existingOffers || existingOffers.length === 0;
      const version = isFirstOffer ? 1 : existingOffers.length + 1;

      // Determine author_role
      let authorRole: 'buyer' | 'seller' | null = null;
      if (user.id === negotiationTyped.buyer_id) {
        authorRole = 'buyer';
      } else if (user.id === negotiationTyped.seller_id) {
        authorRole = 'seller';
      }

      // Determine parent_offer_id (latest offer if counter)
      let parentOfferId: string | null = null;
      if (!isFirstOffer && existingOffers && existingOffers.length > 0) {
        // Get the latest offer id
        const latestOffer = existingOffers[existingOffers.length - 1] as { id: string; created_at: string } | undefined;
        if (latestOffer?.id) {
          parentOfferId = latestOffer.id;
        }
      }

      const payload: any = { price };
      console.log('📦 [OffersTimeline] Payload to insert:', payload);

      const insertData: any = {
        negotiation_id: negotiationId,
        author: user.id,
        payload,
        status: 'offer',
        version,
        kind: isFirstOffer ? 'offer' : 'counter'
      };

      if (authorRole) {
        insertData.author_role = authorRole;
      }

      if (parentOfferId) {
        insertData.parent_offer_id = parentOfferId;
      }

      // Also write to typed columns for dual-write
      insertData.price = price;

      console.log('📤 [OffersTimeline] Inserting offer with typed columns:', insertData);

      const { error: insertError } = await supabase.from('negotiation_offers').insert(insertData);

      if (insertError) {
        console.error('❌ [OffersTimeline] Database insertion failed:', insertError);
        throw insertError;
      }

      console.log('✅ [OffersTimeline] Offer inserted successfully');
      success('Oferta enviada exitosamente');
      setPrice(0);
      console.log('🔄 [OffersTimeline] Form reset - price set to 0');
      
      // Reload offers to show new one
      setOffers((current) => {
        const newOffer = {
          ...insertData,
          id: 'temp-' + Date.now(), // Temporary ID, will be replaced by realtime
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as NegotiationOffer;
        return [newOffer as any, ...current];
      });
    } catch (err: any) {
      console.error('💥 [OffersTimeline] Form submission error:', err);
      console.error('📋 [OffersTimeline] Error details:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint
      });
      showError(`Error al enviar oferta: ${err?.message || 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
      console.log('⏹️ [OffersTimeline] Setting submitting state to false');
    }
  };
  // Debug logging
  React.useEffect(() => {
    if (negotiationData) {
      console.log('📊 [OffersTimeline] Negotiation data loaded:', {
        propertyTitle: negotiationData?.property?.title,
        negotiationTitle: negotiationData?.title,
        created_at: negotiationData?.created_at,
        hasProperty: !!negotiationData?.property
      });
    }
  }, [negotiationData]);

  const propertyTitle = negotiationData?.property?.title || negotiationData?.title || 'Negociación';
  const negotiationStartDate = negotiationData?.created_at;

  return (
    <section className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 lg:p-6 ${className ?? ''}`}>
      <header className="mb-4">
        {negotiationLoading ? (
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">{propertyTitle}</h1>
            {negotiationStartDate && (
              <div className="mt-2 text-sm text-gray-600">
                <span>{formatDate(negotiationStartDate)}</span>
                <span className="mx-2">•</span>
                <span>{formatRelativeTime(negotiationStartDate)}</span>
              </div>
            )}
          </>
        )}
        <h2 className="text-lg font-semibold text-gray-900 mt-4">Historial de ofertas</h2>
      </header>
      {canEdit && (
        <form onSubmit={handleSubmit} className="mb-4 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Nueva oferta (precio)</label>
            <input
              type="number"
              className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value || 0))}
              placeholder="350000000"
            />
          </div>
          <button
            type="submit"
            disabled={!user || submitting || price <= 0}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Ofertar'}
          </button>
        </form>
      )}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Cargando ofertas...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-700 font-medium">Error al cargar ofertas</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        )}
        {!loading && !error && offers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-sm font-medium text-gray-900">Sin ofertas todavía</div>
            <div className="text-sm text-gray-600 mt-1">Las ofertas aparecerán aquí cuando se envíen</div>
          </div>
        )}
        {!loading && !error && offers.map((o) => (
          <div key={o.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className={`h-3 w-3 rounded-full mt-1 ${o.status === 'accepted' ? 'bg-green-500' : o.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 capitalize">{o.kind === 'counter' ? 'Contraoferta' : o.status}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      v{o.version || 1}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(o.created_at).toLocaleString('es-CO')}</div>
                </div>
                {(o.price ?? o.payload?.price) && (
                  <div className="text-sm font-semibold text-gray-700 mt-1">
                    $ {Number(o.price ?? o.payload?.price).toLocaleString('es-CO')}
                  </div>
                )}
                {(o.down_payment ?? o.payload?.downPayment) && (
                  <div className="text-xs text-gray-600 mt-1">
                    Cuota inicial: $ {Number(o.down_payment ?? o.payload?.downPayment).toLocaleString('es-CO')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OffersTimeline;


