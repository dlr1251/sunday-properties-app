import React from 'react';
import { VisitsFilters } from './VisitsFilters';
import { VisitsTable } from './VisitsTable';
import { VisitsStats } from './VisitsStats';
import { defaultVisitsFilters, VisitsFilterValues } from './config/visitsFilters';
import { useVisitsData } from './hooks/useVisitsData';
import EntityDialog from '../../components/data/EntityDialog';

export function VisitsPanel() {
  const [filters, setFilters] = React.useState<VisitsFilterValues>(defaultVisitsFilters);
  const [page] = React.useState(1);
  const [limit] = React.useState(20);
  const { visits, isLoading, stats } = useVisitsData({
    page,
    limit,
    search: filters.search,
    status: filters.status,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  const [openDetails, setOpenDetails] = React.useState<{ open: boolean; visit?: any } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Visits Management</h2>
      </div>

      <VisitsStats stats={stats as any} />

      <VisitsFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultVisitsFilters)} />

      <VisitsTable
        data={visits as any}
        isLoading={isLoading}
        onView={(row) => setOpenDetails({ open: true, visit: row })}
      />

      <EntityDialog open={!!openDetails?.open} onOpenChange={(open) => setOpenDetails((s) => ({ open, visit: s?.visit }))} title="Visit details">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div><span className="text-muted-foreground">Property:</span> {openDetails?.visit?.property_title ?? '—'}</div>
          <div><span className="text-muted-foreground">Buyer:</span> {openDetails?.visit?.buyer_email ?? '—'}</div>
          <div><span className="text-muted-foreground">Date:</span> {openDetails?.visit?.scheduled_date ?? '—'}</div>
          <div><span className="text-muted-foreground">Status:</span> {openDetails?.visit?.status ?? '—'}</div>
        </div>
      </EntityDialog>
    </div>
  );
}

export default VisitsPanel;

