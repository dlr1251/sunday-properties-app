# Database Seeding Guide - Consolidated System

This document explains the new consolidated database seeding and migration system for local development and testing.

## 🎯 Overview

The database has been fully consolidated with:
- **6 ordered migrations** instead of 46+ scattered files
- **1 main seed file** (`seed-local.sql`) for local development
- **Idempotent operations** that can run multiple times safely
- **Preserved data** - all 20 users and related resources remain intact

## 🚀 Quick Start

### For Development (Recommended)
```bash
# Complete reset and seed for fresh development
npm run db:reset-seed

# Or step-by-step:
npm run db:reset-seed  # Full reset + seed
```

### For Testing Negotiations
```bash
# Reset and seed with negotiation test data
./scripts/reset-and-seed.sh
```

## 📁 New Structure

```
supabase/
├── migrations/           # 6 consolidated migrations
│   ├── 20240101000000_01_base_schema.sql
│   ├── 20240101000001_02_rls_policies.sql
│   ├── 20240101000002_03_functions_triggers.sql
│   ├── 20240101000003_04_negotiations_system.sql
│   ├── 20240101000004_05_additional_features.sql
│   └── 20240101000005_06_indexes_optimizations.sql
├── seeds/               # Organized seeds
│   ├── seed-local.sql                     # Main local seed
│   └── seed-negotiation-test-data.sql     # Extra negotiation data
└── _archived/           # Old migrations (preserved)
```

## 🛠️ Available Scripts

### Package.json Scripts
```bash
npm run seed:complete     # Seed after migrations applied
npm run seed:negotiations # Add negotiation test data
npm run db:reset-seed     # Full reset for development
npm run db:verify         # Verify data integrity
```

### Direct Scripts
```bash
./scripts/seed-complete.sh           # Seed users + data
./scripts/reset-and-seed.sh          # Full reset + seed
./scripts/verify-data-preservation.sh # Data integrity check
```

## 👥 Test Users Created

The system creates **20 test users** with realistic roles:

| Role | Count | Emails | Status |
|------|-------|--------|--------|
| `super_admin` | 1 | `superadmin@sunday.local` | verified |
| `admin` | 2 | `admin@sunday.local`, `admin1@sunday.local` | verified |
| `lawyer` | 3 | `lawyer1-3@sunday.local` | verified |
| `agent` | 4 | `agent1-4@sunday.local` | verified |
| `user` | 10 | `user1-10@sunday.local` | active |

**All passwords:** `Password123!`

## 🏠 Test Data Included

### Properties (5)
- 5 realistic properties owned by regular users
- Mix of apartments, houses in Bogotá and Medellín
- Published status with images and features

### Negotiations (2+)
- Active negotiations between users
- Offers with different statuses (pending, counter-offer, accepted)
- Documents and timeline actions
- Can be extended with `seed-negotiation-test-data.sql`

## 🔄 Development Workflow

### Fresh Development Setup
```bash
# 1. Reset database completely
supabase db reset --local

# 2. Create auth users
node scripts/seed-users.mjs

# 3. Apply consolidated migrations
supabase migration up --local

# 4. Seed test data
./scripts/seed-complete.sh

# 5. Verify everything worked
./scripts/verify-data-preservation.sh
```

### Quick Reset for Testing
```bash
# One command to reset everything
npm run db:reset-seed
```

### Adding Negotiation Test Data
```bash
# After basic seeding, add negotiation scenarios
npm run seed:negotiations
```

## ✅ Data Verification

After seeding, verify with:
```bash
npm run db:verify
```

Expected results:
- ✅ 20 auth users
- ✅ 20 active profiles
- ✅ 5 properties
- ✅ 2+ negotiations
- ✅ No data integrity issues

## 🐛 Troubleshooting

### Migrations Fail
```bash
# Check migration status
supabase migration list

# Reset and retry
supabase db reset --local
supabase migration up --local
```

### Users Not Created
```bash
# Ensure Supabase is running
supabase status

# Recreate users
node scripts/seed-users.mjs
```

### Negotiation Data Missing
```bash
# Add negotiation test data
npm run seed:negotiations
```

## 🔒 Security & RLS

The consolidated system includes:
- ✅ Proper RLS policies for all tables
- ✅ Admin access via JWT claims (no recursion)
- ✅ Service role bypass for maintenance
- ✅ User isolation for sensitive data

## 📊 Migration Benefits

| Before | After |
|--------|-------|
| 46+ migration files | 6 logical migrations |
| Scattered seeds | 1 main seed file |
| Manual coordination | Automated scripts |
| Risk of conflicts | Idempotent operations |
| Hard to maintain | Easy to understand |

## 🎯 Testing Negotiations

The system is optimized for negotiation testing:

1. **Real users**: 10 regular users with properties
2. **Active negotiations**: Pre-created negotiation scenarios
3. **Multiple states**: Open, closed, cancelled negotiations
4. **Complete offers**: Different offer statuses and types
5. **Timeline data**: Actions and document history

### Test Scenarios Available
- ✅ User-to-user negotiations
- ✅ Counter-offer workflows
- ✅ Document management
- ✅ Offer lifecycle (pending → accepted)
- ✅ Cancellation flows

## 📝 Migration from Old System

If you have an existing database:

1. **Backup first**: `pg_dump > backup.sql`
2. **Run consolidated migrations**: `supabase migration up`
3. **Verify data**: `./scripts/verify-data-preservation.sh`
4. **Test frontend**: Ensure login and negotiations work

## 🚀 Production Deployment

For production:
- Use `seed-local.sql` as reference for data structure
- Adapt user creation for production auth systems
- Keep negotiation test data out of production
- RLS policies automatically protect data

## 📚 Related Documentation

- `docs/database/schema.md` - Complete schema reference
- `docs/setup/supabase-local.md` - Local setup guide
- `docs/testing/scenarios.md` - Testing scenarios

## 🎉 Summary

✅ **Consolidated**: 46 → 6 migrations
✅ **Organized**: Single seed file for development
✅ **Safe**: Idempotent operations
✅ **Complete**: 20 users + full negotiation data
✅ **Tested**: Frontend integration verified
✅ **Maintained**: All existing functionality preserved

**Start developing:** `npm run db:reset-seed`
