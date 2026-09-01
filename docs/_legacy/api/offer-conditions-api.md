# Offer Conditions API Reference

## Overview

The Offer Conditions API allows creating, updating, and managing structured, negotiable conditions for real estate offers.

## Base URL

All endpoints use the OfferConditionsService singleton:

```typescript
import { offerConditionsService } from '@/services/offerConditions.service';
```

## Endpoints

### Create Condition

```typescript
const result = await offerConditionsService.createCondition({
  offerId: string,
  conditionType: ConditionType,
  conditionKey: string,
  conditionValue: any,
  conditionDisplayText: string,
  proposedBy: 'buyer' | 'seller' | 'agent' | 'lawyer',
  proposerUserId: string,
  npvImpact?: number,
  riskImpact?: number,
  priority?: number,
  notes?: string,
  parentConditionId?: string
});
```

**Response**: `Result<OfferCondition, AppError>`

**Example**:
```typescript
const result = await offerConditionsService.createCondition({
  offerId: '123',
  conditionType: 'inspection_contingency',
  conditionKey: 'inspection_contingency',
  conditionValue: { days: 15, required: true },
  conditionDisplayText: 'Inspección técnica en 15 días',
  proposedBy: 'buyer',
  proposerUserId: user.id,
  riskImpact: 15,
  priority: 80
});
```

### Get Conditions by Offer

```typescript
const result = await offerConditionsService.getConditionsByOffer(offerId);
```

**Returns**: All conditions for an offer, ordered by creation date

### Get Condition by ID

```typescript
const result = await offerConditionsService.getConditionById(conditionId);
```

### Update Condition Status

```typescript
const result = await offerConditionsService.updateConditionStatus({
  conditionId: string,
  status: 'proposed' | 'accepted' | 'rejected' | 'countered' | 'withdrawn',
  counterValue?: any,
  notes?: string
});
```

### Validate Interdependencies

```typescript
const validation = await offerConditionsService.validateConditionInterdependencies(
  offerId,
  newCondition
);
```

**Returns**: `{ valid: boolean, errors: string[], warnings?: string[] }`

### Get Condition Templates

```typescript
const templates = await offerConditionsService.getConditionTemplates(propertyType);
```

Returns predefined condition templates for the property type.

### Get Condition History

```typescript
const history = await offerConditionsService.getConditionHistory(conditionKey, offerId);
```

Returns all versions of a condition (for tracking negotiations).

## Condition Types

- `inspection_contingency` - Technical inspection
- `financing_contingency` - Financing approval
- `appraisal_contingency` - Appraisal requirement
- `title_contingency` - Title study
- `repairs_required` - Required repairs
- `appliances_included` - Included appliances
- `notary_costs_distribution` - Notary cost split
- `promesa_compraventa_terms` - Purchase promise terms
- `delivery_date` - Delivery date
- `deed_signing_date` - Deed signing date
- `custom` - Custom condition

## Status Values

- `proposed` - Newly proposed, awaiting response
- `accepted` - Accepted by other party
- `rejected` - Rejected by other party
- `countered` - Countered with modifications
- `withdrawn` - Withdrawn by proposer

## Error Handling

All methods return `Result<T, AppError>` for consistent error handling:

```typescript
const result = await offerConditionsService.createCondition(input);
if (!result.ok) {
  console.error('Error:', result.error.message);
  return;
}
const condition = result.data;
```

