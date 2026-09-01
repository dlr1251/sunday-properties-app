import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityTable, { RowAction } from '../../components/data/EntityTable';
import { reportsColumns, ReportRow } from './config/reportsTable';

export type ReportsTableProps = {
  data: ReportRow[];
  isLoading?: boolean;
  onView?: (row: ReportRow) => void;
  onResolve?: (row: ReportRow) => void;
};

const headerKeys: Record<string, string> = {
  title: 'admin.recordTitle',
  type: 'admin.reportType',
  status: 'properties.status',
  priority: 'admin.priority',
  reporter: 'admin.reporter',
  created: 'common.created',
};

export function ReportsTable(props: ReportsTableProps) {
  const { t } = useTranslation();
  const { data, isLoading, onView, onResolve } = props;
  const columns = reportsColumns.map((col) => ({
    ...col,
    header: t(headerKeys[col.id] ?? col.id),
  }));
  const actions: Array<RowAction<ReportRow>> = [
    onView ? { id: 'view', label: t('common.view'), onClick: onView } : null,
    onResolve ? { id: 'resolve', label: t('admin.resolve'), onClick: onResolve } : null,
  ].filter(Boolean) as Array<RowAction<ReportRow>>;

  return (
    <EntityTable<ReportRow>
      columns={columns}
      data={data}
      isLoading={isLoading}
      rowKey={(row) => row.id}
      rowActions={actions}
    />
  );
}

export default ReportsTable;
