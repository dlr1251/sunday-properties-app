import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface PropertyData {
  title: string;
  description: string;
  address: string;
  neighborhood: string;
  coordinates: { lat: number; lng: number };
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  floor: number;
  totalFloors: number;
  yearBuilt: number;
  images: File[];
  virtualTour: File | null;
  freedomTradition: File | null;
  propertyType: string;
  strata: number;
  price: number;
  offeredTimeline?: { deedSigningDate?: string; propertyDeliveryDate?: string; paymentReceptionDate?: string };
  acceptedPaymentMethods?: string[];
  negotiationRules: {
    minPrice?: number;
    maxClosingDays?: number;
    requiredPaymentMethods: string[];
    autoRejectEnabled: boolean;
    manualReviewThreshold: boolean;
    specialConditions: string[];
  };
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

interface Step7FinalReviewProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onTermsAcceptedChange: (checked: boolean) => void;
  onPrivacyAcceptedChange: (checked: boolean) => void;
}

export const Step7FinalReview: React.FC<Step7FinalReviewProps> = ({
  propertyData,
  formatPrice,
  onTermsAcceptedChange,
  onPrivacyAcceptedChange,
}) => {
  const { t } = useTranslation();
  console.log('✅ Step7FinalReview rendering with data:', propertyData);

  const handleCheckboxChange = useCallback((handler: (checked: boolean) => void) => (checked: boolean | "indeterminate") => {
    console.log('☑️ Review checkbox changed:', checked);
    handler(!!checked);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('properties.wizard.review.title')}</h3>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">{propertyData.title}</h4>
              <p className="text-muted-foreground">{propertyData.address}, {propertyData.neighborhood}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('properties.bedrooms')}:</span>
                <p className="font-semibold">{propertyData.bedrooms}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('properties.bathrooms')}:</span>
                <p className="font-semibold">{propertyData.bathrooms}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('properties.area')}:</span>
                <p className="font-semibold">{propertyData.area}m²</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('properties.price')}:</span>
                <p className="font-semibold">{formatPrice(propertyData.price)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{t('properties.wizard.review.imagesCount', { count: propertyData.images.length })}</Badge>
              {(propertyData.acceptedPaymentMethods ?? []).length > 0 && (
                (propertyData.acceptedPaymentMethods ?? []).map((m) => (
                  <Badge key={m} variant="outline">
                    {t(`properties.wizard.paymentMethods.${m}`, { defaultValue: m })}
                  </Badge>
                ))
              )}
            </div>
            {(propertyData.offeredTimeline && (propertyData.offeredTimeline.deedSigningDate || propertyData.offeredTimeline.paymentReceptionDate)) && (
              <div className="text-sm text-muted-foreground pt-2 space-y-1">
                {propertyData.offeredTimeline.deedSigningDate && <p>{t('properties.wizard.review.deedSigning', { date: propertyData.offeredTimeline.deedSigningDate })}</p>}
                {propertyData.offeredTimeline.propertyDeliveryDate && <p>{t('properties.wizard.review.propertyDelivery', { date: propertyData.offeredTimeline.propertyDeliveryDate })}</p>}
                {propertyData.offeredTimeline.paymentReceptionDate && <p>{t('properties.wizard.review.paymentReception', { date: propertyData.offeredTimeline.paymentReceptionDate })}</p>}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={propertyData.termsAccepted}
            onCheckedChange={handleCheckboxChange(onTermsAcceptedChange)}
          />
          <Label htmlFor="terms" className="text-sm">
            {t('properties.wizard.review.acceptTerms')}
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={propertyData.privacyAccepted}
            onCheckedChange={handleCheckboxChange(onPrivacyAcceptedChange)}
          />
          <Label htmlFor="privacy" className="text-sm">
            {t('properties.wizard.review.acceptPrivacy')}
          </Label>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-900">{t('properties.wizard.review.adminReviewTitle')}</h4>
            <p className="text-yellow-700 text-sm mt-1">
              {t('properties.wizard.review.adminReviewBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
