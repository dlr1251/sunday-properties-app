# Components — Forms

Form handling, validation, and related components.

## Overview

Forms use **React Hook Form** with **Zod** validation. Schemas live in `src/lib/validation/` (e.g. `offers.schema`, `visits.schema`, `users.schema`). UI components (`Input`, `Select`, `Checkbox`, etc.) integrate via `register` or `Controller`.

## Stack

| Tool | Use |
|------|-----|
| React Hook Form | State, `register`, `handleSubmit`, `errors`, `control` |
| Zod | Schemas and validation |
| @hookform/resolvers | Zod → React Hook Form integration |
| UI components | `Input`, `Label`, `Select`, `Checkbox`, `FormFieldHelper` |

## Validation schemas

Example:

```typescript
import { z } from 'zod';

export const createOfferSchema = z.object({
  offerPrice: z.number().min(1, 'Price required'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'crypto']),
  closingDate: z.string().datetime().optional(),
  conditions: z.array(z.string()).optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
```

Use with `zodResolver(createOfferSchema)` in `useForm`.

## Basic usage

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOfferSchema, type CreateOfferInput } from '@/lib/validation/offers.schema';

function OfferForm({ onSubmit }: { onSubmit: (data: CreateOfferInput) => void }) {
  const form = useForm<CreateOfferInput>({
    resolver: zodResolver(createOfferSchema),
    defaultValues: { paymentMethod: 'cash' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('offerPrice', { valueAsNumber: true })} />
      {form.formState.errors.offerPrice && (
        <FormFieldHelper variant="error">{form.formState.errors.offerPrice.message}</FormFieldHelper>
      )}
      {/* ... */}
    </form>
  );
}
```

For controlled fields (Select, Checkbox, etc.) use `Controller` with `control` and `name`.

## FormFieldHelper

`src/components/ui/FormFieldHelper.tsx` displays error or hint messages below fields. Typical variants: `error`, `hint`.

## Patterns

- **Wizards**: Multiple steps, one form per step or shared state; validate per step before advancing.
- **Async submit**: `form.handleSubmit` receives an async function; show loading and server errors via `setError` or local state.
- **Defaults**: From API or context (`defaultValues`); use `reset` when data changes.

## Related

- [Design system](design-system)
- [API — Offers](../api/offers)
- [API — Visits](../api/visits)
