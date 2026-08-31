import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '../../ui/label';
import { Checkbox } from '../../ui/checkbox';
import { Search } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';

export const Step2Discovery: React.FC = () => {
  const { t } = useTranslation();
  const { formData, setFormData } = useVerificationForm();

  const discoveryOptions = [
    { value: 'facebook', label: t('verification.discovery.facebook') },
    { value: 'instagram', label: t('verification.discovery.instagram') },
    { value: 'google', label: t('verification.discovery.google') },
    { value: 'real_estate_website', label: t('verification.discovery.realEstateWebsite') },
    { value: 'friend_referral', label: t('verification.discovery.friendReferral') },
    { value: 'agent_referral', label: t('verification.discovery.agentReferral') },
    { value: 'other', label: t('verification.discovery.other') },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Search className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.discovery.title')}</h3>
        <p className="text-muted-foreground">{t('verification.discovery.subtitle')}</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t('verification.discovery.howDidYouFindUs')}
          </Label>
          <div className="space-y-2 mt-2">
            {discoveryOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`discovery-${option.value}`}
                  checked={formData.how_did_you_find_us?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData.how_did_you_find_us || [];
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        how_did_you_find_us: [...currentValues, option.value]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        how_did_you_find_us: currentValues.filter(v => v !== option.value)
                      }));
                    }
                  }}
                />
                <Label htmlFor={`discovery-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            {t('verification.discovery.whatDoYouWant')}
          </Label>
          <div className="space-y-2 mt-2">
            {[
              { value: 'buy', label: t('verification.discovery.buy') },
              { value: 'sell', label: t('verification.discovery.sell') },
              { value: 'invest', label: t('verification.discovery.invest') },
              { value: 'represent', label: t('verification.discovery.represent') },
              { value: 'consult', label: t('verification.discovery.consult') },
              { value: 'other', label: t('verification.discovery.other') },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`purpose-${option.value}`}
                  checked={formData.what_do_you_want_to_do?.includes(option.value) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData.what_do_you_want_to_do || [];
                    if (checked) {
                      setFormData(prev => ({
                        ...prev,
                        what_do_you_want_to_do: [...currentValues, option.value]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        what_do_you_want_to_do: currentValues.filter(v => v !== option.value)
                      }));
                    }
                  }}
                />
                <Label htmlFor={`purpose-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
