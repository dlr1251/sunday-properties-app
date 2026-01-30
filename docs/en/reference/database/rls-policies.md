# Database — RLS Policies

Row Level Security: access rules per table and role.

## Overview

RLS is enabled on public tables. Policies define which rows each user can select, insert, update, or delete based on `auth.uid()` and, when applicable, JWT role.

Policies are defined in `supabase/migrations/20240101000001_02_rls_policies.sql` and later migrations.

## Profiles (`profiles`)

| Policy | Operation | Condition |
|--------|-----------|-----------|
| Users can view their own profile | SELECT | `auth.uid() = id` |
| Users can update their own profile | UPDATE | `auth.uid() = id` |
| Users can insert their own profile | INSERT | `auth.uid() = id` |
| Admins can view/update/insert all profiles | SELECT, UPDATE, INSERT | `auth.jwt() ->> 'role'` in `admin`, `super_admin` |
| Service role | ALL | `true` (bypass for seeding and backend ops) |

## Properties (`properties`)

| Policy | Operation | Condition |
|--------|-----------|-----------|
| Anyone can view published properties | SELECT | `status = 'published'` |
| Owners can manage their properties | ALL | `auth.uid() = owner_id` |
| Authenticated users can manage properties | ALL | Authenticated (for agents and specific flows) |

## Visits (`visits`)

| Policy | Operation | Condition |
|--------|-----------|-----------|
| Users can view their own visits | SELECT | `auth.uid() = visitor_id` |
| Owners can view visits to their properties | SELECT | User is `owner_id` of the visit’s property |
| Users can create visits | INSERT | `auth.uid() = visitor_id` |
| Users can update their own visits | UPDATE | `auth.uid() = visitor_id` |

## Offers (`offers`)

| Policy | Operation | Condition |
|--------|-----------|-----------|
| Participants can view their offers | SELECT | `auth.uid() = buyer_id` or user is property owner |
| Users can create offers | INSERT | Authenticated (buyer validation in business logic) |
| Others | UPDATE, etc. | Restricted by participant (buyer, seller, agent) per migrations |

## Other tables

Similar policies for `counter_offers`, `offer_conditions`, `notifications`, `cases`, `case_documents`, `audit_logs`, etc.: access by resource owner, negotiation participant, or admin role. The **service role** bypasses RLS when used in scripts or Edge Functions.

## Good practices

- Do not expose the service role key in the frontend.
- Review new policies when adding tables or sensitive columns.
- Use `auth.jwt() ->> 'role'` only if the role is correctly stored in the JWT (e.g. via `profiles` or custom claims).

## Related

- [Schema](schema)
- [API — Authentication](../api/authentication)
- [Concepts](../../guide/concepts)
