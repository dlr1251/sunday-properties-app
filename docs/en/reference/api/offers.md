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
| `offer_price` | bigint | Offer price |
| `payment_method` | enum | `cash`, `bank_transfer`, `crypto` |
| `financing_details` | jsonb | Financing details |
| `conditions` | text[] | Legacy text conditions |
| `closing_date` | date | Proposed closing date |
| `status` | enum | `pending`, `accepted`, `rejected`, `countered`, `expired`, `cancelled` |
| `calculated_npv`, `risk_adjusted_npv` | numeric | Calculated NPV |
| `created_at`, `updated_at` | timestamptz | Audit |

### `counter_offers`

Counteroffers linked to an offer. Include price, conditions, and status.

### `offer_conditions`

Structured conditions per offer: type, value, NPV impact, status (`proposed`, `accepted`, `rejected`, `countered`, `withdrawn`). See [ADR-001](../../decisions/adr-001-structured-conditions).

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

Uses `CreateOfferInput` validation (Zod). The repository or business flow inserts into `offers` and, when applicable, creates `offer_conditions` via the conditions service.

### Counteroffers and status changes

Methods to create counteroffers, accept, reject, and update status. Logic may trigger notifications and update NPV.

## Offer Conditions Service

Service for structured conditions:

```typescript
import { offerConditionsService } from '@/services/offerConditions.service';

const result = await offerConditionsService.createCondition({
  offerId,
  conditionType: 'inspection_contingency',
  conditionKey: 'inspection_contingency',
  conditionValue: { days: 15, required: true },
  conditionDisplayText: 'Technical inspection in 15 days',
  proposedBy: 'buyer',
  proposerUserId: user.id,
  riskImpact: 15,
  priority: 80,
});

const conditions = await offerConditionsService.getConditionsByOffer(offerId);

await offerConditionsService.updateConditionStatus({
  conditionId,
  status: 'accepted',
  notes: 'Accepted by seller',
});
```

## NPV calculation

NPV calculation is implemented in services and/or SQL functions. Results are stored on `offers` (`calculated_npv`, `risk_adjusted_npv`, `npv_breakdown`). See [ADR-002](../../decisions/adr-002-npv-calculation) and [Database — Functions](../database/functions).

## Related

- [Database — Schema](../database/schema) — `offers`, `counter_offers`, `offer_conditions`
- [Process — Negotiation](../../processes/negotiation)
- [ADR-001 — Structured conditions](../../decisions/adr-001-structured-conditions)
- [ADR-002 — NPV calculation](../../decisions/adr-002-npv-calculation)
