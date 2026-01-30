import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
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
      </DialogContent>
    </Dialog>
  );
};
