import React from 'react';
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

const approveFields: AutoFormField[] = [
  { name: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Approval notes' },
];

const rejectFields: AutoFormField[] = [
  { name: 'reason', label: 'Reason', type: 'text', placeholder: 'Rejection reason' },
  { name: 'notes', label: 'Notes (optional)', type: 'text', placeholder: 'Additional notes' },
];

export function ApprovalDialog(props: ApprovalDialogProps) {
  const { open, onOpenChange, verification, onApprove, onReject } = props;
  const [mode, setMode] = React.useState<'approve' | 'reject' | 'view'>('view');
  
  if (mode === 'approve' && onApprove) {
    const defaults: ApproveVerificationInput = { notes: '' };
    return (
      <FormModal<z.infer<typeof approveVerificationSchema>>
        open={open}
        onOpenChange={(o) => { onOpenChange(o); if (!o) setMode('view'); }}
        title="Approve verification"
        schema={approveVerificationSchema}
        defaultValues={defaults}
        onSubmit={async (v) => { await onApprove(v); setMode('view'); }}
        submitLabel="Approve"
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
        title="Reject verification"
        schema={rejectVerificationSchema}
        defaultValues={defaults}
        onSubmit={async (v) => { await onReject(v); setMode('view'); }}
        submitLabel="Reject"
      >
        {({ submitting }) => (
          <AutoForm schema={rejectVerificationSchema} defaultValues={defaults} onSubmit={async (v) => { await onReject(v); setMode('view'); }} fields={rejectFields} submitting={submitting} />
        )}
      </FormModal>
    );
  }

  return (
    <EntityDialog open={open} onOpenChange={onOpenChange} title="Verify action">
      <div className="flex flex-col gap-3">
        <p className="text-sm">Choose an action for this verification request.</p>
        <div className="flex gap-2">
          {onApprove ? (
            <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setMode('approve')}>
              Approve
            </button>
          ) : null}
          {onReject ? (
            <button type="button" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" onClick={() => setMode('reject')}>
              Reject
            </button>
          ) : null}
        </div>
      </div>
    </EntityDialog>
  );
}

export default ApprovalDialog;

