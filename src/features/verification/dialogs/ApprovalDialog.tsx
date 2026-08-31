import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import EntityDialog from '../../../components/data/EntityDialog';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { approveVerificationSchema, rejectVerificationSchema, ApproveVerificationInput, RejectVerificationInput } from '../config/verificationForms';

export type ApprovalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  verification?: any | null;
  onApprove?: (values: ApproveVerificationInput) => Promise<void> | void;
  onReject?: (values: RejectVerificationInput) => Promise<void> | void;
};

export function ApprovalDialog(props: ApprovalDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, verification, onApprove, onReject } = props;
  const [mode, setMode] = React.useState<'approve' | 'reject' | 'view'>('view');

  const approveFields: AutoFormField[] = [
    { name: 'notes', label: t('admin.notesOptional'), type: 'text', placeholder: t('admin.approvalNotes') },
  ];

  const rejectFields: AutoFormField[] = [
    { name: 'reason', label: t('admin.rejectionReason'), type: 'text', placeholder: t('admin.rejectionReason') },
    { name: 'notes', label: t('admin.notesOptional'), type: 'text', placeholder: t('admin.additionalNotes') },
  ];
  
  if (mode === 'approve' && onApprove) {
    const defaults: ApproveVerificationInput = { notes: '' };
    return (
      <FormModal<z.infer<typeof approveVerificationSchema>>
        open={open}
        onOpenChange={(o) => { onOpenChange(o); if (!o) setMode('view'); }}
        title={t('admin.approveVerification')}
        schema={approveVerificationSchema}
        defaultValues={defaults}
        onSubmit={async (v) => { await onApprove(v); setMode('view'); }}
        submitLabel={t('common.approve')}
      >
        {({ submitting }) => (
          <AutoForm schema={approveVerificationSchema} defaultValues={defaults} onSubmit={async (v) => { await onApprove(v); setMode('view'); }} fields={approveFields} submitting={submitting} />
        )}
      </FormModal>
    );
  }

  if (mode === 'reject' && onReject) {
    const defaults: RejectVerificationInput = { reason: '', notes: '' };
    return (
      <FormModal<z.infer<typeof rejectVerificationSchema>>
        open={open}
        onOpenChange={(o) => { onOpenChange(o); if (!o) setMode('view'); }}
        title={t('admin.rejectVerification')}
        schema={rejectVerificationSchema}
        defaultValues={defaults}
        onSubmit={async (v) => { await onReject(v); setMode('view'); }}
        submitLabel={t('common.reject')}
      >
        {({ submitting }) => (
          <AutoForm schema={rejectVerificationSchema} defaultValues={defaults} onSubmit={async (v) => { await onReject(v); setMode('view'); }} fields={rejectFields} submitting={submitting} />
        )}
      </FormModal>
    );
  }

  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title={t('admin.verifyAction')}>
      <div className="flex flex-col gap-3">
        <p className="text-sm">{t('admin.chooseVerificationAction')}</p>
        <div className="flex gap-2">
          {onApprove ? (
            <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setMode('approve')}>
              {t('common.approve')}
            </button>
          ) : null}
          {onReject ? (
            <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setMode('reject')}>
              {t('common.reject')}
            </button>
          ) : null}
        </div>
      </div>
    </EntityDialog>
  );
}

export default ApprovalDialog;
