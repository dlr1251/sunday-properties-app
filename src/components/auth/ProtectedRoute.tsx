import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'registered' | 'verified' | 'premium' | 'admin' | 'lawyer' | 'superadmin';
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-muted-foreground">
            Debes iniciar sesión para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasRequiredRole(user.user_type, requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Permisos Insuficientes</h2>
          <p className="text-muted-foreground">
            No tienes los permisos necesarios para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const hasRequiredRole = (
  userRole: string, 
  requiredRole: string
): boolean => {
  const roleHierarchy = {
    'registered': 1,
    'verified': 2,
    'premium': 3,
    'admin': 4,
    'lawyer': 5,
    'superadmin': 6,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
};
