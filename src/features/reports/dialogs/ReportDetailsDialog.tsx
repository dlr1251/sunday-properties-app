import React from 'react';
import EntityDialog from '../../../components/data/EntityDialog';

export type ReportDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: any | null;
  onResolve?: (report: any) => void;
};

export function ReportDetailsDialog(props: ReportDetailsDialogProps) {
  const { open, onOpenChange, report, onResolve } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={report?.title ?? 'Report details'}>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div><span className="text-muted-foreground">Type:</span> {report?.type ?? '—'}</div>
        <div><span className="text-muted-foreground">Status:</span> {report?.status ?? '—'}</div>
        <div><span className="text-muted-foreground">Priority:</span> {report?.priority ?? '—'}</div>
        <div><span className="text-muted-foreground">Reporter:</span> {report?.reporter_email ?? '—'}</div>
        <div><span className="text-muted-foreground">Created:</span> {report?.created_at ?? '—'}</div>
        <div className="mt-2"><span className="text-muted-foreground">Description:</span><div>{report?.description ?? '—'}</div></div>
      </div>
      {onResolve ? (
        <div className="mt-4 flex justify-end">
          <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => report && onResolve(report)}>
            Resolve
          </button>
        </div>
      ) : null}
    </EntityDialog>
  );
}

export default ReportDetailsDialog;


