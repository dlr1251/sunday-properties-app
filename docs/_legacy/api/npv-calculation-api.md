# NPV Calculation API Reference

## Overview

The NPV Calculation API provides comprehensive Net Present Value calculations for real estate offers, considering payment methods, time, risk, conditions, and inflation.

## Base URL

```typescript
import { npvCalculationService } from '@/services/npvCalculation.service';
```

## Endpoints

### Calculate Offer NPV

```typescript
const result = await npvCalculationService.calculateOfferNPV(
  offerId: string,
  baseDiscountRate?: number // Default: 0.10 (10%)
);
```

**Response**: 
```typescript
{
  npv: number,
  adjustedValue: number,
  riskAdjustedNPV: number,
  breakdown: {
    baseValue: number,
    paymentMethodAdjustment: number,
    timeAdjustment: number,
    riskAdjustment: number,
    conditionsAdjustment: number,
    inflationAdjustment?: number,
    totalAdjustments: number
  },
  confidence: number // 0-100
}
```

**Example**:
```typescript
const result = await npvCalculationService.calculateOfferNPV(
  offerId,
  0.12 // 12% discount rate
);

if (result.ok) {
  console.log(`NPV: ${result.data.npv}`);
  console.log(`Risk-adjusted NPV: ${result.data.riskAdjustedNPV}`);
  console.log(`Confidence: ${result.data.confidence}%`);
}
```

### Compare Offers NPV

```typescript
const result = await npvCalculationService.compareOffersNPV([offerId1, offerId2, offerId3]);
```

**Response**: Array of comparisons sorted by risk-adjusted NPV
```typescript
[
  {
    offerId: string,
    npv: number,
    riskAdjustedNPV: number,
    ranking: number,
    deltaFromBest: number
  }
]
```

### Get NPV Sensitivity Analysis

```typescript
const analysis = await npvCalculationService.getNPVSensitivity(offerId);
```

**Response**: Sensitivity analysis for discount rates and payment methods

## Calculation Factors

### Payment Method Adjustments

- **Cash**: +2% (liquidity premium)
- **Financing**: -3% (risk)
- **Crypto**: -5% (volatility)
- **Mixed**: -1%

### Risk Adjustments

- **Cash**: 0% risk premium
- **Financing**: 2% risk premium
- **Crypto**: 5% risk premium
- **Mixed**: 3%

### Time Adjustments

Discount factor: `(1 + rate)^(-days/365)`

### Condition Adjustments

Each condition can have explicit NPV impact set when created.

### Inflation

For closing periods > 90 days: 5% annual inflation assumption

## SQL Function

The calculation is performed server-side via SQL function `calculate_offer_npv()`:

```sql
SELECT * FROM calculate_offer_npv(offer_id, 0.10);
```

## Performance

- Target: < 500ms per calculation
- Cached in `offers` table
- Auto-recalculates on offer/condition changes
- Triggered automatically via database triggers

