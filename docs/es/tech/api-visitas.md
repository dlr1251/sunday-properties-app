# API — Visitas

Acceso a visitas agendadas a propiedades mediante Supabase y `VisitsRepository`.

## Resumen

| Campo | Valor |
|-------|--------|
| Tipo | Tabla `visits` + repositorio |
| Ubicación | `src/lib/db/repositories/visits.repo.ts` |
| Validación | `src/lib/validation/visits.schema.ts` |

## Tabla `visits`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador |
| `property_id` | UUID | FK a `properties` |
| `visitor_id` | UUID | FK a `profiles` |
| `scheduled_date` | date | Fecha de la visita |
| `scheduled_time` | time | Hora |
| `status` | enum | `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| `visit_price` | int | Precio (COP, p. ej. 49.000) |
| `paid` | bool | Si el pago fue realizado |
| `payment_method` | enum | `cash`, `card`, `crypto` (opcional) |
| `nda_accepted` | bool | Aceptación de NDA |
| `feedback` | text | Comentarios del visitante |
| `rating` | int | Valoración (opcional) |
| `notes` | text | Notas del visitante |
| `seller_notes` | text | Notas del vendedor |
| `documents_unlocked` | bool | Si se desbloquean documentos tras la visita |
| `reschedule_count` | int | Veces reagendada |
| `created_at`, `updated_at` | timestamptz | Auditoría |

## VisitsRepository

### Por usuario

```typescript
import { visitsRepository } from '@/lib/db/repositories/visits.repo';

// Visitas que el usuario ha agendado
const result = await visitsRepository.getVisitsByUser(userId, 'scheduled', {
  status: 'confirmed',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
});

// Visitas recibidas (a propiedades del usuario)
const incoming = await visitsRepository.getVisitsByUser(userId, 'incoming');
```

### Crear visita

```typescript
const result = await visitsRepository.createVisit({
  propertyId,
  visitorId: user.id,
  scheduledDate: '2025-02-15',
  scheduledTime: '10:00',
  visitPrice: 49_000,
  paid: true,
  ndaAccepted: true,
});
```

El flujo real suele incluir comprobación de disponibilidad (`property_availability`, `blocked_dates`), pago (Stripe) y creación de la visita tras el pago.

### Actualizar estado y notas

- `updateVisitStatus`: `pending` → `confirmed`, `completed`, `cancelled`, etc.
- `rescheduleVisit`: Nueva fecha/hora y aumento de `reschedule_count`.
- `addVisitNotes` / `addSellerNotes`: Actualización de notas.

### Otras operaciones

- Obtener visita por `id`.
- Filtrar por `propertyId`, `status`, rango de fechas.

## Disponibilidad

Las franjas disponibles se definen en `property_availability` (día de la semana, hora inicio/fin) y se excluyen las fechas en `blocked_dates`. El cálculo de slots disponibles se hace en hooks o servicios específicos (p. ej. `useVisitAvailability`).

## Pagos y NDA

- El pago de la visita suele gestionarse con Stripe (Edge Function `create-visit-payment-intent`, webhook).
- `nda_accepted` debe registrarse antes o durante la confirmación. El desbloqueo de documentos (`documents_unlocked`) puede depender de `status = completed` y de las reglas de negocio.

## Temas relacionados

- [Esquema de base de datos](db-schema) — `visits`, `property_availability`, `blocked_dates`
- [Conceptos](concepts) — Visitas
- [API — Propiedades](api-properties)
