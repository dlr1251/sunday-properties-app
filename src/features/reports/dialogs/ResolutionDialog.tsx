import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { resolveReportSchema, ResolveReportInput } from '../config/reportsForms';

export type ResolutionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ResolveReportInput) => Promise<void> | void;
};

export function ResolutionDialog(props: ResolutionDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, onSubmit } = props;
  const defaults: ResolveReportInput = { action: 'resolve', notes: '' } as any;
  const fields: AutoFormField[] = [
    { name: 'action', label: t('admin.action'), type: 'select', options: [
      { label: t('admin.resolveActions.resolve'), value: 'resolve' },
      { label: t('admin.resolveActions.dismiss'), value: 'dismiss' },
      { label: t('admin.resolveActions.escalate'), value: 'escalate' },
    ]},
    { name: 'notes', label: t('admin.notes'), type: 'text', placeholder: t('admin.optionalNotes') },
  ];
  return (
    <FormModal<z.infer<typeof resolveReportSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title={t('admin.resolveReport')}
      schema={resolveReportSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
      submitLabel={t('common.confirm')}
    >
      {({ submitting }) => (
        <AutoForm schema={resolveReportSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
      )}
    </FormModal>
  );
}

export default ResolutionDialog;
