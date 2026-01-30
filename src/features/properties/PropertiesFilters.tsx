import React from 'react';
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
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={propertiesFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input placeholder="Search properties" value={values.search ?? ''} onChange={(e) => onChange({ ...values, search: e.target.value })} className="w-[320px]" />
      <Input placeholder="City" value={values.city ?? ''} onChange={(e) => onChange({ ...values, city: e.target.value })} className="w-[200px]" />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default PropertiesFilters;


