import React from 'react';
import FilterBar from '../../components/data/FilterBar';
import { visitsFilterSchema, VisitsFilterValues } from './config/visitsFilters';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export type VisitsFiltersProps = {
  values: VisitsFilterValues;
  onChange: (v: VisitsFilterValues) => void;
  onReset?: () => void;
};

export function VisitsFilters(props: VisitsFiltersProps) {
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={visitsFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder="Search visits"
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default VisitsFilters;

