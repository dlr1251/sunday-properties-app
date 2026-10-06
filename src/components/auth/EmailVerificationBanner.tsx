import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  onDismiss,
  showDismiss = true,
}) => {
  const { t } = useTranslation();
  const { user, resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);
  const isVerified = Boolean((user as any)?.email_confirmed_at || (user as any)?.email_verified);

  if (!user || isVerified) return null;

  const handleResendVerification = async () => {
    try {
      setResending(true);
      await resendVerificationEmail();
      toast.success(t('auth.verificationSent'));
    } catch (error: any) {
      toast.error(error.message || t('auth.resetEmailFailed'));
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <div className="text-sm">{t('auth.emailNotVerified')}</div>
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
            {resending ? t('common.sending') : t('auth.resendVerification')}
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
