import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
// import { Result } from '../../lib/utils/result';
import { AppError } from '../../lib/utils/errors';

// Temporary Result type definition - TODO: Fix export from result.ts
type Result<T, E = string> = { ok: true; data: T } | { ok: false; error: E };
import { logError, logInfo } from '../../lib/utils/logger';
import { storageService } from '../../services/storageService';

export interface AdminVerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  // Document fields
  document_type?: string;
  id_doc_url?: string;
  selfie_url?: string;
  poa_doc_url?: string;
  // Personal information
  full_name?: string;
  dob?: string;
  nationality?: string;
  phone?: string;
  location?: string;
  // User type information
  is_owner?: boolean;
  has_poa?: boolean;
  // Discovery and purpose
  how_did_you_find_us?: any;
  what_do_you_want_to_do?: any;
  // Status and review
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  // Joined user data
  user?: {
    id: string;
    email: string;
    full_name?: string;
    phone?: string;
  };
}

export interface VerificationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  todaySubmissions: number;
}

export const useAdminVerifications = (filters?: VerificationFilters) => {
  const [requests, setRequests] = useState<AdminVerificationRequest[]>([]);
  const [stats, setStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    todaySubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      console.log('useAdminVerifications - fetchRequests called');
      setLoading(true);
      setError(null);

      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`
          user.email.ilike.%${filters.search}%,
          user.full_name.ilike.%${filters.search}%,
          data->>'phone'.ilike.%${filters.search}%
        `);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error } = await query;
      console.log('useAdminVerifications - query result:', { data, error });

      if (error) {
        console.error('useAdminVerifications - query error:', error);
        throw error;
      }

      // Fetch user details for each request
      if (data && data.length > 0) {
        const userIds = data.map(req => req.user_id);
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id, email, full_name, phone')
          .in('id', userIds);

        if (userError) {
          console.error('useAdminVerifications - user fetch error:', userError);
        }

        // Merge user data with requests
        const requestsWithUsers = data.map(request => ({
          ...request,
          user: userData?.find(user => user.id === request.user_id)
        }));

        setRequests(requestsWithUsers);
        console.log('useAdminVerifications - set requests with users:', requestsWithUsers.length);
      } else {
        setRequests([]);
        console.log('useAdminVerifications - set requests: 0');
      }
      logInfo('useAdminVerifications', 'Requests fetched', { count: data?.length || 0 });

    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching verification requests';
      setError(errorMessage);
      logError('useAdminVerifications', 'Failed to fetch verification requests', { error: err });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('status, created_at');

      if (error) throw error;

      const total = data?.length || 0;
      const pending = data?.filter(r => r.status === 'pending').length || 0;
      const approved = data?.filter(r => r.status === 'approved').length || 0;
      const rejected = data?.filter(r => r.status === 'rejected').length || 0;

      const today = new Date().toISOString().split('T')[0];
      const todaySubmissions = data?.filter(r =>
        r.created_at.startsWith(today)
      ).length || 0;

      setStats({
        total,
        pending,
        approved,
        rejected,
        todaySubmissions
      });

    } catch (err: any) {
      logError('useAdminVerifications', 'Failed to fetch stats', { error: err });
    }
  }, []);

  const approveRequest = useCallback(async (requestId: string, notes?: string): Promise<Result<AdminVerificationRequest, AppError>> => {
    try {
      const { data: adminData } = await supabase.auth.getUser();
      if (!adminData.user) {
        throw new Error('Administrador no autenticado');
      }

      const { data: request, error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          notes,
          reviewed_by: adminData.user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error aprobando solicitud: ${error.message}`);
      }

      // Fetch user data separately
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .eq('id', request.user_id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // Merge user data with request
      const requestWithUser = {
        ...request,
        user: userData || undefined
      };

      // Update user verification status
      await supabase
        .from('profiles')
        .update({
          verification_status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', request.user_id);

      // Update local state
      setRequests(prev =>
        prev.map(r => r.id === requestId ? requestWithUser : r)
      );

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'verification_approved',
        title: 'Verificación Aprobada',
        message: '¡Felicitaciones! Tu solicitud de verificación ha sido aprobada.',
        data: {
          verification_id: requestId,
          notes
        }
      });

      logInfo('useAdminVerifications', 'Request approved', { requestId });
      return { ok: true, data: requestWithUser };

    } catch (err: any) {
      const error = new AppError(err.message || 'Error approving verification request');
      logError('useAdminVerifications', 'Failed to approve request', { error: err });
      return { ok: false, error };
    }
  }, []);

  const rejectRequest = useCallback(async (requestId: string, reason: string, notes?: string): Promise<Result<AdminVerificationRequest, AppError>> => {
    try {
      const { data: adminData } = await supabase.auth.getUser();
      if (!adminData.user) {
        throw new Error('Administrador no autenticado');
      }

      const { data: request, error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          notes: `${reason}${notes ? ` - ${notes}` : ''}`,
          reviewed_by: adminData.user.id,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select('*')
        .single();

      if (error) {
        throw new Error(`Error rechazando solicitud: ${error.message}`);
      }

      // Fetch user data separately
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone')
        .eq('id', request.user_id)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
      }

      // Merge user data with request
      const requestWithUser = {
        ...request,
        user: userData || undefined
      };

      // Update local state
      setRequests(prev =>
        prev.map(r => r.id === requestId ? requestWithUser : r)
      );

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: request.user_id,
        type: 'verification_rejected',
        title: 'Verificación Rechazada',
        message: `Tu solicitud de verificación ha sido rechazada. Razón: ${reason}`,
        data: {
          verification_id: requestId,
          reason,
          notes
        }
      });

      logInfo('useAdminVerifications', 'Request rejected', { requestId, reason });
      return { ok: true, data: requestWithUser };

    } catch (err: any) {
      const error = new AppError(err.message || 'Error rejecting verification request');
      logError('useAdminVerifications', 'Failed to reject request', { error: err });
      return { ok: false, error };
    }
  }, []);

  const getSignedUrl = useCallback(async (path: string): Promise<string | null> => {
    return storageService.getSignedUrl('profile-docs', path);
  }, []);

  const bulkApprove = useCallback(async (requestIds: string[], notes?: string): Promise<Result<AdminVerificationRequest[], AppError>> => {
    const results: AdminVerificationRequest[] = [];
    const errors: AppError[] = [];

    for (const requestId of requestIds) {
      const result = await approveRequest(requestId, notes);
      if (result.ok) {
        results.push(result.data);
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return { ok: false, error: new AppError(`Failed to approve ${errors.length} requests`) };
    }

    return { ok: true, data: results };
  }, [approveRequest]);

  const bulkReject = useCallback(async (requestIds: string[], reason: string, notes?: string): Promise<Result<AdminVerificationRequest[], AppError>> => {
    const results: AdminVerificationRequest[] = [];
    const errors: AppError[] = [];

    for (const requestId of requestIds) {
      const result = await rejectRequest(requestId, reason, notes);
      if (result.ok) {
        results.push(result.data);
      } else {
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      return { ok: false, error: new AppError(`Failed to reject ${errors.length} requests`) };
    }

    return { ok: true, data: results };
  }, [rejectRequest]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [fetchRequests, fetchStats]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-verification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'verification_requests'
        },
        (payload) => {
          logInfo('useAdminVerifications', 'Real-time update received', payload);
          fetchRequests();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRequests, fetchStats]);

  return {
    requests,
    stats,
    loading,
    error,
    refetch: fetchRequests,
    approveRequest,
    rejectRequest,
    bulkApprove,
    bulkReject,
    getSignedUrl
  };
};