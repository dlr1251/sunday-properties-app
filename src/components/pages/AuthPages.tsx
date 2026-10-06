import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../auth/LoginForm';
import { RegisterForm } from '../auth/RegisterForm';
import ForgotPasswordForm from '../auth/ForgotPasswordForm';
import ResetPasswordForm from '../auth/ResetPasswordForm';

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10">
      {children}
    </div>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  return (
    <AuthShell>
      <LoginForm
        onSwitchToRegister={() => undefined}
        registerHref="/signup"
        forgotHref="/forgot-password"
      />
      <p className="sr-only">{t('auth.loginTitle')}</p>
    </AuthShell>
  );
}

export function SignupPage() {
  return (
    <AuthShell>
      <RegisterForm onSwitchToLogin={() => undefined} loginHref="/login" />
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <AuthShell>
      <ForgotPasswordForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link to="/login" className="underline underline-offset-2 hover:text-foreground">
          {t('auth.loginHere')}
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
