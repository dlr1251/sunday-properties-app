import React from 'react';
import { useTranslation } from 'react-i18next';
import EntityDialog from '../../../components/data/EntityDialog';

export type ReportDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: any | null;
  onResolve?: (report: any) => void;
};

export function ReportDetailsDialog(props: ReportDetailsDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, report, onResolve } = props;
  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={report?.title ?? t('admin.reportDetails')}>
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div><span className="text-muted-foreground">{t('admin.reportType')}:</span> {report?.type ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('properties.status')}:</span> {report?.status ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('admin.priority')}:</span> {report?.priority ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('admin.reporter')}:</span> {report?.reporter_email ?? '—'}</div>
        <div><span className="text-muted-foreground">{t('common.created')}:</span> {report?.created_at ?? '—'}</div>
        <div className="mt-2"><span className="text-muted-foreground">{t('admin.description')}:</span><div>{report?.description ?? '—'}</div></div>
      </div>
      {onResolve ? (
        <div className="mt-4 flex justify-end">
          <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => report && onResolve(report)}>
            {t('admin.resolve')}
          </button>
        </div>
      ) : null}
    </EntityDialog>
  );
}

export default ReportDetailsDialog;
