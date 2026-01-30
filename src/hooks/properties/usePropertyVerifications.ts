import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface PropertyVerification {
  id: string;
  property_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes';
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  changes_requested: string | null;
  submitted_data: any;
  visit_availability_configured: boolean;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    title: string;
    address: string;
    status: string;
  };
}

export const usePropertyVerifications = (userId?: string) => {
  const [verifications, setVerifications] = useState<PropertyVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const targetUserId = userId || userData.user.id;

      // Build query
      let query = supabase
        .from('property_verifications')
        .select(`
          *,
          property:properties (
            id,
            title,
            address,
            status
          )
        `);

      // If userId is provided, filter by it (for user view)
      // If userId is NOT provided (undefined), fetch ALL verifications (for admin view)
      if (userId !== undefined) {
        query = query.eq('user_id', targetUserId);
      }
      // Otherwise, no filter - get all verifications

      const { data, error } = await query.order('submitted_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const refetch = useCallback(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  return {
    verifications,
    loading,
    error,
    refetch,
  };
};

