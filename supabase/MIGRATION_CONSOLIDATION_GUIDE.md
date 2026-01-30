# Migration Consolidation Guide

## Current Status

We have **34 migration files** that are currently applied and working. Since migrations are idempotent (using `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, etc.), they can be safely consolidated for **new deployments** while keeping existing ones for current environments.

## Consolidation Strategy

### For New Deployments

Create consolidated migration files organized by logical groups:

1. **001_base_schema.sql** - All base tables (profiles, properties, visits, offers, cases, etc.)
2. **002_rls_policies.sql** - All RLS policies consolidated
3. **003_functions_triggers.sql** - All functions and triggers
4. **004_additional_features.sql** - Notifications, chat, verification, etc.
5. **005_indexes_optimizations.sql** - All indexes and optimizations

### For Existing Deployments

Keep current migrations as-is. They're already applied and working correctly.

## Seed Files Consolidation

✅ **COMPLETED**: Created `seed-consolidated.sql` that combines:
- Profile role assignments
- Property seeding
- Property reassignment to regular users

**Usage:**
1. Run `node scripts/seed-users.mjs` to create auth users
2. Run `psql <connection> -f supabase/seed-consolidated.sql` to seed data

Old seed files backed up as `.backup` files.

## Migration Files That Can Be Consolidated

### Base Schema (Can be merged into 001_base_schema.sql)
- `20251020090000_create_profiles_table.sql`
- `20251021140000_initial_schema.sql`
- `20251021150000_properties_and_business_logic.sql`

### RLS Policies (Can be merged into 002_rls_policies.sql)
- `20251020090000_create_profiles_table.sql` (contains RLS)
- `20251021120000_update_rls_policies.sql`
- `20251021230000_fix_profiles_rls_policies.sql`
- `20251021002315_fix_properties_public_access.sql`
- `20251028010000_visit_rls_verified_only.sql`

### Functions (Can be merged into 003_functions_triggers.sql)
- `20250120030000_negotiation_functions.sql`
- `20251021170000_advanced_negotiation_functions.sql`
- `20251028000000_auto_assign_lawyer.sql`
- Various triggers in multiple files

### Additional Features (Can be merged into 004_additional_features.sql)
- `20251021180000_notifications_system.sql`
- `20251021240000_user_verification_system.sql`
- `20251021250000_create_verification_requests_table.sql`
- `20251023_chat_system.sql`
- `20251021010000_property_availability.sql`
- `20251023134500_verification_and_availability.sql`
- `20251023140001_property_visit_availability.sql`

## Recommendation

**For now:** Keep migrations as-is since they're working and already applied.

**For new projects:** Create consolidated migrations following the structure above.

**For seeds:** Use `seed-consolidated.sql` going forward.

