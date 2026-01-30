# ADR 001: Structured Conditions Model

**Status**: Accepted  
**Date**: 2024-11-02  
**Context**: Need to transform unstructured offer conditions (TEXT[]) into semantically rich, negotiable entities with versioning and impact tracking

## Decision

We will implement a comprehensive structured conditions model that allows each aspect of an offer to be a first-class, negotiable entity with:
- Typed condition types (inspection, financing, notary costs, etc.)
- Version tracking and parent-child relationships
- NPV and risk impact calculations
- Interdependency validation
- Status tracking (proposed, accepted, rejected, countered, withdrawn)

## Context

Currently, conditions are stored as a simple TEXT[] array with no structure, versioning, or impact analysis. This makes it impossible to:
- Negotiate individual conditions
- Track changes over time
- Calculate how conditions affect deal value
- Validate interdependencies

## Alternatives Considered

### Option 1: Keep TEXT[] array (status quo)
**Pros**: Simple, backward compatible  
**Cons**: No negotiation capability, no impact analysis, poor UX

### Option 2: Hybrid approach (TEXT[] + separate conditions table)
**Pros**: Gradual migration  
**Cons**: Data duplication, complexity

### Option 3: Fully structured model with dual-mode support
**Pros**: Clean architecture, rich features, backward compatible  
**Cons**: More complex implementation

## Decision Drivers

1. **Backward Compatibility**: Must support existing TEXT[] conditions
2. **Feature Flags**: Gradual rollout capability required
3. **User Experience**: Need rich negotiation capabilities
4. **Business Value**: NPV calculation and impact tracking are critical

## Consequences

### Positive
- Rich negotiation capabilities
- Impact tracking and analysis
- Better user experience
- Foundation for advanced features

### Negative
- Increased complexity
- Longer development time
- Need for migration scripts
- Dual-mode support overhead

## Implementation

See:
- `supabase/migrations/20241102000001_create_offer_conditions.sql`
- `src/services/offerConditions.service.ts`
- `src/components/negotiation/StructuredConditionsEditor.tsx`

