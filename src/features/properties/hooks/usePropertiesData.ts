import React from 'react';
import { supabase } from '../../../lib/supabase';

export type UsePropertiesQuery = {
  search?: string;
  status?: string;
  city?: string;
  listingType?: 'all' | 'sale' | 'rental';
  page?: number;
  limit?: number;
};

export function usePropertiesData(query: UsePropertiesQuery) {
  const { search, status, city, listingType = 'all', page = 1, limit = 20 } = query;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [properties, setProperties] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);

  async function load() {
    setIsLoading(true);
    setError(null);
    let q = supabase.from('properties').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    if (search) q = q.ilike('title', `%${search}%`);
    if (status && status !== 'all') q = q.eq('status', status);
    if (city) q = q.ilike('city', `%${city}%`);
    if (listingType && listingType !== 'all') q = q.eq('listing_type', listingType);
    const { data, error: err, count: c } = await q;
    if (err) setError(err.message);
    setProperties((data as any[]) || []);
    setCount(c || 0);
    setIsLoading(false);
  }

  React.useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, city, listingType, page, limit]);

  return { isLoading, error, properties, count, reload: load };
}


