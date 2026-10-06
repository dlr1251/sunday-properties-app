# NPV Calculation Functions

## Overview

Server-side SQL functions for calculating Net Present Value of real estate offers.

## Functions

### calculate_offer_npv

Main NPV calculation function.

**Signature**:
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

**Usage**:
```sql
SELECT * FROM calculate_offer_npv('offer-id-here', 0.12);
```

**Parameters**:
- `p_offer_id`: Offer ID to calculate
- `p_base_discount_rate`: Annual discount rate (default 10%)

**Returns**:
```json
{
  "npv": 495000000,
  "adjusted_value": 495000000,
  "risk_adjusted_npv": 490000000,
  "breakdown": {
    "base_value": 500000000,
    "payment_method_adjustment": 10000000,
    "time_adjustment": -15000000,
    "risk_adjustment": -5000000,
    "conditions_adjustment": 5000000,
    "total_adjustments": -5000000
  }
}
```

### calculate_discount_factor

Helper function for time value of money.

**Signature**:
```sql
FUNCTION calculate_discount_factor(
  days INTEGER,
  annual_rate DECIMAL DEFAULT 0.10
)
RETURNS DECIMAL
```

**Usage**:
```sql
SELECT calculate_discount_factor(90, 0.10); -- Returns ~0.976
```

**Formula**: `(1 + rate)^(-days/365)`

### trigger_calculate_offer_npv

Auto-calculation trigger.

**When**: After INSERT or UPDATE of `offer_price`, `payment_method`, `closing_date`, `financing_details`

**Logic**:
1. Check if NPV feature flag is enabled
2. Calculate NPV
3. Store in `offers.calculated_npv`, `offers.risk_adjusted_npv`, `offers.npv_breakdown`

## Calculation Logic

### 1. Payment Method Adjustment

```sql
CASE payment_method
  WHEN 'cash' THEN base_value * 0.02      -- +2% liquidity premium
  WHEN 'financing' THEN base_value * -0.03 -- -3% risk
  WHEN 'crypto' THEN base_value * -0.05   -- -5% volatility
  WHEN 'mixed' THEN base_value * -0.01    -- -1%
  ELSE 0
END
```

### 2. Time Value Adjustment

```sql
base_value * (1 - calculate_discount_factor(closing_days, rate))
```

### 3. Risk Adjustment

```sql
CASE payment_method
  WHEN 'cash' THEN 0
  WHEN 'financing' THEN base_value * 0.02
  WHEN 'crypto' THEN base_value * 0.05
  WHEN 'mixed' THEN base_value * 0.03
  ELSE 0
END
```

Plus additional risk from:
- Low down payment (< 20%): +3%
- Each contingency: +0.5%

### 4. Conditions Adjustment

Sum of all `npv_impact` values from `offer_conditions` where `status IN ('proposed', 'accepted')`.

### 5. Inflation Adjustment

For closing periods > 90 days:
```sql
base_value * 0.05 * (closing_days / 365.0)
```

## Final Formula

```sql
NPV = base_value 
      + payment_method_adjustment 
      - time_adjustment 
      + conditions_adjustment

Risk-adjusted NPV = NPV - risk_adjustment
```

## Performance

- Execution time: < 500ms typical
- Indexes: Uses offer and condition indexes
- Caching: Results stored in `offers` table
- Trigger: Only fires when NPV feature flag enabled

## Testing

```sql
-- Test with known values
SELECT * FROM calculate_offer_npv('test-offer-id');

-- Verify breakdown
SELECT 
  calculated_npv,
  risk_adjusted_npv,
  npv_breakdown
FROM offers
WHERE id = 'test-offer-id';
```

## Troubleshooting

**Issue**: NPV not calculating  
**Fix**: Check feature flag enabled for user

**Issue**: Incorrect NPV values  
**Fix**: Verify discount rate (default 0.10 = 10%)

**Issue**: Slow calculation  
**Fix**: Check indexes exist, query execution plan

