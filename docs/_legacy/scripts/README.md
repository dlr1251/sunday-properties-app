# Scripts Directory

This directory contains all utility, seeding, and maintenance scripts for the project.

## Main Scripts

### User Management
- **`seed-users.mjs`** - Main user seeding script (RECOMMENDED)
  - Creates 20 test users with correct roles and verification statuses
  - Usage: `node scripts/seed-users.mjs`
  - See `SEEDING.md` for details

- **`seed-production-data.sh`** - Complete environment setup
  - Run migrations, create users, seed production data
  - Usage: `./scripts/seed-production-data.sh`

## Helper Scripts

Utility scripts for maintenance and testing:
- `fix-constraint.js` - Fix database constraints
- `check-users.js` - Verify user setup
- `test-db.js` - Test database connection
- `test-working-users.js` - Test user authentication
- `test-properties.js` - Test property queries
- `check-schema.js` - Verify database schema
- `ensure-profiles.js` - Ensure all users have profiles
- `fix-profiles.js` - Fix profile data
- And more...

## Archived Scripts

Legacy and superseded scripts are stored in `_archived/`:
- Old seeding scripts (superseded by `seed-users.mjs`)
- Role fixing scripts (now handled by migrations)
- Duplicate user management scripts

These are kept for reference but should not be used.

## Quick Start

```bash
# Seed test users
node scripts/seed-users.mjs

# Complete setup with production data
./scripts/seed-production-data.sh

# Check users
node scripts/check-users.js
```

For more details, see the main project documentation.
