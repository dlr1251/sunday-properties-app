import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from './LoginForm';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Lock, Mail, CheckCircle } from 'lucide-react';
import { canAccessAdminPanel, getRestrictionMessage } from '../../utils/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredRole?: 'registered' | 'verified' | 'premium' | 'lawyer' | 'admin' | 'super_admin';
  requiredPermission?: 'publish' | 'offer' | 'visit' | 'admin' | 'approve' | 'review' | 'manage_users' | 'manage_visits' | 'view_reports' | 'manage_negotiations' | 'view_audit' | 'manage_settings';
  requireVerified?: boolean;
  requireEmailConfirmed?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredRole,
  requiredPermission,
  requireVerified = false,
  requireEmailConfirmed = false,
  fallback
}) => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    console.log('🔄 ProtectedRoute: Login successful, redirecting to dashboard...');
    navigate('/dashboard', { replace: true });
  };

  // Check if AuthProvider is available (signOut will be a no-op function if not)
  if (!signOut || typeof signOut !== 'function') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            AuthProvider Not Available
          </h2>
          <p className="text-muted-foreground">
            Please refresh the page to reload the authentication context.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Acceso Requerido
            </h1>
            <p className="text-muted-foreground">
              Inicia sesión para acceder a esta sección
            </p>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    );
  }

  // Check email confirmation requirement
  if (requireEmailConfirmed && user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Email no confirmado
            </h2>
            <p className="text-muted-foreground mb-4">
              Debes confirmar tu email para acceder a esta sección
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Revisa tu bandeja de entrada y confirma tu email para continuar.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  // Check verification requirement
  if (requireVerified && profile && profile.verification_status !== 'verified') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Verificación requerida
            </h2>
            <p className="text-muted-foreground mb-4">
              Debes completar la verificación de identidad para acceder a esta sección
            </p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Completa el proceso de verificación en tu perfil para continuar.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }

  // Check role requirement (new allowedRoles or legacy requiredRole)
  if (profile) {
    let hasAccess = false;
    
    if (allowedRoles && allowedRoles.length > 0) {
      hasAccess = allowedRoles.includes(profile.role);
    } else if (requiredRole) {
      const roleHierarchy = {
        'registered': 1,
        'verified': 2,
        'premium': 3,
        'lawyer': 4,
        'admin': 5,
        'super_admin': 6
      };

      const userLevel = roleHierarchy[profile.role] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;
      hasAccess = userLevel >= requiredLevel;
    } else {
      hasAccess = true; // No role requirement
    }

    if (!hasAccess) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Acceso Denegado
              </h2>
              <p className="text-muted-foreground mb-4">
                No tienes permisos para acceder a esta sección
              </p>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {allowedRoles ? (
                    <>Se requiere uno de estos roles: <strong>{allowedRoles.join(', ')}</strong><br />
                    Tu rol actual: <strong>{profile.role}</strong></>
                  ) : (
                    <>Se requiere rol: <strong>{requiredRole}</strong><br />
                    Tu rol actual: <strong>{profile.role}</strong></>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </div>
      );
    }
  }

  // Check specific permission requirement
  if (requiredPermission && profile) {
    let hasPermission = false;

    switch (requiredPermission) {
      case 'admin':
        hasPermission = canAccessAdminPanel(profile);
        break;
      default:
        hasPermission = true; // For now, allow other permissions
    }

    if (!hasPermission) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Permiso requerido
              </h2>
              <p className="text-muted-foreground mb-4">
                {getRestrictionMessage(requiredPermission, profile)}
              </p>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tienes los permisos necesarios para acceder a esta sección.
                </AlertDescription>
              </Alert>
            </div>
          </Card>
        </div>
      );
    }
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};