# ADR 003: Backward Compatibility Strategy

**Status**: Accepted  
**Date**: 2024-11-02  
**Context**: Need to refactor offers system without breaking existing functionality or data

## Decision

We will implement **dual-mode support** where:
1. Legacy TEXT[] conditions are preserved indefinitely
2. New structured conditions run in parallel
3. Feature flags control which mode is active
4. Data migration is optional and gradual

## Context

Existing production data uses TEXT[] for conditions. We cannot:
- Break existing functionality
- Lose user data
- Force immediate migration
- Disrupt active negotiations

## Alternatives Considered

### Option 1: Break compatibility, migrate all data
**Pros**: Clean architecture  
**Cons**: High risk, disruptive, user friction

### Option 2: Dual-mode indefinitely
**Pros**: Zero risk, no migration pressure  
**Cons**: Permanent technical debt

### Option 3: Transition period then deprecation
**Pros**: Best of both worlds  
**Cons**: Need careful planning

## Decision Drivers

1. **Zero Downtime**: Cannot interrupt operations
2. **Gradual Rollout**: Feature flags enable safe testing
3. **User Adoption**: Need time for users to adapt
4. **Data Integrity**: Must never lose data

## Consequences

### Positive
- Zero risk deployment
- User-friendly transition
- Opportunity for gradual adoption
- A/B testing capabilities

### Negative
- Increased complexity
- Dual code paths
- Migration pressure
- Technical debt

## Implementation

See:
- `src/lib/featureFlags.ts` - Feature flag system
- `src/lib/db/repositories/offers.repo.ts` - Dual-mode repository
- `src/contexts/FeatureFlagsContext.tsx` - Frontend integration

## Migration Strategy

1. Phase 1: Deploy dual-mode (THIS PHASE)
2. Phase 2: Beta test with power users
3. Phase 3: Gradual rollout
4. Phase 4: 100% adoption
5. Phase 5: Deprecate legacy (future)

