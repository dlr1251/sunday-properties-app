import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Result } from '../../lib/utils/result';
import { AppError } from '../../lib/utils/errors';
import { logError, logInfo } from '../../lib/utils/logger';

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  data: any;
  selfie_path?: string;
  id_doc_path?: string;
  is_owner?: boolean;
  has_poa?: boolean;
  poa_doc_path?: string;
  notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationStatus {
  hasRequest: boolean;
  request?: VerificationRequest;
  status: 'none' | 'pending' | 'approved' | 'rejected';
  canSubmitNew: boolean;
  lastUpdated?: string;
}

export const useUserVerification = () => {
  const [status, setStatus] = useState<VerificationStatus>({
    hasRequest: false,
    status: 'none',
    canSubmitNew: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVerificationStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setStatus({ hasRequest: false, status: 'none', canSubmitNew: false });
        return;
      }

      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setStatus({
          hasRequest: true,
          request: data,
          status: data.status,
          canSubmitNew: data.status === 'rejected', // Can submit new if rejected
          lastUpdated: data.updated_at
        });
      } else {
        setStatus({
          hasRequest: false,
          status: 'none',
          canSubmitNew: true
        });
      }

      logInfo('useUserVerification', 'Verification status fetched', { hasRequest: !!data });

    } catch (err: any) {
      const errorMessage = err.message || 'Error fetching verification status';
      setError(errorMessage);
      logError('useUserVerification', 'Failed to fetch verification status', { error: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const submitVerificationRequest = useCallback(async (verificationData: any): Promise<Result<VerificationRequest, AppError>> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuario no autenticado');
      }

      // Update profile with personal data first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: verificationData.phone,
          location: verificationData.location,
          date_of_birth: verificationData.date_of_birth,
          nationality: verificationData.nationality,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.user.id);

      if (profileError) {
        throw new Error(`Error actualizando perfil: ${profileError.message}`);
      }

      // Create verification request
      const { data: request, error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: userData.user.id,
          status: 'pending',
          data: {
            phone: verificationData.phone,
            location: verificationData.location,
            date_of_birth: verificationData.date_of_birth,
            nationality: verificationData.nationality,
            how_did_you_find_us: verificationData.how_did_you_find_us,
            what_do_you_want_to_do: verificationData.what_do_you_want_to_do,
          },
          selfie_path: verificationData.selfie_path,
          id_doc_path: verificationData.id_doc_path,
          is_owner: verificationData.is_owner,
          has_poa: verificationData.has_poa,
          poa_doc_path: verificationData.poa_doc_path,
        })
        .select()
        .single();

      if (requestError) {
        throw new Error(`Error creando solicitud: ${requestError.message}`);
      }

      // Update local state
      setStatus({
        hasRequest: true,
        request,
        status: 'pending',
        canSubmitNew: false,
        lastUpdated: request.created_at
      });

      logInfo('useUserVerification', 'Verification request submitted', { requestId: request.id });
      return { ok: true, data: request };

    } catch (err: any) {
      const error = new AppError(err.message || 'Error submitting verification request');
      logError('useUserVerification', 'Failed to submit verification request', { error: err });
      return { ok: false, error };
    }
  }, []);

  const updateVerificationRequest = useCallback(async (updates: Partial<VerificationRequest>): Promise<Result<VerificationRequest, AppError>> => {
    try {
      if (!status.request?.id) {
        throw new Error('No verification request to update');
      }

      const { data: request, error } = await supabase
        .from('verification_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', status.request.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating request: ${error.message}`);
      }

      // Update local state
      setStatus(prev => ({
        ...prev,
        request,
        status: request.status,
        canSubmitNew: request.status === 'rejected',
        lastUpdated: request.updated_at
      }));

      logInfo('useUserVerification', 'Verification request updated', { requestId: request.id, updates });
      return { ok: true, data: request };

    } catch (err: any) {
      const error = new AppError(err.message || 'Error updating verification request');
      logError('useUserVerification', 'Failed to update verification request', { error: err });
      return { ok: false, error };
    }
  }, [status.request?.id]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  // Subscribe to real-time updates
  useEffect(() => {
    const { data: userData } = supabase.auth.getUser();

    if (!userData.user) return;

    const channel = supabase
      .channel('verification-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'verification_requests',
          filter: `user_id=eq.${userData.user.id}`
        },
        (payload) => {
          logInfo('useUserVerification', 'Real-time verification update received', payload);
          fetchVerificationStatus(); // Refresh status
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchVerificationStatus]);

  return {
    status,
    loading,
    error,
    refetch: fetchVerificationStatus,
    submitRequest: submitVerificationRequest,
    updateRequest: updateVerificationRequest
  };
};
