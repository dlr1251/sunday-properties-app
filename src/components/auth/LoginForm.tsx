import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToRegister 
}) => {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || t('auth.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('auth.loginTitle')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('auth.placeholders.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.placeholders.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSwitchToRegister?.();
            }}
          >
            {t('auth.registerHere')}
          </Button>
        </p>
      </div>

      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="link"
          className="text-xs text-muted-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Implement password reset
            alert(t('auth.forgotPasswordComingSoon'));
          }}
        >
          {t('auth.forgotPassword')}
        </Button>
      </div>
    </Card>
  );
};