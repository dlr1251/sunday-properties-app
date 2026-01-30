import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VerificationWizard } from './VerificationWizard';

export const VerificationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // El wizard ya maneja la navegación al dashboard después de enviar exitosamente
    // Este callback es útil si necesitamos hacer algo adicional después de completar
    navigate('/dashboard');
  };

  const handleCancel = () => {
    // Si cancela desde el primer paso, volver al dashboard
    navigate('/dashboard');
  };

  return <VerificationWizard onComplete={handleComplete} onCancel={handleCancel} />;
};

