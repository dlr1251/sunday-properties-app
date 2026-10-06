import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { useCamera } from '../../../hooks/useCamera';
import { useVerificationForm } from '../VerificationFormContext';

export const Step4Selfie: React.FC = () => {
  const { t } = useTranslation();
  const {
    videoRef,
    canvasRef,
    isCapturing,
    cameraLoading,
    capturedSelfie,
    setCapturedSelfie,
    startCamera,
    stopCamera,
    captureSelfie,
    handleFileUpload,
  } = useCamera();

  const { setCapturedSelfie: setFormSelfie } = useVerificationForm();

  // Sync with form context
  useEffect(() => {
    if (capturedSelfie) {
      setFormSelfie(capturedSelfie);
    }
  }, [capturedSelfie, setFormSelfie]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Camera className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.selfie.title')}</h3>
        <p className="text-muted-foreground">{t('verification.selfie.subtitle')}</p>
      </div>

      {!capturedSelfie ? (
        <div className="space-y-4">
          {!isCapturing ? (
            <div className="text-center">
              <Button onClick={startCamera} className="mb-4" disabled={cameraLoading}>
                <Camera className="h-4 w-4 mr-2" />
                {cameraLoading ? t('verification.selfie.activatingCamera') : t('verification.selfie.activateCamera')}
              </Button>
              {cameraLoading && (
                <div className="mb-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">{t('verification.selfie.loadingCamera')}</p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {t('verification.selfie.orUpload')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto object-cover rounded-lg"
                  style={{ maxHeight: '400px' }}
                />
                {/* Oval face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-60 border-2 border-dashed border-white/70 rounded-full flex items-center justify-center">
                    <div className="w-40 h-52 border border-white/50 rounded-full"></div>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex gap-2 justify-center">
                <Button onClick={captureSelfie} className="bg-green-600 hover:bg-green-700">
                  <Camera className="h-4 w-4 mr-2" />
                  {t('verification.selfie.capture')}
                </Button>
                <Button variant="outline" onClick={stopCamera}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground mb-4">
              {t('verification.selfie.alsoUpload')}
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="selfie-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
            <Button asChild>
              <label htmlFor="selfie-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {t('verification.selfie.uploadPhoto')}
              </label>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-w-md mx-auto">
            <img
              src={capturedSelfie}
              alt={t('verification.selfie.capturedAlt')}
              className="w-full rounded-lg border"
            />
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={() => setCapturedSelfie(null)}>
              <X className="h-4 w-4 mr-2" />
              {t('verification.selfie.retake')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
