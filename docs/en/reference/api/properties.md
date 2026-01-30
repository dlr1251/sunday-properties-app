# API — Properties

Access to real-estate properties via Supabase and `PropertiesRepository`.

## Overview

| Field | Value |
|-------|--------|
| Type | `properties` table + repository |
| Location | `src/lib/db/repositories/properties.repo.ts` |

Operations use the Supabase client. RLS restricts which rows each user can read or update.

## `properties` table

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
| `bedrooms` | int | Bedrooms |
| `bathrooms` | int | Bathrooms |
| `area` | int | Area (m²) |
| `parking` | int | Parking spaces |
| `status` | enum | `draft`, `pending`, `published`, `sold`, `rented`, `archived` |
| `verified` | bool | Certification |
| `premium` | bool | Featured |
| `images` | text[] | Image URLs |
| `created_at`, `updated_at` | timestamptz | Audit |

## PropertiesRepository

### Fetch published properties

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

### Fetch by ID

```typescript
const result = await propertiesRepository.getPropertyById(propertyId);
// Result<Property | null, AppError>
```

### Create and update

The repository exposes create/update methods (e.g. in the upload wizard). Inserts and updates must satisfy RLS (e.g. `owner_id = auth.uid()` or `agent`/`admin` role).

## Common relations

Many queries `select` with joins to `profiles` (owner, agent). Simplified example:

```typescript
supabase
  .from('properties')
  .select(`
    *,
    owner:profiles!properties_owner_id_fkey (id, name, email)
  `)
  .eq('status', 'published');
```

## Availability and visits

- **property_availability**: Weekly slots for scheduling visits.
- **blocked_dates**: Blocked dates per property.

They are not part of the properties repository but are used in the visit flow. See [API — Visits](visits).

## Related

- [Database — Schema](../database/schema) — `properties` and related tables
- [Process — Publish property](../../processes/publish-property)
- [Concepts](../../guide/concepts) — Properties
