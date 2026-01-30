import React from 'react';
import { supabase } from '../../../lib/supabase';

export type UseVerificationQuery = {
  search?: string;
  status?: string;
  document_type?: string;
  page?: number;
  limit?: number;
};

export function useVerificationData(query: UseVerificationQuery) {
  const { search, status, document_type, page = 1, limit = 20 } = query;
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [verifications, setVerifications] = React.useState<any[]>([]);
  const [count, setCount] = React.useState(0);
  const [stats, setStats] = React.useState<Record<string, number> | null>(null);

  async function load() {
    setIsLoading(true);
    setError(null);
    let q = supabase
      .from('verification_documents')
      .select('*, profiles:user_id(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (status && status !== 'all') q = q.eq('status', status);
    if (document_type && document_type !== 'all') q = q.eq('document_type', document_type);
    const { data, error: err, count: c } = await q;
    if (err) setError(err.message);
    const mapped = ((data as any[]) || []).map((v) => ({
      ...v,
      full_name: v.profiles?.full_name,
      email: v.profiles?.email,
    }));
    setVerifications(mapped);
    setCount(c || 0);
    setIsLoading(false);
  }

  async function loadStats() {
    const { data, error: err } = await supabase.from('verification_documents').select('status');
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
  }, [search, status, document_type, page, limit]);

  return { isLoading, error, verifications, count, stats, reload: load };
}
