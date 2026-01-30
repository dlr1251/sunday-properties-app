import React from 'react';
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

const fields: AutoFormField[] = [
  { name: 'confirm', label: 'I understand this action is irreversible', type: 'checkbox' },
];

export function DeleteUserDialog(props: DeleteUserDialogProps) {
  const { open, onOpenChange, onSubmit, email } = props;
  const defaults: DeleteUserInput = { confirm: false } as any;

  return (
    <FormModal<z.infer<typeof deleteUserSchema>>
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex flex-col">
          <span>Delete user</span>
          {email ? <span className="text-xs text-muted-foreground">{email}</span> : null}
        </div>
      }
      schema={deleteUserSchema}
      defaultValues={defaults}
      onSubmit={onSubmit}
      submitLabel="Delete"
    >
      {({ submitting }) => (
        <>
          <p className="text-sm text-muted-foreground mb-3">This will permanently remove the user and related data.</p>
          <AutoForm schema={deleteUserSchema} defaultValues={defaults} onSubmit={onSubmit} fields={fields} submitting={submitting} />
        </>
      )}
    </FormModal>
  );
}

export default DeleteUserDialog;


