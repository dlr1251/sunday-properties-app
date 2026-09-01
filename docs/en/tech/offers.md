# API — Offers

Access to offers, counteroffers, and structured conditions via Supabase and related services.

## Overview

| Field | Value |
|-------|--------|
| Type | Tables `offers`, `counter_offers`, `offer_conditions` + repos and services |
| Repository | `src/lib/db/repositories/offers.repo.ts` |
| Conditions | `src/services/offerConditions.service.ts` |

## Tables

### `offers`

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifier |
| `property_id` | UUID | FK to `properties` |
| `buyer_id` | UUID | FK to `profiles` |
| `agent_id` | UUID | FK to `profiles` (optional) |
| `offer_price` | bigint | Offered price |
| `payment_method` | enum | `cash`, `bank_transfer`, `crypto` |
| `financing_details` | jsonb | Financing details |
| `conditions` | text[] | Conditions in text (legacy) |
| `closing_date` | date | Proposed closing date |
| `status` | enum | `pending`, `accepted`, `rejected`, `countered`, `expired`, `cancelled` |
| `calculated_npv`, `risk_adjusted_npv` | numeric | Calculated NPV |
| `created_at`, `updated_at` | timestamptz | Audit |

### `counter_offers`

Counteroffers linked to an offer. Include price, conditions, and status.

### `offer_conditions`

Structured conditions per offer: type, value, NPV impact, status (`proposed`, `accepted`, `rejected`, `countered`, `withdrawn`).

## OffersRepository

### By property

```typescript
import { offersRepository } from '@/lib/db/repositories/offers.repo';

const result = await offersRepository.getOffersByProperty(propertyId, {
  status: 'pending',
  buyerId: userId,
});
// Result<Offer[], AppError>
```

### By buyer

```typescript
const result = await offersRepository.getOffersByBuyer(userId, filters);
```

### Create offer

Uses the `CreateOfferInput` validation schema (Zod). The repository or business flow inserts into `offers` and, if applicable, creates `offer_conditions` via the conditions service.

### Counteroffers and status changes

Methods to create counteroffers, accept, reject, and update status. Logic may trigger notifications and update NPV.

## Related

- [Database schema](db-schema) — `offers`, `counter_offers`, `offer_conditions`
- [Concepts](concepts) — Offers and negotiation
