import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Phone, MapPin, Calendar, Flag, AlertCircle, CheckCircle } from 'lucide-react';
import { useVerificationForm } from '../VerificationFormContext';
import { Badge } from '../../ui/badge';

export const Step1PersonalData: React.FC = () => {
  const { t } = useTranslation();
  const { formData, setFormData, ageError, validateAge, idDocAnalysis } = useVerificationForm();

  // Pre-fill form with extracted data from document analysis
  useEffect(() => {
    if (idDocAnalysis?.extractedData) {
      const extracted = idDocAnalysis.extractedData;
      setFormData(prev => ({
        ...prev,
        // Only pre-fill if fields are empty
        date_of_birth: prev.date_of_birth || extracted.birthDate || '',
        nationality: prev.nationality || extracted.nationality || '',
      }));
      
      // Validate age if date was filled
      if (extracted.birthDate && !prev.date_of_birth) {
        validateAge(extracted.birthDate);
      }
    }
  }, [idDocAnalysis, setFormData, validateAge]);

  const handleDateChange = (dateOfBirth: string) => {
    setFormData(prev => ({ ...prev, date_of_birth: dateOfBirth }));
    validateAge(dateOfBirth);
  };

  const hasExtractedData = !!idDocAnalysis?.extractedData;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold">{t('verification.personal.title')}</h3>
        <p className="text-muted-foreground">
          {hasExtractedData 
            ? t('verification.personal.subtitleExtracted')
            : t('verification.personal.subtitle')}
        </p>
        {hasExtractedData && (
          <Badge className="mt-2 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('verification.personal.extractedAuto')}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('verification.personal.phone')}
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+57 300 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('verification.personal.location')}
          </Label>
          <Input
            id="location"
            placeholder={t('verification.personal.locationPlaceholder')}
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="date_of_birth" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t('verification.personal.dateOfBirth')}
            {hasExtractedData && idDocAnalysis?.extractedData?.birthDate && (
              <Badge variant="outline" className="ml-2 text-xs">
                {t('verification.personal.extracted', { value: idDocAnalysis.extractedData.birthDate })}
              </Badge>
            )}
          </Label>
          <Input
            id="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />
          {ageError && (
            <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              {ageError}
            </div>
          )}
        </div>

        <div>
          <Label className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            {t('verification.personal.nationality')}
            {hasExtractedData && idDocAnalysis?.extractedData?.nationality && (
              <Badge variant="outline" className="ml-2 text-xs">
                {t('verification.personal.extracted', { value: idDocAnalysis.extractedData.nationality })}
              </Badge>
            )}
          </Label>
          <select
            value={formData.nationality}
            onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">{t('verification.personal.selectNationality')}</option>
            <option value="Colombiano">{t('verification.nationalities.colombian')}</option>
            <option value="Venezolano">{t('verification.nationalities.venezuelan')}</option>
            <option value="Mexicano">{t('verification.nationalities.mexican')}</option>
            <option value="Argentino">{t('verification.nationalities.argentine')}</option>
            <option value="Chileno">{t('verification.nationalities.chilean')}</option>
            <option value="Peruano">{t('verification.nationalities.peruvian')}</option>
            <option value="Ecuatoriano">{t('verification.nationalities.ecuadorian')}</option>
            <option value="Boliviano">{t('verification.nationalities.bolivian')}</option>
            <option value="Paraguayo">{t('verification.nationalities.paraguayan')}</option>
            <option value="Uruguayo">{t('verification.nationalities.uruguayan')}</option>
            <option value="Brasileño">{t('verification.nationalities.brazilian')}</option>
            <option value="Español">{t('verification.nationalities.spanish')}</option>
            <option value="Estadounidense">{t('verification.nationalities.american')}</option>
            <option value="Otro">{t('verification.nationalities.other')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
