import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { changeRoleSchema, ChangeRoleInput } from '../config/usersForms';

export type ChangeRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ChangeRoleInput) => Promise<void> | void;
};

export function ChangeRoleDialog(props: ChangeRoleDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, onSubmit } = props;
  const defaults: ChangeRoleInput = { role: 'user' } as any;

  const fields: AutoFormField[] = [
    {
      name: 'role',
      label: t('admin.newRole'),
      type: 'select',
      options: [
        { label: t('profile.roles.user'), value: 'user' },
        { label: t('profile.roles.agent'), value: 'agent' },
        { label: t('profile.roles.admin'), value: 'admin' },
        { label: t('profile.roles.super_admin'), value: 'super_admin' },
      ],
    },
  ];

  return (
    <FormModal<z.infer<typeof changeRoleSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title={t('admin.changeRole')}
      schema={changeRoleSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
    >
      {({ submitting }) => (
        <AutoForm schema={changeRoleSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
      )}
    </FormModal>
  );
}

export default ChangeRoleDialog;
