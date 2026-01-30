# ADR 002: NPV Calculation Approach

**Status**: Accepted  
**Date**: 2024-11-02  
**Context**: Need to calculate comprehensive Net Present Value for offers to enable data-driven negotiation decisions

## Decision

We will implement NPV calculation at the database level (SQL function) with the following considerations:
- **Payment method adjustments**: Cash premium, financing risk, crypto volatility
- **Time value of money**: Discount future payments based on closing date
- **Risk adjustments**: Base risk by payment method + contingency risk
- **Condition impacts**: Direct NPV impact from each structured condition
- **Inflation adjustment**: For long closing periods (> 90 days)

## Context

Current system has no quantitative comparison mechanism for offers. Sellers cannot easily compare offers considering:
- Time to close
- Payment risk
- Special conditions
- Total economic value

## Alternatives Considered

### Option 1: Client-side calculation
**Pros**: Flexible, easy to iterate  
**Cons**: Performance issues, duplicated logic, security concerns

### Option 2: Database-level calculation
**Pros**: Fast, consistent, secure  
**Cons**: Less flexible for rapid iteration

### Option 3: Separate calculation service
**Pros**: Isolation, testability  
**Cons**: Network overhead, complexity

## Decision Drivers

1. **Performance**: NPV must calculate in < 500ms
2. **Consistency**: Same calculation logic everywhere
3. **Security**: Financial calculations must be tamper-proof
4. **Flexibility**: Need to iterate on calculation rules

## Consequences

### Positive
- Fast calculations
- Consistent results
- Secure execution
- Automatic recalculation on changes

### Negative
- SQL complexity
- Harder to test
- Less flexibility
- Fixed calculation rules

## Implementation

See:
- `supabase/migrations/20241102000002_create_npv_calculation.sql`
- `src/services/npvCalculation.service.ts`
- `src/components/negotiation/NPVCalculatorWidget.tsx`

## Future Enhancements

- Machine learning for impact prediction
- Custom discount rates per user/property
- Monte Carlo simulation for risk
- Market-based adjustments

