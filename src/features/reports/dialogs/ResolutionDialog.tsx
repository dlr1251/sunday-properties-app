import React from 'react';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { resolveReportSchema, ResolveReportInput } from '../config/reportsForms';

export type ResolutionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ResolveReportInput) => Promise<void> | void;
};

const fields: AutoFormField[] = [
  { name: 'action', label: 'Action', type: 'select', options: [
    { label: 'Resolve', value: 'resolve' },
    { label: 'Dismiss', value: 'dismiss' },
    { label: 'Escalate', value: 'escalate' },
  ]},
  { name: 'notes', label: 'Notes', type: 'text', placeholder: 'Optional notes' },
];

export function ResolutionDialog(props: ResolutionDialogProps) {
  const { open, onOpenChange, onSubmit } = props;
  const defaults: ResolveReportInput = { action: 'resolve', notes: '' } as any;
  return (
    <FormModal<z.infer<typeof resolveReportSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title="Resolve report"
      schema={resolveReportSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
      submitLabel="Confirm"
    >
      {({ submitting }) => (
        <AutoForm schema={resolveReportSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
      )}
    </FormModal>
  );
}

export default ResolutionDialog;


