import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from '../../components/data/FilterBar';
import { verificationFilterSchema, VerificationFilterValues } from './config/verificationFilters';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export type VerificationFiltersProps = {
  values: VerificationFilterValues;
  onChange: (v: VerificationFilterValues) => void;
  onReset?: () => void;
};

export function VerificationFilters(props: VerificationFiltersProps) {
  const { t } = useTranslation();
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={verificationFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder={t('admin.searchVerifications')}
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('properties.status')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
          <SelectItem value="approved">{t('admin.status.approved')}</SelectItem>
          <SelectItem value="rejected">{t('admin.status.rejected')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.document_type} onValueChange={(v) => onChange({ ...values, document_type: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('admin.documentTypeFilter')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="id">{t('admin.docTypes.id')}</SelectItem>
          <SelectItem value="passport">{t('admin.docTypes.passport')}</SelectItem>
          <SelectItem value="driver_license">{t('admin.docTypes.driver_license')}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default VerificationFilters;
