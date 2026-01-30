import React from 'react';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { createUserSchema, CreateUserInput } from '../config/usersForms';

export type CreateUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateUserInput) => Promise<void> | void;
};

const fields: AutoFormField[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'John Doe' },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'john@email.com' },
  {
    name: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { label: 'User', value: 'user' },
      { label: 'Agent', value: 'agent' },
      { label: 'Admin', value: 'admin' },
      { label: 'Super Admin', value: 'super_admin' },
    ],
  },
];

export function CreateUserDialog(props: CreateUserDialogProps) {
  const { open, onOpenChange, onSubmit } = props;
  const defaults: CreateUserInput = { name: '', email: '', role: 'user' };

  return (
    <FormModal<z.infer<typeof createUserSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title="Create user"
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


