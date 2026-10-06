# API — Properties

Access to real-estate properties via Supabase and the `PropertiesRepository`.

## Overview

| Field | Value |
|-------|--------|
| Type | `properties` table + repository |
| Location | `src/lib/db/repositories/properties.repo.ts` |

Operations use the Supabase client. RLS restricts which rows each user can read or modify.

## Table `properties`

Main fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifier |
| `owner_id` | UUID | FK to `profiles` |
| `agent_id` | UUID | FK to `profiles` (optional) |
| `title` | string | Title |
| `description` | text | Description |
| `address` | string | Address |
| `city` | string | City |
| `price` | bigint | Price (COP) |
| `property_type` | enum | `apartment`, `house`, `townhouse`, `office`, `commercial` |
| `bedrooms` | int | Number of bedrooms |
| `bathrooms` | int | Number of bathrooms |
| `area` | int | Area (m²) |
| `parking` | int | Parking spaces |
| `status` | enum | `draft`, `pending`, `published`, `sold`, `rented`, `archived` |
| `verified` | bool | Certification |
| `premium` | bool | Featured |
| `images` | text[] | Image URLs |
| `created_at`, `updated_at` | timestamptz | Audit |

## PropertiesRepository

### Get published properties

```typescript
import { propertiesRepository } from '@/lib/db/repositories/properties.repo';

const result = await propertiesRepository.getPublishedProperties({
  propertyType: 'apartment',
  minPrice: 200_000_000,
  maxPrice: 500_000_000,
  bedrooms: 2,
  city: 'Medellín',
  search: 'Poblado',
  verified: true,
});
// Result<Property[], AppError>
```

Optional filters: `status`, `propertyType`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `city`, `search`, `verified`, `premium`, `ownerId`.

### Get property by ID

```typescript
const result = await propertiesRepository.getPropertyById(propertyId);
// Result<Property | null, AppError>
```

### Create and update

The repository exposes methods for creating and updating properties (e.g. in the upload wizard). Inserts and updates must comply with RLS (e.g. `owner_id = auth.uid()` or `agent`/`admin` role).

## Related

- [Database schema](db-schema) — `properties` and related tables
- [Concepts](concepts) — Properties
- [API — Visits](api-visits)
