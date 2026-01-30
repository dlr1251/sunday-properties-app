import React, { useEffect } from 'react';
import { PropertyUploadWizard } from './PropertyUploadWizard/PropertyUploadWizard';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface PropertyUploadWizardModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

/**
 * Unified wrapper component for PropertyUploadWizard modal
 * Handles proper z-index layering above navbar and consistent modal styling
 */
export const PropertyUploadWizardModal: React.FC<PropertyUploadWizardModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="flex justify-end p-4 border-b bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Wizard content */}
        <div className="overflow-y-auto flex-1">
          <PropertyUploadWizard
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

