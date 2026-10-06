import React from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { EntityDialog } from './EntityDialog';

export type FormModalProps<TSchema extends z.ZodTypeAny> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
  children: (args: {
    values: z.infer<TSchema>;
    setValues: React.Dispatch<React.SetStateAction<z.infer<TSchema>>>;
    submitting: boolean;
  }) => React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
};

export function FormModal<TSchema extends z.ZodTypeAny>(props: FormModalProps<TSchema>) {
  const { t } = useTranslation();
  const { open, onOpenChange, title, schema, defaultValues, onSubmit, children, submitLabel = t('common.save'), cancelLabel = t('common.cancel') } = props;
  const [values, setValues] = React.useState<z.infer<TSchema>>(defaultValues);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setValues(defaultValues);
  }, [open, defaultValues]);

  async function handleSubmit() {
    try {
      const parsed = schema.parse(values);
      setSubmitting(true);
      await onSubmit(parsed);
      onOpenChange(false);
    } catch (e) {
      // validation errors will throw; do not close
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <EntityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <button type="button" onClick={() => onOpenChange(false)} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted" disabled={submitting}>
            {cancelLabel}
          </button>
          <button type="button" onClick={handleSubmit} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50" disabled={submitting}>
            {submitting ? t('common.saving') : submitLabel}
          </button>
        </div>
      }
    >
      {children({ values, setValues, submitting })}
    </EntityDialog>
  );
}

export default FormModal;


