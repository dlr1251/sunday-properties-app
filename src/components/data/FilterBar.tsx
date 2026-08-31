import React from 'react';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export type FilterBarProps<TSchema extends z.ZodTypeAny> = {
  schema: TSchema;
  values: z.infer<TSchema>;
  onChange: (values: z.infer<TSchema>) => void;
  onReset?: () => void;
  children?: React.ReactNode;
  className?: string;
};

export function FilterBar<TSchema extends z.ZodTypeAny>(props: FilterBarProps<TSchema>) {
  const { children, className, values, onChange, onReset, schema } = props;
  const { t } = useTranslation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const parsed = schema.parse(values);
      onChange(parsed);
    } catch {
      onChange(values);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap gap-3 items-center">{children}</div>
        <div className="flex gap-2">
          <button type="submit" className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">
            {t('common.apply')}
          </button>
          {onReset ? (
            <button type="button" onClick={onReset} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">
              {t('common.reset')}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

export default FilterBar;


