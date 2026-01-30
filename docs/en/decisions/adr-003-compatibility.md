# ADR-003: Backward compatibility strategy

**Status** | Accepted  
**Date** | 2024-11-02  
**Context** | Refactor the offers system without breaking existing data or behavior.

## Context

Production data uses TEXT[] for conditions. We cannot break current behavior, lose data, force a bulk migration, or disrupt active negotiations.

## Decision

**Dual support**:

1. Legacy TEXT[] conditions are retained.
2. Structured conditions operate in parallel.
3. Feature flags control which mode is active.
4. Data migration is optional and gradual.

## Alternatives considered

- **Break compatibility and migrate all**: Clean architecture, but high risk and disruption.
- **Dual mode indefinitely**: No immediate risk, but permanent technical debt.
- **Transition period then deprecation**: Balance of both; requires careful planning.

## Consequences

**Positive**: Zero-downtime rollout, gradual transition, room for A/B testing and phased adoption.

**Negative**: Greater complexity, two code paths, migration pressure, technical debt during transition.

## References

- `src/lib/featureFlags.ts`
- `src/lib/db/repositories/offers.repo.ts`
- `src/contexts/FeatureFlagsContext.tsx` (or equivalent)
- [ADR-001 — Structured conditions](adr-001-structured-conditions)
