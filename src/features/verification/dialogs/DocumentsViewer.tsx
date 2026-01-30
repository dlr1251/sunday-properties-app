import React from 'react';
import EntityDialog from '../../../components/data/EntityDialog';

export type DocumentsViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verification?: any | null;
  onApprove?: (verification: any) => void;
};

export function DocumentsViewer(props: DocumentsViewerProps) {
  const { open, onOpenChange, verification, onApprove } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title="View documents" size="lg">
      <div className="grid grid-cols-1 gap-3 text-sm">
        {verification?.document_url ? (
          <div>
            <span className="text-muted-foreground">Document:</span>
            <img src={verification.document_url} alt="Document" className="mt-2 border rounded" />
          </div>
        ) : null}
        {verification?.selfie_url ? (
          <div>
            <span className="text-muted-foreground">Selfie:</span>
            <img src={verification.selfie_url} alt="Selfie" className="mt-2 border rounded" />
          </div>
        ) : null}
        <div><span className="text-muted-foreground">Status:</span> {verification?.status ?? '—'}</div>
        <div><span className="text-muted-foreground">Type:</span> {verification?.document_type ?? '—'}</div>
      </div>
      {onApprove ? (
        <div className="mt-4 flex justify-end">
          <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => verification && onApprove(verification)}>
            Approve
          </button>
        </div>
      ) : null}
    </EntityDialog>
  );
}

export default DocumentsViewer;

