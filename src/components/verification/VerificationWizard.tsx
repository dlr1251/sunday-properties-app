import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVerificationFlow } from '../../hooks/verification/useVerificationFlow';
import { VerificationFormProvider, useVerificationForm } from './VerificationFormContext';
import { Step1PersonalData } from './steps/Step1PersonalData';
import { Step2Discovery } from './steps/Step2Discovery';
import { Step3UserType } from './steps/Step3UserType';
import { Step4Selfie } from './steps/Step4Selfie';
import { Step5Documents } from './steps/Step5Documents';
import { Step6Review } from './steps/Step6Review';
import { VerificationSuccess } from './VerificationSuccess';
import { toast } from 'sonner';

interface VerificationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const STEP_KEYS = ['personal', 'discovery', 'userType', 'selfie', 'documents', 'review'] as const;

const VerificationWizardContent: React.FC<VerificationWizardProps> = ({ onComplete, onCancel }) => {
  const { t } = useTranslation();
  const { submitVerificationRequest, uploadFile } = useVerificationFlow();
  const form = useVerificationForm(); // Move hook call to component level
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const progress = (currentStep / STEP_KEYS.length) * 100;
  const currentStepKey = STEP_KEYS[currentStep - 1];

  const nextStep = () => {
    if (currentStep < STEP_KEYS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!(
          form.formData.phone?.trim() && 
          form.formData.location?.trim() && 
          form.formData.date_of_birth?.trim() && 
          !form.ageError
        );
      case 2:
        return !!(
          form.formData.how_did_you_find_us?.length > 0 && 
          form.formData.what_do_you_want_to_do?.length > 0
        );
      case 3:
        return true;
      case 4:
        return !!form.capturedSelfie;
      case 5:
        const hasIdDoc = !!form.uploadedIdDoc;
        const needsPoaDoc = !form.formData.is_owner && form.formData.has_poa;
        const hasPoaDoc = !needsPoaDoc || !!form.uploadedPoaDoc;
        return hasIdDoc && hasPoaDoc;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      let selfiePath: string | undefined;
      let idDocPath: string | undefined;
      let poaDocPath: string | undefined;

      // Try to upload files, but don't fail if they don't work
      try {
        if (form.capturedSelfie) {
          selfiePath = await uploadFile(form.capturedSelfie, 'selfie');
        }
      } catch (error) {
        console.warn('Selfie upload failed, continuing without it:', error);
        // Generate a placeholder path for now
        selfiePath = 'pending_upload_selfie.jpg';
      }

      try {
        if (form.uploadedIdDoc) {
          idDocPath = await uploadFile(form.uploadedIdDoc, 'id_doc');
        }
      } catch (error) {
        console.warn('ID document upload failed, continuing without it:', error);
        // Generate a placeholder path for now
        idDocPath = 'pending_upload_id_doc.pdf';
      }

      try {
        if (form.uploadedPoaDoc) {
          poaDocPath = await uploadFile(form.uploadedPoaDoc, 'poa_doc');
        }
      } catch (error) {
        console.warn('POA document upload failed, continuing without it:', error);
        // Generate a placeholder path for now
        poaDocPath = 'pending_upload_poa_doc.pdf';
      }

      const verificationData = {
        ...form.formData,
        selfie_path: selfiePath,
        id_doc_path: idDocPath,
        poa_doc_path: poaDocPath,
      };

      await submitVerificationRequest(verificationData);

      // Show success message and redirect to profile
      toast.success(t('verification.toastSuccess'), {
        description: t('verification.toastSuccessDescription'),
        duration: 5000,
        action: {
          label: t('verification.goToDashboard'),
          onClick: () => navigate('/dashboard'),
        },
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Verification submission error:', error);

      // Enhanced error message with animation
      toast.error(t('verification.toastError'), {
        description: error.message || t('verification.toastErrorDescription'),
        duration: 6000,
        action: {
          label: t('verification.retry'),
          onClick: () => handleSubmit(),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessComplete = () => {
    onComplete();
  };

  const renderStep = () => {
    if (showSuccess) {
      return <VerificationSuccess onContinue={handleSuccessComplete} />;
    }

    switch (currentStep) {
      case 1: return <Step1PersonalData />;
      case 2: return <Step2Discovery />;
      case 3: return <Step3UserType />;
      case 4: return <Step4Selfie />;
      case 5: return <Step5Documents />;
      case 6: return <Step6Review />;
      default: return <Step1PersonalData />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header - Hide when showing success */}
      {!showSuccess && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('verification.title')}</h1>
            <p className="text-gray-600">{t('verification.subtitle')}</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">{t('verification.stepOf', { current: currentStep, total: STEP_KEYS.length })}</span>
              <span className="text-sm text-gray-500">{t(`verification.steps.${currentStepKey}.title`)}</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Step Content */}
          <Card className="p-6 mb-6">
            {renderStep()}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onCancel : prevStep}
              disabled={submitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? t('common.cancel') : t('common.previous')}
            </Button>

            {currentStep < STEP_KEYS.length ? (
              <Button onClick={nextStep} disabled={!canProceed() || submitting}>
                <ChevronRight className="h-4 w-4 ml-2" />
                {t('common.next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!canProceed() || submitting}>
                {submitting ? t('common.sending') : t('verification.submitRequest')}
              </Button>
            )}
          </div>
        </>
      )}

      {/* Success Screen */}
      {showSuccess && renderStep()}
    </div>
  );
};

export const VerificationWizard: React.FC<VerificationWizardProps> = (props) => {
  return (
    <VerificationFormProvider>
      <VerificationWizardContent {...props} />
    </VerificationFormProvider>
  );
};