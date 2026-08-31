import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { User, FileText } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step3UserType: React.FC = () => {
  const { t } = useTranslation();
  const { formData, setFormData } = useVerificationForm();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.userType.title')}</h3>
        <p className="text-muted-foreground">{t('verification.userType.subtitle')}</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-medium">{t('verification.userType.areYouOwner')}</Label>
          <div className="space-y-3 mt-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="owner-yes"
                name="is_owner"
                checked={formData.is_owner}
                onChange={() => setFormData(prev => ({ ...prev, is_owner: true }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="owner-yes" className="text-sm">
                {t('verification.userType.ownerYes')}
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="owner-no"
                name="is_owner"
                checked={!formData.is_owner}
                onChange={() => setFormData(prev => ({ ...prev, is_owner: false }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="owner-no" className="text-sm">
                {t('verification.userType.ownerNo')}
              </Label>
            </div>
          </div>
        </div>

        {!formData.is_owner && (
          <div className="border-t pt-6">
            <Label className="flex items-center gap-2 text-base font-medium">
              <FileText className="h-4 w-4" />
              {t('verification.userType.additionalDocs')}
            </Label>
            <div className="mt-3 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_poa"
                  checked={formData.has_poa}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, has_poa: checked }))}
                />
                <Label htmlFor="has_poa" className="text-sm">
                  {t('verification.userType.hasPoa')}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                {t('verification.userType.poaHint')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
