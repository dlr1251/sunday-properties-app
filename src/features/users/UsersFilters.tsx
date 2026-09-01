import React from 'react';
import { useTranslation } from 'react-i18next';
import FilterBar from '../../components/data/FilterBar';
import { usersFilterSchema, UsersFilterValues } from './config/usersFilters';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export type UsersFiltersProps = {
  values: UsersFilterValues;
  onChange: (v: UsersFilterValues) => void;
  onReset?: () => void;
};

export function UsersFilters(props: UsersFiltersProps) {
  const { t } = useTranslation();
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={usersFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder={t('admin.searchNameOrEmail')}
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />
      <Select value={values.role} onValueChange={(v) => onChange({ ...values, role: v as any })}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('profile.role')} /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('common.allRoles')}</SelectItem>
          <SelectItem value="super_admin">{t('profile.roles.super_admin')}</SelectItem>
          <SelectItem value="admin">{t('profile.roles.admin')}</SelectItem>
          <SelectItem value="agent">{t('profile.roles.agent')}</SelectItem>
          <SelectItem value="user">{t('profile.roles.user')}</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default UsersFilters;
