import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export type NegotiationOffer = {
  id: string;
  negotiation_id: string;
  author: string;
  payload: any;
  status: 'offer' | 'counter' | 'accepted' | 'rejected';
  created_at: string;
};

export function useNegotiationOffers(negotiationId: string) {
  const [offers, setOffers] = useState<NegotiationOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      console.log('📥 [useNegotiationOffers] Loading offers for negotiation:', negotiationId);
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('negotiation_offers')
          .select('*')
          .eq('negotiation_id', negotiationId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ [useNegotiationOffers] Failed to load offers:', error);
          throw error;
        }

        console.log('📊 [useNegotiationOffers] Loaded', data?.length || 0, 'offers');
        if (!isMounted) return;

        setOffers((data ?? []) as NegotiationOffer[]);
      } catch (e: any) {
        console.error('💥 [useNegotiationOffers] Load error:', e);
        if (!isMounted) return;
        setError(e?.message || 'Error loading offers');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    // Realtime subscription
    console.log('🔄 [useNegotiationOffers] Setting up realtime subscription for negotiation:', negotiationId);
    const channel = supabase
      .channel(`negotiation_offers:neg=${negotiationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'negotiation_offers', filter: `negotiation_id=eq.${negotiationId}` },
        (payload) => {
          console.log('📡 [useNegotiationOffers] Realtime event:', payload.eventType, payload);
          setOffers((current) => {
            if (payload.eventType === 'INSERT') {
              console.log('➕ [useNegotiationOffers] New offer added:', payload.new);
              return [payload.new as any as NegotiationOffer, ...current];
            }
            if (payload.eventType === 'UPDATE') {
              console.log('✏️ [useNegotiationOffers] Offer updated:', payload.new);
              return current.map((o) => (o.id === (payload.new as any).id ? ((payload.new as any) as NegotiationOffer) : o));
            }
            if (payload.eventType === 'DELETE') {
              console.log('🗑️ [useNegotiationOffers] Offer deleted:', payload.old);
              return current.filter((o) => o.id !== (payload.old as any).id);
            }
            return current;
          });
        }
      )
      .subscribe((status) => {
        console.log('🔗 [useNegotiationOffers] Realtime subscription status:', status);
      });

    return () => {
      isMounted = false;
      try { supabase.removeChannel(channel); } catch {}
    };
  }, [negotiationId]);

  return { offers, loading, error };
}


