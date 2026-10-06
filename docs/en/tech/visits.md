# API — Visits

Access to scheduled property visits via Supabase and `VisitsRepository`.

## Overview

| Field | Value |
|-------|--------|
| Type | `visits` table + repository |
| Location | `src/lib/db/repositories/visits.repo.ts` |
| Validation | `src/lib/validation/visits.schema.ts` |

## Table `visits`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifier |
| `property_id` | UUID | FK to `properties` |
| `visitor_id` | UUID | FK to `profiles` |
| `scheduled_date` | date | Visit date |
| `scheduled_time` | time | Time |
| `status` | enum | `pending`, `confirmed`, `completed`, `cancelled`, `no_show` |
| `visit_price` | int | Price (COP, e.g. 49,000) |
| `paid` | bool | Whether payment was made |
| `payment_method` | enum | `cash`, `card`, `crypto` (optional) |
| `nda_accepted` | bool | NDA acceptance |
| `feedback` | text | Visitor comments |
| `rating` | int | Rating (optional) |
| `notes` | text | Visitor notes |
| `seller_notes` | text | Seller notes |
| `documents_unlocked` | bool | Whether documents are unlocked after visit |
| `reschedule_count` | int | Times rescheduled |
| `created_at`, `updated_at` | timestamptz | Audit |

## VisitsRepository

### By user

```typescript
import { visitsRepository } from '@/lib/db/repositories/visits.repo';

// Visits the user has scheduled
const result = await visitsRepository.getVisitsByUser(userId, 'scheduled', {
  status: 'confirmed',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
});

// Incoming visits (to the user's properties)
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

The real flow usually includes availability check (`property_availability`, `blocked_dates`), payment (Stripe), and visit creation after payment.

### Update status and notes

- `updateVisitStatus`: `pending` → `confirmed`, `completed`, `cancelled`, etc.
- `rescheduleVisit`: New date/time and increment `reschedule_count`.
- `addVisitNotes` / `addSellerNotes`: Update notes.

## Related

- [Database schema](db-schema) — `visits`, `property_availability`, `blocked_dates`
- [Concepts](concepts) — Visits
- [API — Properties](api-properties)
