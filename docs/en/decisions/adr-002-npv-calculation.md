# ADR-002: NPV calculation

**Status** | Accepted  
**Date** | 2024-11-02  
**Context** | Need to calculate net present value of offers to support negotiation decisions.

## Context

There was no quantitative way to compare offers. Sellers could not consistently evaluate time to close, payment risk, special conditions, and total economic value.

## Decision

Implement **NPV calculation in the database** (SQL function), with:

- Payment method adjustments (cash, financing, crypto).
- Time value of money based on closing date.
- Risk adjustments by payment method and contingencies.
- NPV impact of each structured condition.
- Inflation adjustment for long periods (e.g. > 90 days).

## Alternatives considered

- **Client-side calculation**: Flexible, but duplicated logic, performance and security concerns.
- **Database calculation**: Fast, consistent, secure; less flexible to change rules without migrations.
- **Separate service**: Isolated and testable; network overhead and more operational complexity.

## Consequences

**Positive**: Fast calculations, consistent results, secure execution, automatic recalculation on changes.

**Negative**: SQL complexity, harder testing, more fixed calculation rules.

## References

- `supabase/migrations/20241102000002_create_npv_calculation.sql`
- `src/services/npvCalculation.service.ts` (or equivalent)
- [Database — Functions](../reference/database/functions)
- [API — Offers](../reference/api/offers)
