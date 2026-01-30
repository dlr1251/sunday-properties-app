import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function useNegotiationPermissions(negotiationId: string) {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkPermissions() {
      console.log('🔐 [useNegotiationPermissions] Checking permissions for negotiation:', negotiationId);
      console.log('👤 [useNegotiationPermissions] Current user:', user?.id || 'null');

      if (!user) {
        console.log('🚫 [useNegotiationPermissions] No authenticated user, denying access');
        if (isMounted) {
          setCanAccess(false);
          setCanEdit(false);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('📡 [useNegotiationPermissions] Querying negotiation participants...');

        // Check if user is in participants array
        const { data, error } = await supabase
          .from('negotiations')
          .select('participants')
          .eq('id', negotiationId)
          .single();

        if (error) {
          console.error('❌ [useNegotiationPermissions] Database query failed:', error);
          throw error;
        }

        console.log('📊 [useNegotiationPermissions] Negotiation data:', data);
        const isParticipant = data?.participants?.includes(user.id) ?? false;
        console.log('✅ [useNegotiationPermissions] User is participant:', isParticipant);

        if (isMounted) {
          setCanAccess(isParticipant);
          setCanEdit(isParticipant); // For now, all participants can edit
          setLoading(false);
          console.log('🎯 [useNegotiationPermissions] Permissions set - canAccess:', isParticipant, 'canEdit:', isParticipant);
        }
      } catch (err: any) {
        console.error('💥 [useNegotiationPermissions] Permission check failed:', err);
        console.error('📋 [useNegotiationPermissions] Error details:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
          stack: err?.stack
        });

        if (isMounted) {
          setError(err?.message || 'Error checking permissions');
          setCanAccess(false);
          setCanEdit(false);
          setLoading(false);
        }
      }
    }

    checkPermissions();

    return () => {
      isMounted = false;
    };
  }, [negotiationId, user]);

  return { canAccess, canEdit, loading, error };
}
