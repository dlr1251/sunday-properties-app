import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const useVerification = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkVerificationStatus = async () => {
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        // Only log error if it's not a missing session error
        if (!authError.message.includes('session missing') && !authError.message.includes('Auth session missing')) {
          console.error('Auth error:', authError);
        }
        setVerificationStatus(null);
        return;
      }

      if (!userData.user) {
        setVerificationStatus(null);
        return;
      }

      // Check verification status from profiles table
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', userData.user.id)
          .single();

        if (error) {
          console.error('Error checking verification status (continuing with null):', error);
          setVerificationStatus(null);
          return;
        }

        setVerificationStatus(data?.verification_status || null);
      } catch (dbError) {
        console.error('Database error checking verification status (continuing with null):', dbError);
        setVerificationStatus(null);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const isVerified = async (): Promise<boolean> => {
    await checkVerificationStatus();
    return verificationStatus === 'verified';
  };

  useEffect(() => {
    checkVerificationStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkVerificationStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    verificationStatus,
    loading,
    isVerified,
    refreshStatus: checkVerificationStatus,
  };
};
