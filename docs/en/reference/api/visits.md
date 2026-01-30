# API — Visits

Access to scheduled property visits via Supabase and `VisitsRepository`.

## Overview

| Field | Value |
|-------|--------|
| Type | `visits` table + repository |
| Location | `src/lib/db/repositories/visits.repo.ts` |
| Validation | `src/lib/validation/visits.schema.ts` |

## `visits` table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifier |
| `property_id` | UUID | FK to `properties` |
| `visitor_id` | UUID | FK to `profiles` |
| `scheduled_date` | date | Visit date |
| `scheduled_time` | time | Time |
| `status` | enum | `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| `visit_price` | int | Price (COP, e.g. 49,000) |
| `paid` | bool | Payment completed |
| `payment_method` | enum | `cash`, `card`, `crypto` (optional) |
| `nda_accepted` | bool | NDA acceptance |
| `feedback` | text | Visitor comments |
| `rating` | int | Rating (optional) |
| `notes` | text | Visitor notes |
| `seller_notes` | text | Seller notes |
| `documents_unlocked` | bool | Documents unlocked after visit |
| `reschedule_count` | int | Reschedule count |
| `created_at`, `updated_at` | timestamptz | Audit |

## VisitsRepository

### By user

```typescript
import { visitsRepository } from '@/lib/db/repositories/visits.repo';

const result = await visitsRepository.getVisitsByUser(userId, 'scheduled', {
  status: 'confirmed',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
});

const incoming = await visitsRepository.getVisitsByUser(userId, 'incoming');
```

### Create visit

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

The real flow typically checks availability (`property_availability`, `blocked_dates`), payment (Stripe), and creates the visit after payment.

### Update status and notes

- `updateVisitStatus`: e.g. `pending` → `confirmed`, `completed`, `cancelled`.
- `rescheduleVisit`: New date/time and increment `reschedule_count`.
- `addVisitNotes` / `addSellerNotes`: Update notes.

## Availability

Slots are defined in `property_availability` (day of week, start/end time) and exclude `blocked_dates`. Slot calculation lives in hooks or services (e.g. `useVisitAvailability`).

## Payments and NDA

- Visit payment is usually handled with Stripe (Edge Function `create-visit-payment-intent`, webhook).
- `nda_accepted` must be recorded before or during confirmation. Document unlock (`documents_unlocked`) may depend on `status = completed` and business rules.

## Related

- [Database — Schema](../database/schema) — `visits`, `property_availability`, `blocked_dates`
- [Process — Manage visits](../../processes/manage-visits)
- [Concepts](../../guide/concepts) — Visits
