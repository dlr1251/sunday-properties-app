import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const isVerified = Boolean((user as any)?.email_confirmed_at);

  if (!user || isVerified) return null;

  const handleResend = async () => {
    await resendVerificationEmail();
  };

  return (
    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
      <AlertDescription>
        Tu email aún no está verificado. Algunas acciones estarán restringidas (publicar propiedades, agendar visitas, realizar ofertas).
        <div className="mt-3">
          <Button size="sm" variant="outline" onClick={handleResend}>
            Reenviar correo de verificación
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ 
  onDismiss, 
  showDismiss = true 
}) => {
  const { user, resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);

  // Don't show banner if user is not logged in or email is verified
  if (!user || user.email_verified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      toast.success('Correo de verificación enviado. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el correo de verificación');
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <div className="font-medium mb-1">Verifica tu correo electrónico</div>
          <div className="text-sm">
            Para acceder a todas las funcionalidades, necesitas verificar tu correo electrónico.
            <br />
            <strong>Restricciones actuales:</strong> No puedes publicar propiedades, agendar visitas o enviar ofertas.
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResendVerification}
            disabled={resending}
            className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
          >
            <Mail className="mr-2 h-4 w-4" />
            {resending ? 'Enviando...' : 'Reenviar correo'}
          </Button>
          {showDismiss && onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-yellow-600 hover:bg-yellow-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;
