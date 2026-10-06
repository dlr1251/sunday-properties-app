import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NegotiationRules {
  minPrice?: number;
  maxClosingDays?: number;
  requiredPaymentMethods: string[];
  autoRejectEnabled: boolean;
  manualReviewThreshold: boolean;
  specialConditions: string[];
}

interface Step6NegotiationRulesProps {
  negotiationRules: NegotiationRules;
  onMinPriceChange: (value: string) => void;
  onMaxClosingDaysChange: (value: string) => void;
  onPaymentMethodToggle: (method: string) => void;
  onAutoRejectToggle: (checked: boolean) => void;
  onManualReviewToggle: (checked: boolean) => void;
}

export const Step6NegotiationRules: React.FC<Step6NegotiationRulesProps> = ({
  negotiationRules,
  onMinPriceChange,
  onMaxClosingDaysChange,
  onPaymentMethodToggle,
  onAutoRejectToggle,
  onManualReviewToggle,
}) => {
  const { t } = useTranslation();
  console.log('⚖️ Step6NegotiationRules rendering with rules:', negotiationRules);

  const handleNumericInputChange = useCallback((handler: (value: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔢 Negotiation rule changed:', e.target.value);
    handler(e.target.value);
  }, []);

  const handleCheckboxChange = useCallback((handler: (checked: boolean) => void) => (checked: boolean | "indeterminate") => {
    console.log('☑️ Negotiation checkbox changed:', checked);
    handler(!!checked);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('properties.wizard.negotiation.title')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('properties.wizard.negotiation.subtitle')}
        </p>

        <div className="space-y-6">
          {/* Precio Mínimo */}
          <div className="space-y-2">
            <Label htmlFor="minPrice">{t('properties.wizard.negotiation.minPrice')}</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder={t('common.example', { value: '500000000' })}
              value={negotiationRules.minPrice || ''}
              onChange={handleNumericInputChange(onMinPriceChange)}
            />
            <p className="text-sm text-muted-foreground">
              {t('properties.wizard.negotiation.minPriceHint')}
            </p>
          </div>

          {/* Plazo Máximo de Cierre */}
          <div className="space-y-2">
            <Label htmlFor="maxClosingDays">{t('properties.wizard.negotiation.maxClosingDays')}</Label>
            <Input
              id="maxClosingDays"
              type="number"
              placeholder={t('common.example', { value: '90' })}
              value={negotiationRules.maxClosingDays || ''}
              onChange={handleNumericInputChange(onMaxClosingDaysChange)}
            />
            <p className="text-sm text-muted-foreground">
              {t('properties.wizard.negotiation.maxClosingDaysHint')}
            </p>
          </div>

          {/* Métodos de Pago Requeridos */}
          <div className="space-y-3">
            <Label>{t('properties.wizard.negotiation.requiredMethods')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { id: 'cash', labelKey: 'cash' },
                { id: 'bank_transfer', labelKey: 'bank_transfer' },
                { id: 'crypto', labelKey: 'crypto' },
                { id: 'financing', labelKey: 'financing' },
                { id: 'leasing', labelKey: 'leasing' }
              ].map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`payment-${method.id}`}
                    checked={negotiationRules.requiredPaymentMethods.includes(method.id)}
                    onCheckedChange={() => onPaymentMethodToggle(method.id)}
                  />
                  <Label htmlFor={`payment-${method.id}`} className="text-sm">
                    {t(`properties.wizard.paymentMethods.${method.labelKey}`)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones Avanzadas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoReject"
                checked={negotiationRules.autoRejectEnabled}
                onCheckedChange={handleCheckboxChange(onAutoRejectToggle)}
              />
              <Label htmlFor="autoReject" className="text-sm">
                {t('properties.wizard.negotiation.autoReject')}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="manualReview"
                checked={negotiationRules.manualReviewThreshold}
                onCheckedChange={handleCheckboxChange(onManualReviewToggle)}
              />
              <Label htmlFor="manualReview" className="text-sm">
                {t('properties.wizard.negotiation.manualReview')}
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
