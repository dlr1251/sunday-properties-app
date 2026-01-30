import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';

export const useSignOutWithRedirect = () => {
  const navigate = useNavigate();
  const isSigningOut = useRef(false);

  const signOutAndRedirect = async (signOut: () => Promise<void>, redirectTo: string = '/testing-users') => {
    // Prevent multiple simultaneous signout calls
    if (isSigningOut.current) {
      return;
    }

    isSigningOut.current = true;
    try {
      await signOut();

      // Small delay to ensure state updates are processed before navigation
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 100);

    } catch (error) {
      console.error('❌ useSignOutWithRedirect: Error during signout:', error);
      // Show error to user and still redirect
      alert('Error al cerrar sesión. Redirigiendo...');
      navigate(redirectTo, { replace: true });
    } finally {
      isSigningOut.current = false;
    }
  };

  return { signOutAndRedirect };
};
