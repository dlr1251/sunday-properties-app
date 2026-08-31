import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from '../../components/data/FilterBar';
import { propertiesFilterSchema, PropertiesFilterValues } from './config/propertiesFilters';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export type PropertiesFiltersProps = {
  values: PropertiesFilterValues;
  onChange: (v: PropertiesFilterValues) => void;
  onReset?: () => void;
};

export function PropertiesFilters(props: PropertiesFiltersProps) {
  const { t } = useTranslation();
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={propertiesFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input placeholder={t('admin.searchProperties')} value={values.search ?? ''} onChange={(e) => onChange({ ...values, search: e.target.value })} className="w-[320px]" />
      <Input placeholder={t('admin.city')} value={values.city ?? ''} onChange={(e) => onChange({ ...values, city: e.target.value })} className="w-[200px]" />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('properties.status')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="published">{t('admin.status.published')}</SelectItem>
          <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
          <SelectItem value="draft">{t('admin.status.draft')}</SelectItem>
          <SelectItem value="archived">{t('admin.status.archived')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.listingType ?? 'all'} onValueChange={(v) => onChange({ ...values, listingType: v as any })}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder={t('properties.type')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="sale">{t('properties.listingTypes.sale')}</SelectItem>
          <SelectItem value="rental">{t('properties.listingTypes.rental')}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default PropertiesFilters;
