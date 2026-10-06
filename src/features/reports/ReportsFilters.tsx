import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from '../../components/data/FilterBar';
import { reportsFilterSchema, ReportsFilterValues } from './config/reportsFilters';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export type ReportsFiltersProps = {
  values: ReportsFilterValues;
  onChange: (v: ReportsFilterValues) => void;
  onReset?: () => void;
};

export function ReportsFilters(props: ReportsFiltersProps) {
  const { t } = useTranslation();
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={reportsFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder={t('admin.searchReports')}
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('properties.status')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="pending">{t('admin.reportStatus.pending')}</SelectItem>
          <SelectItem value="resolved">{t('admin.reportStatus.resolved')}</SelectItem>
          <SelectItem value="dismissed">{t('admin.reportStatus.dismissed')}</SelectItem>
          <SelectItem value="escalated">{t('admin.reportStatus.escalated')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.type} onValueChange={(v) => onChange({ ...values, type: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('admin.reportType')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="user">{t('admin.reportTypes.user')}</SelectItem>
          <SelectItem value="property">{t('admin.reportTypes.property')}</SelectItem>
          <SelectItem value="message">{t('admin.reportTypes.message')}</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.priority} onValueChange={(v) => onChange({ ...values, priority: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('admin.priority')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.all')}</SelectItem>
          <SelectItem value="low">{t('admin.priorityLevels.low')}</SelectItem>
          <SelectItem value="medium">{t('admin.priorityLevels.medium')}</SelectItem>
          <SelectItem value="high">{t('admin.priorityLevels.high')}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default ReportsFilters;
