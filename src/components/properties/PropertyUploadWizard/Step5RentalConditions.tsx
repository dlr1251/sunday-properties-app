import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import type { PropertyData } from './types';

const UTILITY_IDS = ['agua', 'luz', 'gas', 'internet', 'administracion'] as const;

interface Step5RentalConditionsProps {
  propertyData: PropertyData;
  formatPrice: (price: number) => string;
  onRentMonthlyChange: (value: string) => void;
  onLeaseTermMonthsChange: (value: string) => void;
  onDepositChange: (value: string) => void;
  onAdminFeeChange: (value: string) => void;
  onUtilitiesIncludedChange: (utilities: string[]) => void;
  onPetsPolicyChange: (value: string) => void;
}

export const Step5RentalConditions: React.FC<Step5RentalConditionsProps> = ({
  propertyData,
  formatPrice,
  onRentMonthlyChange,
  onLeaseTermMonthsChange,
  onDepositChange,
  onAdminFeeChange,
  onUtilitiesIncludedChange,
  onPetsPolicyChange,
}) => {
  const { t } = useTranslation();
  const utilities = propertyData.utilitiesIncluded ?? [];

  const toggleUtility = (id: string) => {
    const next = utilities.includes(id) ? utilities.filter((u) => u !== id) : [...utilities, id];
    onUtilitiesIncludedChange(next);
  };

  const toNumString = (n: number) => (Number.isFinite(n) && n > 0 ? String(n) : '');

  return (
    <div className="space-y-8">
      <div>
        <Label htmlFor="rentMonthly">{t('properties.wizard.rental.monthlyRent')}</Label>
        <Input
          id="rentMonthly"
          type="number"
          min="0"
          value={toNumString(propertyData.rentMonthly)}
          onChange={(e) => onRentMonthlyChange(e.target.value)}
        />
        {propertyData.rentMonthly > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{t('properties.wizard.rental.perMonth', { amount: formatPrice(propertyData.rentMonthly) })}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="leaseTermMonths">{t('properties.wizard.rental.leaseTerm')}</Label>
          <Input
            id="leaseTermMonths"
            type="number"
            min="1"
            placeholder={t('common.example', { value: '12' })}
            value={toNumString(propertyData.leaseTermMonths)}
            onChange={(e) => onLeaseTermMonthsChange(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="deposit">{t('properties.wizard.rental.deposit')}</Label>
          <Input
            id="deposit"
            type="number"
            min="0"
            placeholder={t('common.optional')}
            value={propertyData.deposit > 0 ? String(propertyData.deposit) : ''}
            onChange={(e) => onDepositChange(e.target.value)}
          />
          {propertyData.deposit > 0 && (
            <p className="text-sm text-muted-foreground mt-1">{formatPrice(propertyData.deposit)}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="adminFee">{t('properties.wizard.rental.adminFee')}</Label>
        <Input
          id="adminFee"
          type="number"
          min="0"
            placeholder={t('common.optional')}
          value={propertyData.adminFee > 0 ? String(propertyData.adminFee) : ''}
          onChange={(e) => onAdminFeeChange(e.target.value)}
        />
        {propertyData.adminFee > 0 && (
          <p className="text-sm text-muted-foreground mt-1">{formatPrice(propertyData.adminFee)}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">{t('properties.wizard.rental.utilitiesIncluded')}</Label>
        <div className="flex flex-wrap gap-4">
          {UTILITY_IDS.map((id) => (
            <div key={id} className="flex items-center space-x-2">
              <Checkbox id={`utility-${id}`} checked={utilities.includes(id)} onCheckedChange={() => toggleUtility(id)} />
              <Label htmlFor={`utility-${id}`} className="font-normal cursor-pointer">
                {t(`properties.wizard.utilities.${id}`)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="petsPolicy">{t('properties.wizard.rental.petsPolicy')}</Label>
        <Textarea
          id="petsPolicy"
          placeholder={t('properties.wizard.rental.petsPlaceholder')}
          rows={3}
          value={propertyData.petsPolicy ?? ''}
          onChange={(e) => onPetsPolicyChange(e.target.value)}
        />
      </div>
    </div>
  );
};

