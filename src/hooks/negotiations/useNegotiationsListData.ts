import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface NegotiationListItem {
  id: string;
  title: string;
  status: string;
  buyer_id: string;
  seller_id: string;
  participants: string[];
  property_id: string;
  current_price: number;
  original_price: number;
  created_at: string;
  updated_at: string;
  offer_count?: number;
  counter_offer_count?: number;
  property?: {
    id?: string;
    title: string;
    price: number;
    neighborhood: string;
    city: string;
  };
  buyer?: { id?: string; full_name: string; email: string; avatar_url?: string | null };
  seller?: { id?: string; full_name: string; email: string; avatar_url?: string | null };
}

export interface ListedPropertyNoOffers {
  id: string;
  title: string;
  price: number;
  neighborhood?: string | null;
  city?: string | null;
  address?: string | null;
  created_at?: string;
}

export function useNegotiationsListData(userId: string | undefined) {
  const [negotiations, setNegotiations] = useState<NegotiationListItem[]>([]);
  const [listedNoOffers, setListedNoOffers] = useState<ListedPropertyNoOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buyingNegotiations = useMemo(
    () => negotiations.filter((n) => n.buyer_id === userId),
    [negotiations, userId]
  );
  const sellingNegotiations = useMemo(
    () => negotiations.filter((n) => n.seller_id === userId),
    [negotiations, userId]
  );

  const refetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [negResult, propsResult] = await Promise.all([
        supabase
          .from('negotiations')
          .select(`
            *,
            property:properties(id, title, price, neighborhood, city),
            buyer:profiles!negotiations_buyer_id_fkey(id, full_name, email, avatar_url),
            seller:profiles!negotiations_seller_id_fkey(id, full_name, email, avatar_url)
          `)
          .or(`buyer_id.eq.${userId},seller_id.eq.${userId},lawyer_id.eq.${userId},agent_id.eq.${userId}`)
          .order('updated_at', { ascending: false }),
        supabase
          .from('properties')
          .select('id, title, price, neighborhood, city, address, created_at')
          .eq('owner_id', userId)
      ]);

      if (negResult.error) throw negResult.error;
      const negData = negResult.data || [];
      setNegotiations(negData);

      if (propsResult.error) {
        console.warn('Error fetching properties:', propsResult.error);
        setListedNoOffers([]);
      } else {
        const myProperties = (propsResult.data || []) as ListedPropertyNoOffers[];
        const propertyIdsInNegotiations = new Set(
          negData.filter((n) => n.seller_id === userId).map((n) => n.property_id)
        );
        setListedNoOffers(myProperties.filter((p) => !propertyIdsInNegotiations.has(p.id)));
      }
    } catch (err) {
      console.error('Error fetching negotiations list:', err);
      setError('Error al cargar las negociaciones');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    negotiations,
    listedNoOffers,
    buyingNegotiations,
    sellingNegotiations,
    loading,
    error,
    refetch
  };
}
