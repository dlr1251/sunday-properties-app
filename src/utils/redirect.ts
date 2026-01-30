import { useNavigate } from 'react-router-dom';

export const useRedirect = () => {
  const navigate = useNavigate();

  const redirectToProfile = () => {
    console.log('🔄 Redirecting to profile page...');
    navigate('/profile', { replace: true });
  };

  const redirectToDashboard = () => {
    console.log('🔄 Redirecting to dashboard...');
    navigate('/dashboard', { replace: true });
  };

  const redirectToTestingUsers = () => {
    console.log('🔄 Redirecting to testing users...');
    navigate('/testing-users', { replace: true });
  };

  return {
    redirectToProfile,
    redirectToDashboard,
    redirectToTestingUsers
  };
};
