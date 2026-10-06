import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { createUserSchema, CreateUserInput } from '../config/usersForms';

export type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateUserInput) => Promise<void> | void;
};

export function CreateUserDialog(props: CreateUserDialogProps) {
  const { t } = useTranslation();
  const { open, onOpenChange, onSubmit } = props;
  const defaults: CreateUserInput = { name: '', email: '', role: 'user' };

  const fields: AutoFormField[] = [
    { name: 'name', label: t('admin.name'), type: 'text', placeholder: t('profile.placeholders.fullName') },
    { name: 'email', label: t('profile.email'), type: 'email', placeholder: 'name@email.com' },
    {
      name: 'role',
      label: t('profile.role'),
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
    <FormModal<z.infer<typeof createUserSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title={t('admin.createUser')}
      schema={createUserSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
    >
      {({ submitting }) => (
        <AutoForm schema={createUserSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
      )}
    </FormModal>
  );
}

export default CreateUserDialog;
