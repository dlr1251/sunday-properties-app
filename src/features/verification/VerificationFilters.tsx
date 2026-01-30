import React from 'react';
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
  const { values, onChange, onReset } = props;
  return (
    <FilterBar schema={verificationFilterSchema} values={values} onChange={onChange} onReset={onReset}>
      <Input
        placeholder="Search verifications"
        value={values.search ?? ''}
        onChange={(e) => onChange({ ...values, search: e.target.value })}
        className="w-[320px]"
      />

      <Select value={values.status} onValueChange={(v) => onChange({ ...values, status: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select value={values.document_type} onValueChange={(v) => onChange({ ...values, document_type: v as any })}>
        <SelectTrigger className="w-[160px]"><SelectValue placeholder="Document Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="id">ID</SelectItem>
          <SelectItem value="passport">Passport</SelectItem>
          <SelectItem value="driver_license">Driver License</SelectItem>
        </SelectContent>
      </Select>
    </FilterBar>
  );
}

export default VerificationFilters;

