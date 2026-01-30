import React from 'react';
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
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={reportsFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder="Search reports"
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
          <SelectItem value="escalated">Escalated</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.type} onValueChange={(v) => onChange({ ...values, type: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="property">Property</SelectItem>
          <SelectItem value="message">Message</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.priority} onValueChange={(v) => onChange({ ...values, priority: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Priority" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default ReportsFilters;


