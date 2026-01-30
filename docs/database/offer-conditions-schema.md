# Offer Conditions Schema

## Overview

The `offer_conditions` table stores structured, negotiable conditions for real estate offers with versioning, interdependencies, and impact tracking.

## Schema

```sql
CREATE TABLE offer_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  parent_condition_id UUID REFERENCES offer_conditions(id) ON DELETE SET NULL,
  
  -- Core fields
  condition_type condition_type NOT NULL,
  condition_key TEXT NOT NULL,
  condition_value JSONB NOT NULL,
  condition_display_text TEXT NOT NULL,
  
  -- Negotiation tracking
  status condition_status NOT NULL DEFAULT 'proposed',
  proposed_by condition_proposer NOT NULL,
  proposer_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Impact analysis
  npv_impact DECIMAL(15,2),
  risk_impact INTEGER CHECK (risk_impact >= 0 AND risk_impact <= 100),
  priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  superseded_by UUID REFERENCES offer_conditions(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  
  UNIQUE(offer_id, condition_key, version)
);
```

## Enums

### condition_type

- `price`
- `payment_method`
- `closing_date`
- `delivery_date`
- `deed_signing_date`
- `notary_costs_distribution`
- `promesa_compraventa_terms`
- `inspection_contingency`
- `financing_contingency`
- `appraisal_contingency`
- `title_contingency`
- `repairs_required`
- `appliances_included`
- `custom`

### condition_status

- `proposed` - Awaiting response
- `accepted` - Accepted
- `rejected` - Rejected
- `countered` - Countered with modifications
- `withdrawn` - Withdrawn

### condition_proposer

- `buyer`
- `seller`
- `agent`
- `lawyer`

## Key Relationships

```
offer_conditions
  ├─ offer_id → offers.id (CASCADE)
  ├─ parent_condition_id → offer_conditions.id (tree structure)
  ├─ proposer_user_id → profiles.id
  └─ superseded_by → offer_conditions.id
```

## Indexes

- Primary: `id`
- Foreign keys: `offer_id`, `parent_condition_id`, `proposer_user_id`
- Query optimization: `(offer_id, status)`, `(offer_id, version)`
- Full-text: Consider GIN index on `condition_display_text`

## RLS Policies

- **SELECT**: Users can view conditions for their offers
- **INSERT**: Users can create conditions for their offers
- **UPDATE**: Users can update conditions for their offers
- **DELETE**: Users can delete (withdraw) their own conditions

## Example Data

```json
{
  "id": "uuid",
  "offer_id": "offer-uuid",
  "condition_type": "inspection_contingency",
  "condition_key": "inspection_contingency",
  "condition_value": {
    "description": "Inspección técnica",
    "days": 15,
    "required": true
  },
  "condition_display_text": "Inspección técnica en 15 días",
  "status": "proposed",
  "proposed_by": "buyer",
  "npv_impact": -5000000,
  "risk_impact": 15,
  "priority": 80
}
```

## Migrations

- 20241102000001: Initial create with RLS
- Future: Additional optimizations, new condition types

