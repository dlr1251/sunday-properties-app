import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { deleteUserSchema, DeleteUserInput } from '../config/usersForms';

export type DeleteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DeleteUserInput) => Promise<void> | void;
  email?: string;
};

export function DeleteUserDialog(props: DeleteUserDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, onSubmit, email } = props;
  const defaults: DeleteUserInput = { confirm: false } as any;

  const fields: AutoFormField[] = [
    { name: 'confirm', label: t('admin.confirmIrreversible'), type: 'checkbox' },
  ];

  return (
    <FormModal<z.infer<typeof deleteUserSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex flex-col">
          <span>{t('admin.deleteUserTitle')}</span>
          {email ? <span className="text-xs text-muted-foreground">{email}</span> : null}
        </div>
      }
      schema={deleteUserSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
      submitLabel={t('common.delete')}
    >
      {({ submitting }) => (
        <>
          <p className="text-sm text-muted-foreground mb-3">{t('admin.deleteUserPermanent')}</p>
          <AutoForm schema={deleteUserSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
        </>
      )}
    </FormModal>
  );
}

export default DeleteUserDialog;
