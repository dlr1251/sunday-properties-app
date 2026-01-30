import React, { useEffect } from 'react';
import { Dialog, DialogContent } from './dialog';
import { Button } from './button';
import { CheckCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  open,
  onClose,
  title = '¡Éxito!',
  message = 'Tu solicitud ha sido enviada exitosamente.',
  redirectTo = '/dashboard',
  redirectLabel = 'Ir al Dashboard'
}) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    onClose();
    navigate(redirectTo);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <div className="text-center w-full max-w-md p-6">
          {/* Animated Check Circle */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 animate-pulse" />
          </div>
          
          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">{message}</p>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRedirect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              {redirectLabel}
            </Button>
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

