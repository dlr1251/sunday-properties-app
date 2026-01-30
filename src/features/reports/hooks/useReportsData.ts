import React from 'react';
import { supabase } from '../../../lib/supabase';

export type UseReportsQuery = {
  search?: string;
  status?: string;
  type?: string;
  priority?: string;
  page?: number;
  limit?: number;
};

export function useReportsData(query: UseReportsQuery) {
  const { search, status, type, priority, page = 1, limit = 20 } = query;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reports, setReports] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);
  const [stats, setStats] = React.useState<Record<string, number> | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    let q = supabase.from('reports').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range((page - 1) * limit, page * limit - 1);
    if (search) q = q.ilike('title', `%${search}%`);
    if (status && status !== 'all') q = q.eq('status', status);
    if (type && type !== 'all') q = q.eq('type', type);
    if (priority && priority !== 'all') q = q.eq('priority', priority);
    const { data, error: err, count: c } = await q;
    if (err) setError(err.message);
    setReports((data as any[]) || []);
    setCount(c || 0);
    setIsLoading(false);
  }

  async function loadStats() {
    const { data, error: err } = await supabase.from('reports').select('status');
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
  }, [search, status, type, priority, page, limit]);

  return { isLoading, error, reports, count, stats, reload: load };
}


