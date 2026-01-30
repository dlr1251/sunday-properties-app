import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin 
}) => {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'agent' | 'lawyer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return false;
    }
    if (!formData.name.trim()) {
      setError(t('auth.errors.nameRequired'));
      return false;
    }
    if (!formData.email.trim()) {
      setError(t('auth.errors.emailRequired'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        role: formData.role
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('auth.errors.registerFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('auth.accountCreated')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('auth.accountCreatedMessage')}
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">{t('auth.registerTitle')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('auth.registerSubtitle')}
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
          <Label htmlFor="name">{t('auth.fullName')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder={t('auth.placeholders.fullName')}
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder={t('auth.placeholders.email')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('auth.phone')} ({t('common.optional')})</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder={t('auth.placeholders.phone')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">{t('auth.userType')}</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleInputChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('auth.placeholders.selectUserType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">{t('auth.userTypes.user')}</SelectItem>
              <SelectItem value="agent">{t('auth.userTypes.agent')}</SelectItem>
              <SelectItem value="lawyer">{t('auth.userTypes.lawyer')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.placeholders.password')}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('auth.placeholders.password')}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
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
          {loading ? t('auth.creatingAccount') : t('auth.registerTitle')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.hasAccount')}{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSwitchToLogin?.();
            }}
          >
            {t('auth.loginHere')}
          </Button>
        </p>
      </div>

      <div className="mt-4 text-xs text-muted-foreground text-center">
        {t('auth.termsAgree')}{' '}
        <Button type="button" variant="link" className="p-0 h-auto text-xs">
          {t('auth.termsOfService')}
        </Button>{' '}
        {t('auth.and')}{' '}
        <Button type="button" variant="link" className="p-0 h-auto text-xs">
          {t('auth.privacyPolicy')}
        </Button>
      </div>
    </Card>
  );
};