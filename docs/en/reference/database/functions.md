# Database — Functions

Relevant SQL functions and triggers for the application.

## Overview

Functions live in migrations such as `20240101000002_03_functions_triggers.sql`, `20241102000002_create_npv_calculation.sql`, and others. Used for validation, notifications, audit, and calculations (e.g. NPV).

## NPV calculation

### `calculate_offer_npv`

Computes the net present value of an offer.

```sql
FUNCTION calculate_offer_npv(
  p_offer_id UUID,
  p_base_discount_rate DECIMAL DEFAULT 0.10
)
RETURNS TABLE (
  npv DECIMAL,
  adjusted_value DECIMAL,
  risk_adjusted_npv DECIMAL,
  breakdown JSONB
)
```

**Usage:**

```sql
SELECT * FROM calculate_offer_npv('offer-uuid', 0.12);
```

`breakdown` includes adjustments for payment method, time, risk, and conditions.

### `calculate_discount_factor`

Discount factor for time value:

```sql
FUNCTION calculate_discount_factor(days INTEGER, annual_rate DECIMAL DEFAULT 0.10)
RETURNS DECIMAL
```

Formula: `(1 + rate)^(-days/365)`.

### Trigger `trigger_calculate_offer_npv`

Runs after `INSERT` or `UPDATE` on `offers` when `offer_price`, `payment_method`, `closing_date`, or `financing_details` change. Updates `calculated_npv`, `risk_adjusted_npv`, and `npv_breakdown` when the NPV feature flag is enabled.

## Other functions and triggers

- **Offer validation**: Business rules (min price, deadlines, payment methods) applied in DB or from services.
- **Notifications**: Triggers that insert into `notifications` on events (new offer, counteroffer, status change).
- **Audit**: Triggers that write to `audit_logs` for relevant changes.
- **Offer conditions**: Logic for `offer_conditions` (interdependencies, states). See migrations and [ADR-001](../../decisions/adr-001-structured-conditions).

Exact names and parameters are in `supabase/migrations/`.

## Feature flags

Some functions (e.g. NPV) check `platform_settings` or similar flags before running. This allows enabling or disabling behavior without code changes.

## Related

- [Schema](schema)
- [ADR-002 — NPV calculation](../../decisions/adr-002-npv-calculation)
- [API — Offers](../api/offers)
