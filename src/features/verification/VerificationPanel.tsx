import React from 'react';
import { useTranslation } from 'react-i18next';
import { VerificationFilters } from './VerificationFilters';
import { VerificationTable } from './VerificationTable';
import { VerificationStats } from './VerificationStats';
import { defaultVerificationFilters, VerificationFilterValues } from './config/verificationFilters';
import { useVerificationData } from './hooks/useVerificationData';
import DocumentsViewer from './dialogs/DocumentsViewer';
import ApprovalDialog from './dialogs/ApprovalDialog';

export function VerificationPanel() {
  const { t } = useTranslation();
  const [filters, setFilters] = React.useState<VerificationFilterValues>(defaultVerificationFilters);
  const [page] = React.useState(1);
  const [limit] = React.useState(20);
  const { verifications, isLoading, stats } = useVerificationData({
    page,
    limit,
    search: filters.search,
    status: filters.status,
    document_type: filters.document_type,
  });

  const [openDocuments, setOpenDocuments] = React.useState<{ open: boolean; verification?: any } | null>(null);
  const [openApproval, setOpenApproval] = React.useState<{ open: boolean; verification?: any } | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('admin.verificationManagement')}</h2>
      </div>

      <VerificationStats stats={stats as any} />

      <VerificationFilters values={filters} onChange={setFilters} onReset={() => setFilters(defaultVerificationFilters)} />

      <VerificationTable
        data={verifications as any}
        isLoading={isLoading}
        onView={(row) => setOpenDocuments({ open: true, verification: row })}
        onApprove={(row) => setOpenApproval({ open: true, verification: row })}
      />

      <DocumentsViewer open={!!openDocuments?.open} onOpenChange={(open) => setOpenDocuments((s) => ({ open, verification: s?.verification }))} verification={openDocuments?.verification} onApprove={(v) => setOpenApproval({ open: true, verification: v })} />
      <ApprovalDialog open={!!openApproval?.open} onOpenChange={(open) => setOpenApproval((s) => ({ open, verification: s?.verification }))} verification={openApproval?.verification} onApprove={async () => setOpenApproval(null)} onReject={async () => setOpenApproval(null)} />
    </div>
  );
}

export default VerificationPanel;
