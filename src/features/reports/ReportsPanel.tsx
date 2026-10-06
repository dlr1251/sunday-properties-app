import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportsFilters } from './ReportsFilters';
import { ReportsTable } from './ReportsTable';
import { ReportsStats } from './ReportsStats';
import { defaultReportsFilters, ReportsFilterValues } from './config/reportsFilters';
import { useReportsData } from './hooks/useReportsData';
import ReportDetailsDialog from './dialogs/ReportDetailsDialog';
import ResolutionDialog from './dialogs/ResolutionDialog';

export function ReportsPanel() {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<ReportsFilterValues>(defaultReportsFilters);
  const [page] = React.useState(1);
  const [limit] = React.useState(20);
  const { reports, isLoading, stats } = useReportsData({
    page,
    limit,
    search: filters.search,
    status: filters.status,
    type: filters.type,
    priority: filters.priority,
  });

  const [openDetails, setOpenDetails] = React.useState<{ open: boolean; report?: any } | null>(null);
  const [openResolve, setOpenResolve] = React.useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.reportsManagement')}</h2>
      </div>

      <ReportsStats stats={stats as any} />

      <ReportsFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultReportsFilters)} />

      <ReportsTable
        data={reports as any}
        isLoading={isLoading}
        onView={(row) => setOpenDetails({ open: true, report: row })}
        onResolve={(row) => setOpenResolve(true)}
      />

      <ReportDetailsDialog open={!!openDetails?.open} onOpenChange={(open) => setOpenDetails((s) => ({ open, report: s?.report }))} report={openDetails?.report} onResolve={() => setOpenResolve(true)} />
      <ResolutionDialog open={openResolve} onOpenChange={setOpenResolve} onSubmit={async () => setOpenResolve(false)} />
    </div>
  );
}

export default ReportsPanel;
