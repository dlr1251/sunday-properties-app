import React from 'react';
import { supabase } from '../../../lib/supabase';

export type UseVisitsQuery = {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
};

export function useVisitsData(query: UseVisitsQuery) {
  const { search, status, dateFrom, dateTo, page = 1, limit = 20 } = query;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [visits, setVisits] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);
  const [stats, setStats] = React.useState<Record<string, number> | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    let q = supabase
      .from('visits')
      .select('*, profiles:buyer_id(email), properties:property_id(title)', { count: 'exact' })
      .order('scheduled_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (status && status !== 'all') q = q.eq('status', status);
    if (dateFrom) q = q.gte('scheduled_date', dateFrom);
    if (dateTo) q = q.lte('scheduled_date', dateTo);
    const { data, error: err, count: c } = await q;
    if (err) setError(err.message);
    const mapped = ((data as any[]) || []).map((v) => ({
      ...v,
      buyer_email: v.profiles?.email,
      property_title: v.properties?.title,
    }));
    setVisits(mapped);
    setCount(c || 0);
    setIsLoading(false);
  }

  async function loadStats() {
    const { data, error: err } = await supabase.from('visits').select('status');
    if (!err && data) {
      const s: Record<string, number> = { total: data.length };
      for (const row of data as any[]) s[row.status] = (s[row.status] || 0) + 1;
      setStats(s);
    }
  }

  React.useEffect(() => {
    void load();
    void loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, dateFrom, dateTo, page, limit]);

  return { isLoading, error, visits, count, stats, reload: load };
}

