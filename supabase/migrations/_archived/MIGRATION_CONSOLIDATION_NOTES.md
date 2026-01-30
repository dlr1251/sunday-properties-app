# Migration Consolidation Notes

## Overview
This document tracks migration consolidation efforts to reduce redundancy and improve maintainability.

## Identified Duplicates and Overlaps

### 1. Profiles Table Creation
**Duplicate migrations:**
- `20251020090000_create_profiles_table.sql` - Creates profiles table
- `20251021140000_initial_schema.sql` - Also creates profiles table (with IF NOT EXISTS)

**Status:** Both use `CREATE TABLE IF NOT EXISTS` so they're safe, but redundant.

### 2. Properties/Visits/Offers Tables
**Duplicate migrations:**
- `20251020090000_create_profiles_table.sql` - Creates properties, visits, offers tables
- `20251021150000_properties_and_business_logic.sql` - Also creates properties, visits, offers tables

**Status:** Both use `IF NOT EXISTS` so safe but redundant.

### 3. RLS Policy Updates
**Related migrations:**
- `20251020090000_create_profiles_table.sql` - Creates initial RLS policies
- `20251021120000_update_rls_policies.sql` - Updates RLS policies
- `20251021230000_fix_profiles_rls_policies.sql` - Fixes RLS policies

**Status:** Multiple updates to same policies across migrations.

### 4. Property Availability
**Related migrations:**
- `20251021010000_property_availability.sql` - Property availability functions
- `20251023134500_verification_and_availability.sql` - Verification and availability
- `20251023140001_property_visit_availability.sql` - Property visit availability

**Status:** Potentially overlapping functionality.

### 5. Storage Buckets
**Related migrations:**
- `20250126000000_create_properties_bucket.sql` - Creates properties bucket
- `20251025220000_property_storage_buckets.sql` - Property storage buckets

**Status:** May overlap.

## Consolidation Strategy

### Phase 1: Document Current State (Completed)
- ✅ Identified duplicate table creations
- ✅ Identified overlapping functionality

### Phase 2: Create Consolidated Migrations (If Needed)
For new environments, consider creating:
- `001_initial_schema.sql` - All base tables (profiles, properties, visits, offers)
- `002_business_logic.sql` - Functions, triggers, constraints
- `003_rls_policies.sql` - All RLS policies consolidated
- `004_additional_features.sql` - Later features (notifications, chat, etc.)

### Phase 3: Archive Old Migrations (After Verification)
Once consolidated migrations are verified to work:
- Move redundant migrations to `_archived/` subdirectory
- Keep only the latest version of each logical group

## Notes
- All migrations use `CREATE TABLE IF NOT EXISTS` and `CREATE OR REPLACE FUNCTION` patterns
- This makes them idempotent and safe to run multiple times
- Consolidation is primarily for code organization, not functionality
- Current migrations are safe to keep as-is for existing deployments

## Recommendations
1. **For new deployments:** Use consolidated migrations
2. **For existing deployments:** Keep current migrations as-is
3. **For development:** Consider consolidating once everything is stable

