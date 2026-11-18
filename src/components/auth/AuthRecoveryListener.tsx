import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AuthRecoveryListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'PASSWORD_RECOVERY') return;
      const dest = `/reset-password${window.location.search}${window.location.hash}`;
      if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== dest) {
        navigate(dest, { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
}
