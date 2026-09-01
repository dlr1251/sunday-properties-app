import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  mode?: string;
  onModeChange?: (mode: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login',
  mode: controlledMode,
  onModeChange
}) => {
  const { t } = useTranslation();
  const [internalMode, setInternalMode] = useState<'login' | 'register'>(defaultMode);
  
  // Use controlled mode if provided, otherwise use internal state
  const currentMode = (controlledMode as 'login' | 'register') || internalMode;
  
  // Sync internal mode with controlled mode
  useEffect(() => {
    if (controlledMode && (controlledMode === 'login' || controlledMode === 'register')) {
      setInternalMode(controlledMode);
    }
  }, [controlledMode]);

  const handleSuccess = () => {
    onClose();
  };

  const switchToRegister = () => {
    if (onModeChange) {
      onModeChange('register');
    } else {
      setInternalMode('register');
    }
  };

  const switchToLogin = () => {
    if (onModeChange) {
      onModeChange('login');
    } else {
      setInternalMode('login');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="bg-brand-hero px-6 pt-8 pb-6 text-center">
          <BrandLogo to={null} heightClassName="h-14" variant="onDark" className="justify-center" />
        </div>
        <div className="px-6 pb-6">
        <DialogHeader className="pt-4">
          <DialogTitle className="text-center text-foreground">
            {currentMode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </DialogTitle>
        </DialogHeader>
        
        {currentMode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm 
            onSuccess={handleSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
