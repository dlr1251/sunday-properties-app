import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';

function recoveryParamsFromLocation(search: string, hash: string) {
  const query = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
  return {
    code: query.get('code'),
    tokenHash: query.get('token_hash'),
    type: query.get('type') || hashParams.get('type'),
    accessToken: hashParams.get('access_token'),
  };
}

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [linkInvalid, setLinkInvalid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const establishRecoverySession = async () => {
      const params = recoveryParamsFromLocation(window.location.search, window.location.hash);
      const hasRecoveryParams = Boolean(
        params.code || params.tokenHash || params.accessToken || params.type === 'recovery'
      );

      try {
        if (params.tokenHash && params.type === 'recovery') {
          const { error: otpError } = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: params.tokenHash,
          });
          if (otpError) throw otpError;
        } else {
          // PKCE (?code=) and implicit (#access_token) are consumed by detectSessionInUrl.
          await supabase.auth.getSession();
        }

        const { data } = await supabase.auth.getUser();
        if (!cancelled && hasRecoveryParams && !data.user) {
          setLinkInvalid(true);
          setError(t('auth.recoveryLinkInvalid'));
        }
      } catch {
        if (!cancelled && hasRecoveryParams) {
          setLinkInvalid(true);
          setError(t('auth.recoveryLinkInvalid'));
        }
      }
    };

    establishRecoverySession();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError(t('auth.passwordRequirements'));
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError(t('auth.errors.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLinkInvalid(true);
        setError(t('auth.recoveryLinkInvalid'));
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage(t('auth.passwordUpdated'));
    } catch (err: unknown) {
      const fallback = t('auth.passwordUpdateFailed');
      setError(err instanceof Error ? err.message || fallback : fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('auth.resetPasswordTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        {message ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-success">{message}</p>
            <Button asChild className="w-full">
              <Link to="/dashboard">{t('auth.goToDashboard')}</Link>
            </Button>
          </div>
        ) : linkInvalid ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-destructive">{error || t('auth.recoveryLinkInvalid')}</p>
            <Button asChild className="w-full">
              <Link to="/forgot-password">{t('auth.recoveryRequestNew')}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">{t('auth.passwordRequirements')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t('auth.confirmPassword')}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('common.updating') : t('auth.updatePassword')}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResetPasswordForm;
