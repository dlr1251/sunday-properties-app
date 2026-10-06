import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { propertiesColumns, PropertyRow } from './config/propertiesTable';

export type PropertiesTableProps = {
  data: PropertyRow[];
  isLoading?: boolean;
  onView?: (row: PropertyRow) => void;
  onEdit?: (row: PropertyRow) => void;
};

const headerKeys: Record<string, string> = {
  title: 'admin.recordTitle',
  price: 'properties.price',
  status: 'properties.status',
  location: 'properties.location',
};

export function PropertiesTable(props: PropertiesTableProps) {
  const { t } = useTranslation();
  const { data, isLoading, onView, onEdit } = props;
  const columns = propertiesColumns.map((col) => ({
    ...col,
    header: t(headerKeys[col.id] ?? col.id),
    accessor: col.id === 'status'
      ? (r: PropertyRow) => t(`admin.status.${r.status}`, { defaultValue: r.status })
      : col.accessor,
  }));
  const actions: Array<RowAction<PropertyRow>> = [
    onView ? { id: 'view', label: t('common.view'), onClick: onView } : null,
    onEdit ? { id: 'edit', label: t('common.edit'), onClick: onEdit } : null,
  ].filter(Boolean) as Array<RowAction<PropertyRow>>;

  return (
    <EntityTable<PropertyRow>
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default PropertiesTable;
