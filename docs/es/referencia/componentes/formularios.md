# Componentes — Formularios

Manejo de formularios, validación y componentes asociados.

## Resumen

Formularios con **React Hook Form** y validación con **Zod**. Esquemas en `src/lib/validation/` (p. ej. `offers.schema`, `visits.schema`, `users.schema`). Los componentes de UI (`Input`, `Select`, `Checkbox`, etc.) se integran vía `register` o `Controller`.

## Stack

| Herramienta | Uso |
|-------------|-----|
| React Hook Form | Estado, `register`, `handleSubmit`, `errors`, `control` |
| Zod | Esquemas y validación |
| @hookform/resolvers | Integración Zod → React Hook Form |
| Componentes UI | `Input`, `Label`, `Select`, `Checkbox`, `FormFieldHelper` |

## Esquemas de validación

Ejemplo simplificado:

```typescript
import { z } from 'zod';

export const createOfferSchema = z.object({
  offerPrice: z.number().min(1, 'Precio requerido'),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'crypto']),
  closingDate: z.string().datetime().optional(),
  conditions: z.array(z.string()).optional(),
});

export type CreateOfferInput = z.infer<typeof createOfferSchema>;
```

Se usan con `zodResolver(createOfferSchema)` en `useForm`.

## Uso básico

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

Para campos controlados (Select, Checkbox, etc.) se usa `Controller` con `control` y `name`.

## FormFieldHelper

Componente en `src/components/ui/FormFieldHelper.tsx` para mensajes de error o ayuda bajo los campos. Variantes típicas: `error`, `hint`.

## Patrones

- **Wizards**: Varios pasos con un formulario por paso o estado global; validación por paso antes de avanzar.
- **Envío asíncrono**: `form.handleSubmit` recibe una función async; mostrar carga y errores de servidor con `setError` o estado local.
- **Valores por defecto**: Desde API o contexto (`defaultValues`) y `reset` cuando cambien los datos.

## Temas relacionados

- [Sistema de diseño](sistema-de-diseno)
- [API — Ofertas](../api/ofertas) — Esquemas de ofertas
- [API — Visitas](../api/visitas) — Esquemas de visitas
