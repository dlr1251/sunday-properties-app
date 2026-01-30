import React from 'react';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { propertiesColumns, PropertyRow } from './config/propertiesTable';

export type PropertiesTableProps = {
  data: PropertyRow[];
  isLoading?: boolean;
  onView?: (row: PropertyRow) => void;
  onEdit?: (row: PropertyRow) => void;
};

export function PropertiesTable(props: PropertiesTableProps) {
  const { data, isLoading, onView, onEdit } = props;
  const actions: Array<RowAction<PropertyRow>> = [
    onView ? { id: 'view', label: 'View', onClick: onView } : null,
    onEdit ? { id: 'edit', label: 'Edit', onClick: onEdit } : null,
  ].filter(Boolean) as Array<RowAction<PropertyRow>>;

  return (
    <EntityTable<PropertyRow>
      columns={propertiesColumns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default PropertiesTable;


