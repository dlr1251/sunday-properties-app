# ADR-001: Structured conditions

**Status** | Accepted  
**Date** | 2024-11-02  
**Context** | Replace TEXT[] conditions with a structured, versioned model with NPV impact.

## Context

Offer conditions were stored in a TEXT[] array with no structure, versioning, or impact analysis. Individual conditions could not be negotiated, changes could not be tracked over time, and their effect on deal value could not be computed.

## Decision

Implement a **structured conditions** model where each aspect of an offer is a first-class entity: type (inspection, financing, notary costs, etc.), versioning and parent-child relations, NPV and risk impact, interdependency validation, and status (proposed, accepted, rejected, countered, withdrawn).

## Alternatives considered

- **Keep TEXT[]**: Simple and compatible, but no granular negotiation or analysis.
- **Hybrid (TEXT[] + conditions table)**: Gradual migration at the cost of duplication and complexity.
- **Structured model with dual support**: Clear architecture and backward compatibility; higher implementation effort.

## Consequences

**Positive**: Rich per-condition negotiation, impact analysis, better UX, foundation for advanced features.

**Negative**: Higher complexity, longer development, migrations and dual-mode maintenance.

## References

- `supabase/migrations/20241102000001_create_offer_conditions.sql`
- `src/services/offerConditions.service.ts`
- `src/components/negotiation/StructuredConditionsEditor` (or equivalent)
- [API — Offers](../reference/api/offers)
- [Database — Functions](../reference/database/functions)
