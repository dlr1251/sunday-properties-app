import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityDialog from '../../../components/data/EntityDialog';

export type DocumentsViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verification?: any | null;
  onApprove?: (verification: any) => void;
};

export function DocumentsViewer(props: DocumentsViewerProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, verification, onApprove } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={t('admin.viewDocuments')} size="lg">
      <div className="grid grid-cols-1 gap-3 text-sm">
        {verification?.document_url ? (
          <div>
            <span className="text-muted-foreground">{t('admin.documentFallback')}:</span>
            <img src={verification.document_url} alt={t('admin.documentFallback')} className="mt-2 border rounded" />
          </div>
        ) : null}
        {verification?.selfie_url ? (
          <div>
            <span className="text-muted-foreground">{t('verification.dashboard.facePhoto')}:</span>
            <img src={verification.selfie_url} alt={t('verification.dashboard.facePhoto')} className="mt-2 border rounded" />
          </div>
        ) : null}
        <div><span className="text-muted-foreground">{t('properties.status')}:</span> {verification?.status ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('admin.documentType')}:</span> {verification?.document_type ?? '—'}</div>
      </div>
      {onApprove ? (
        <div className="mt-4 flex justify-end">
          <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => verification && onApprove(verification)}>
            {t('common.approve')}
          </button>
        </div>
      ) : null}
    </EntityDialog>
  );
}

export default DocumentsViewer;
