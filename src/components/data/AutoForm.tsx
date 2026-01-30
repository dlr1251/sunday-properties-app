import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export type AutoFormField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox';
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>; // for select
};

export type AutoFormProps<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => void | Promise<void>;
  fields: AutoFormField[];
  submitting?: boolean;
  submitLabel?: string;
  className?: string;
};

export function AutoForm<TSchema extends z.ZodTypeAny>(props: AutoFormProps<TSchema>) {
  const { schema, defaultValues, onSubmit, fields, submitting, submitLabel = 'Save', className } = props;
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((f) => {
          const type = f.type ?? 'text';
          return (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-sm font-medium">{f.label}</label>
              {type === 'select' ? (
                <select className="border rounded-md px-3 py-2 text-sm" {...register(f.name as any)}>
                  {(f.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : type === 'checkbox' ? (
                <input type="checkbox" className="h-4 w-4" {...register(f.name as any)} />
              ) : (
                <input
                  type={type}
                  placeholder={f.placeholder}
                  className="border rounded-md px-3 py-2 text-sm"
                  {...register(f.name as any)}
                />
              )}
              {errors && (errors as any)[f.name] ? (
                <div className="text-xs text-red-600">{(errors as any)[f.name]?.message as string}</div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-end">
        <button type="submit" disabled={submitting} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default AutoForm;


