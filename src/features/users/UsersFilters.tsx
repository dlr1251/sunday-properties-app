import React from 'react';
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
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={usersFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder="Search name or email"
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />
      <Select value={values.role} onValueChange={(v) => onChange({ ...values, role: v as any })}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="super_admin">Super Admin</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="agent">Agent</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default UsersFilters;


