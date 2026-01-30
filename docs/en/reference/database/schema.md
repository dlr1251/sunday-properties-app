# Database — Schema

Main tables, relationships, and types.

## Overview

Relational model on PostgreSQL. Migrations in `supabase/migrations/`. Base schema in `20240101000000_01_base_schema.sql`; RLS in `20240101000001_02_rls_policies.sql`; functions and triggers in later migrations.

## Auth and profiles

| Table | Description |
|-------|-------------|
| `auth.users` | Supabase Auth: identity, session, credentials |
| `profiles` | Extended profile: `id` (FK to `auth.users`), `full_name`, `email`, `phone`, `role`, `status`, `verification_status`, `avatar_url`, etc. |

1:1 relationship between `auth.users` and `profiles`.

## Properties

| Table | Description |
|-------|-------------|
| `properties` | Listings: title, description, address, price, type, areas, status (`draft`–`archived`), `owner_id`, `agent_id` |
| `property_availability` | Weekly visit availability slots |
| `blocked_dates` | Blocked dates per property |
| `negotiation_rules` | Negotiation rules per property (min price, defaults, etc.) |

`properties` relates to `offers`, `visits`, `property_availability`, `negotiation_rules`, among others.

## Negotiation

| Table | Description |
|-------|-------------|
| `offers` | Purchase offers: `property_id`, `buyer_id`, `offer_price`, `payment_method`, `conditions`, `closing_date`, `status`, NPV fields |
| `counter_offers` | Counteroffers tied to an offer |
| `offer_conditions` | Structured conditions per offer (typed, versioned) |
| `offer_history` | Change history per offer |
| `negotiation_rules` | Rules per property (see above) |

## Visits

| Table | Description |
|-------|-------------|
| `visits` | Scheduled visits: `property_id`, `visitor_id`, `scheduled_date`, `scheduled_time`, `status`, `visit_price`, `paid`, `nda_accepted`, etc. |
| `visit_feedback` | Rating and comments after the visit |

## Legal

| Table | Description |
|-------|-------------|
| `cases` | Legal cases: `lawyer_id`, `buyer_id`, `seller_id`, `property_id`, `offer_id`, `case_type`, `status` |
| `case_documents` | Case documents (contracts, certificates, etc.) |
| `contracts` | Contracts linked to the flow |
| `intent_letters` | Intent letters per offer |

## Communication and system

| Table | Description |
|-------|-------------|
| `chat_messages` | Chat messages |
| `notifications` | In-app notifications |
| `audit_logs` | Audit log |
| `platform_settings` | Global config and feature flags |

## Main relationships

```
auth.users ←→ profiles
profiles ←→ properties (owner_id, agent_id)
properties ←→ offers, visits, property_availability, negotiation_rules
offers ←→ counter_offers, offer_conditions, offer_history, intent_letters
offers ←→ cases
cases ←→ case_documents
```

## Conventions

- UUID `id` primary keys.
- `created_at`, `updated_at` on main tables.
- Enums for `status`, `role`, `property_type`, etc., defined in migrations.

## Related

- [RLS Policies](rls-policies)
- [Functions](functions)
- [API — Properties](../api/properties)
