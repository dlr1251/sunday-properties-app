import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { PropertyData } from './types';

const PAYMENT_METHOD_IDS = [
  'efectivo',
  'transferencia',
  'international_transfer',
  'crypto',
  'permuta',
  'financiacion',
] as const;

interface Step5SellingConditionsProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onPriceChange: (value: string) => void;
  onOfferedTimelineChange: (field: 'deedSigningDate' | 'propertyDeliveryDate' | 'paymentReceptionDate', value: string) => void;
  onAcceptedPaymentMethodsChange: (methods: string[]) => void;
  onMinPriceChange: (value: string) => void;
  onMaxClosingDaysChange: (value: string) => void;
  onAutoRejectToggle: (checked: boolean) => void;
  onManualReviewToggle: (checked: boolean) => void;
}

export const Step5SellingConditions: React.FC<Step5SellingConditionsProps> = ({
  propertyData,
  formatPrice,
  onPriceChange,
  onOfferedTimelineChange,
  onAcceptedPaymentMethodsChange,
  onMinPriceChange,
  onMaxClosingDaysChange,
  onAutoRejectToggle,
  onManualReviewToggle,
}) => {
  const { t } = useTranslation();
  const timeline = propertyData.offeredTimeline ?? {};
  const methods = propertyData.acceptedPaymentMethods ?? [];
  const rules = propertyData.negotiationRules ?? { requiredPaymentMethods: [], autoRejectEnabled: false, manualReviewThreshold: false, specialConditions: [] };

  const handlePaymentMethodToggle = (id: string) => {
    const next = methods.includes(id)
      ? methods.filter((m) => m !== id)
      : [...methods, id];
    onAcceptedPaymentMethodsChange(next);
  };

  const handleCheckbox = (fn: (v: boolean) => void) => (checked: boolean | 'indeterminate') => fn(!!checked);

  return (
    <div className="space-y-8">
      {/* Precio de venta */}
      <div>
        <Label htmlFor="price">{t('properties.wizard.selling.salePrice')}</Label>
        <Input
          id="price"
          type="number"
          min="0"
          value={propertyData.price || ''}
          onChange={(e) => onPriceChange(e.target.value)}
        />
        {propertyData.price > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{formatPrice(propertyData.price)}</p>
        )}
      </div>

      {/* Cronograma ofrecido */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">{t('properties.wizard.selling.offeredTimeline')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="deedSigning" className="text-sm">{t('properties.wizard.selling.deedSigning')}</Label>
            <Input
              id="deedSigning"
              type="date"
              value={timeline.deedSigningDate ?? ''}
              onChange={(e) => onOfferedTimelineChange('deedSigningDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="propertyDelivery" className="text-sm">{t('properties.wizard.selling.propertyDelivery')}</Label>
            <Input
              id="propertyDelivery"
              type="date"
              value={timeline.propertyDeliveryDate ?? ''}
              onChange={(e) => onOfferedTimelineChange('propertyDeliveryDate', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{t('properties.wizard.selling.sameDateHint')}</p>
          </div>
          <div>
            <Label htmlFor="paymentReception" className="text-sm">{t('properties.wizard.selling.paymentReception')}</Label>
            <Input
              id="paymentReception"
              type="date"
              value={timeline.paymentReceptionDate ?? ''}
              onChange={(e) => onOfferedTimelineChange('paymentReceptionDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Métodos de pago aceptados */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">{t('properties.wizard.selling.acceptedMethods')}</Label>
        <div className="flex flex-wrap gap-4">
          {PAYMENT_METHOD_IDS.map((id) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox
                id={id}
                checked={methods.includes(id)}
                onCheckedChange={() => handlePaymentMethodToggle(id)}
              />
              <Label htmlFor={id} className="font-normal cursor-pointer">{t(`properties.wizard.paymentMethods.${id}`)}</Label>
            </div>
          ))}
        </div>
      </div>

      {/* Reglas de negociación */}
      <div className="space-y-4 pt-4 border-t">
        <Label className="text-base font-semibold">{t('properties.wizard.selling.negotiationRules')}</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minPrice" className="text-sm">{t('properties.wizard.selling.minPrice')}</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder={t('common.example', { value: '500000000' })}
              value={rules.minPrice ?? ''}
              onChange={(e) => onMinPriceChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="maxClosingDays" className="text-sm">{t('properties.wizard.selling.maxClosingDays')}</Label>
            <Input
              id="maxClosingDays"
              type="number"
              placeholder={t('common.example', { value: '90' })}
              value={rules.maxClosingDays ?? ''}
              onChange={(e) => onMaxClosingDaysChange(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoReject"
              checked={rules.autoRejectEnabled ?? false}
              onCheckedChange={handleCheckbox(onAutoRejectToggle)}
            />
            <Label htmlFor="autoReject" className="text-sm font-normal">{t('properties.wizard.selling.autoReject')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manualReview"
              checked={rules.manualReviewThreshold ?? false}
              onCheckedChange={handleCheckbox(onManualReviewToggle)}
            />
            <Label htmlFor="manualReview" className="text-sm font-normal">{t('properties.wizard.selling.manualReview')}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};
