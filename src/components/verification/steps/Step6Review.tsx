import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, User, Search, Camera, FileText } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step6Review: React.FC = () => {
  const { t } = useTranslation();
  const {
    formData,
    capturedSelfie,
    uploadedIdDoc,
    uploadedPoaDoc,
  } = useVerificationForm();

  const valueToDisplayText: Record<string, string> = {
    facebook: t('verification.discovery.facebook'),
    instagram: t('verification.discovery.instagram'),
    google: t('verification.discovery.google'),
    real_estate_website: t('verification.discovery.realEstateWebsite'),
    friend_referral: t('verification.discovery.friendReferral'),
    agent_referral: t('verification.discovery.agentReferral'),
    other: t('verification.discovery.other'),
    buy: t('verification.discovery.buy'),
    sell: t('verification.discovery.sell'),
    invest: t('verification.discovery.invest'),
    represent: t('verification.discovery.represent'),
    consult: t('verification.discovery.consult'),
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Check className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.review.title')}</h3>
        <p className="text-muted-foreground">{t('verification.review.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {/* Personal Data */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">{t('verification.review.personalData')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
            <div><span className="text-muted-foreground">{t('verification.review.phone')}</span> {formData.phone}</div>
            <div><span className="text-muted-foreground">{t('verification.review.location')}</span> {formData.location}</div>
            <div><span className="text-muted-foreground">{t('verification.review.dateOfBirth')}</span> {formData.date_of_birth}</div>
            <div><span className="text-muted-foreground">{t('verification.review.nationality')}</span> {formData.nationality}</div>
          </div>
        </div>

        {/* Discovery */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">{t('verification.review.discovery')}</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
            <div><span className="text-muted-foreground">{t('verification.review.howFound')}</span> {formData.how_did_you_find_us?.map(v => valueToDisplayText[v] || v).join(', ')}</div>
            <div><span className="text-muted-foreground">{t('verification.review.whatWant')}</span> {formData.what_do_you_want_to_do?.map(v => valueToDisplayText[v] || v).join(', ')}</div>
          </div>
        </div>

        {/* User Type */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">{t('verification.review.userType')}</h4>
          </div>
          <div className="text-sm bg-gray-50 rounded-lg p-4">
            <p className="text-muted-foreground mb-2">{t('verification.review.type')}</p>
            <p>{formData.is_owner ? t('verification.review.directOwner') : (formData.has_poa ? t('verification.review.intermediaryWithPoa') : t('verification.review.intermediaryWithoutPoa'))}</p>
          </div>
        </div>

        {/* Selfie */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Camera className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">{t('verification.review.facePhoto')}</h4>
          </div>
          <div className="text-sm bg-gray-50 rounded-lg p-4">
            {capturedSelfie ? (
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span>{t('verification.review.photoCaptured')}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-red-600">{t('verification.review.photoMissing')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">{t('verification.review.docs')}</h4>
          </div>
          <div className="space-y-3">
            <div className="text-sm bg-gray-50 rounded-lg p-4">
              <p className="text-muted-foreground mb-2">{t('verification.review.idCard')}</p>
              {uploadedIdDoc ? (
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>{uploadedIdDoc.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-red-600">{t('verification.review.notUploaded')}</span>
                </div>
              )}
            </div>

            {!formData.is_owner && formData.has_poa && (
              <div className="text-sm bg-gray-50 rounded-lg p-4">
                <p className="text-muted-foreground mb-2">{t('verification.review.poa')}</p>
                {uploadedPoaDoc ? (
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span>{uploadedPoaDoc.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-red-600">{t('verification.review.notUploaded')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>{t('verification.review.note')}</strong> {t('verification.review.noteBody')}
        </p>
      </div>
    </div>
  );
};
