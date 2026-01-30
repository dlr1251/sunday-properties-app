import React from 'react';
import { z } from 'zod';
import FormModal from '../../../components/data/FormModal';
import AutoForm, { AutoFormField } from '../../../components/data/AutoForm';
import { changeRoleSchema, ChangeRoleInput } from '../config/usersForms';

export type ChangeRoleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ChangeRoleInput) => Promise<void> | void;
};

const fields: AutoFormField[] = [
  {
    name: 'role',
    label: 'New role',
    type: 'select',
    options: [
      { label: 'User', value: 'user' },
      { label: 'Agent', value: 'agent' },
      { label: 'Admin', value: 'admin' },
      { label: 'Super Admin', value: 'super_admin' },
    ],
  },
];

export function ChangeRoleDialog(props: ChangeRoleDialogProps) {
  const { open, onOpenChange, onSubmit } = props;
  const defaults: ChangeRoleInput = { role: 'user' } as any;

  return (
    <FormModal<z.infer<typeof changeRoleSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title="Change role"
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


