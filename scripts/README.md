# Scripts Directory

Utilidades para base de datos, seeding, setup, SQL ad-hoc y mantenimiento.

## Estructura

```
scripts/
├── setup/          # Configuración inicial (Supabase, Vercel, .env)
├── sql/            # Consultas SQL sueltas (usuarios, propiedades de prueba)
├── dev/            # Scripts de prueba manual (negociación, contraofertas)
├── _archived/      # Scripts obsoletos conservados por referencia
└── *.mjs, *.sh     # Seeders y utilidades activas
```

### Setup (`setup/`)

| Script | Uso |
|--------|-----|
| `setup.sh` | Crea `.env.local` con plantilla — `npm run setup` |
| `setup-local-supabase.sh` | Supabase local con Docker — `npm run setup:local-supabase` |
| `setup-complete.sh` | Supabase remoto + Vercel — `npm run setup:complete` |

### SQL (`sql/`)

| Archivo | Propósito |
|---------|-----------|
| `confirm-all-users.sql` | Confirmar emails de usuarios en Supabase Auth |
| `fix-problematic-users.sql` | Reparar usuarios con perfiles inconsistentes |
| `insert-test-properties.sql` | Insertar propiedades de prueba |
| `supabase-simple-schema.sql` | Esquema simplificado (referencia histórica) |
| `verify-users-with-properties.sql` | Verificar relación usuario–propiedad |

### Dev (`dev/`)

| Script | Propósito |
|--------|---------|
| `test-counter-offer.js` | Probar flujo de contraoferta |
| `test-negotiation-data.js` | Probar datos de negociación |

---

## Active Scripts

### Documentation

#### `copy-docs-to-public.mjs`
- **Purpose:** Copies bilingual `docs/es` and `docs/en` to `public/docs/` for the in-app viewer
- **Usage:** `npm run copy-docs` (runs automatically on `predev` / `prebuild`)

#### `sync-docs-to-notion.mjs`
- **Purpose:** Syncs `docs/en` and `docs/es` to Notion under the **📚 Documentación** page (Sunday Properties teamspace)
- **Usage:** `npm run sync:docs-notion`
- **Requires:** `NOTION_TOKEN` and `NOTION_DOCS_ROOT_PAGE_ID` in `.env.local` (see `.env.example`)
- **Manifest:** `docs/.notion-sync.json` maps repo paths → Notion page IDs (idempotent upsert)
- **CI:** `.github/workflows/notion-docs-sync.yml` runs on pushes to `docs/**`

#### `bootstrap-notion-sync-batches.mjs` / `merge-notion-batch-result.mjs`
- **Purpose:** One-time helpers for initial MCP-based sync (generates batch files under `scripts/.notion-sync-batches/`)

### Database Seeding

#### `seed-users.mjs` ⭐ **RECOMMENDED**
- **Purpose:** Creates test users with proper roles and profiles
- **Usage:** `node scripts/seed-users.mjs`
- **Features:**
  - Creates users for all roles (user, agent, lawyer, admin, super_admin)
  - Sets up proper verification statuses
  - Uses environment variables from `.env.local`
- **Status:** Active and maintained

#### `comprehensive-seed.js`
- **Purpose:** Comprehensive production-like data seeding
- **Usage:** `node scripts/comprehensive-seed.js`
- **Features:** Seeds users, properties, offers, and related data
- **Status:** Active but may overlap with `seed-users.mjs`

#### `simple-seed.js`
- **Purpose:** Simple data seeding for quick testing
- **Usage:** `node scripts/simple-seed.js`
- **Features:** Basic user and property seeding
- **Status:** Active, simpler alternative to comprehensive-seed

#### `seed-test-user-properties.js`
- **Purpose:** Seeds properties specifically for test users
- **Usage:** `node scripts/seed-test-user-properties.js`
- **Status:** Active, useful for testing property assignments

#### `seed-real-data.js`
- **Purpose:** Seeds realistic production-like data
- **Usage:** `node scripts/seed-real-data.js`
- **Status:** Active

#### `seed-production-data.sh`
- **Purpose:** Shell script for production data seeding
- **Usage:** `bash scripts/seed-production-data.sh`
- **Status:** Active

### Database Maintenance

#### `ensure-profiles.js`
- **Purpose:** Ensures all auth users have corresponding profiles
- **Usage:** `node scripts/ensure-profiles.js`
- **Status:** Active, useful for fixing missing profiles

#### `fix-profiles.js`
- **Purpose:** Fixes profile-related issues
- **Usage:** `node scripts/fix-profiles.js`
- **Status:** Active, use when profiles are misconfigured

#### `fix-profiles-rls.js`
- **Purpose:** Fixes RLS (Row Level Security) policies for profiles
- **Usage:** `node scripts/fix-profiles-rls.js`
- **Status:** Active, use when RLS policies are blocking access

#### `fix-roles-direct.js`
- **Purpose:** Directly fixes user roles in the database
- **Usage:** `node scripts/fix-roles-direct.js`
- **Status:** Active, use when roles need correction

#### `fix-constraint.js`
- **Purpose:** Fixes database constraint issues
- **Usage:** `node scripts/fix-constraint.js`
- **Status:** Active, use when constraints cause errors

### Database Inspection

#### `check-schema.js`
- **Purpose:** Checks database schema for issues
- **Usage:** `node scripts/check-schema.js`
- **Status:** Active, useful for debugging schema problems

#### `check-users.js`
- **Purpose:** Checks user data and configuration
- **Usage:** `node scripts/check-users.js`
- **Status:** Active

#### `get-user-ids.js`
- **Purpose:** Retrieves and displays user IDs
- **Usage:** `node scripts/get-user-ids.js`
- **Status:** Active, useful for debugging

### Data Management

#### `insert-properties.js`
- **Purpose:** Inserts properties into the database
- **Usage:** `node scripts/insert-properties.js`
- **Status:** Active

### Utilities

#### `pdf-to-images.js`
- **Purpose:** Converts PDF documents to images
- **Usage:** `node scripts/pdf-to-images.js`
- **Status:** Active, used for document processing

### Testing Scripts

#### `test-db.js`
- **Purpose:** Tests database connectivity and basic operations
- **Usage:** `node scripts/test-db.js`
- **Status:** Active, useful for troubleshooting

#### `test-document-analysis.js`
- **Purpose:** Tests document analysis functionality
- **Usage:** `node scripts/test-document-analysis.js`
- **Status:** Active

#### `test-pdf-conversion.js`
- **Purpose:** Tests PDF conversion functionality
- **Usage:** `node scripts/test-pdf-conversion.js`
- **Status:** Active

#### `test-profile-query.js`
- **Purpose:** Tests profile query operations
- **Usage:** `node scripts/test-profile-query.js`
- **Status:** Active

#### `test-profiles-access.js`
- **Purpose:** Tests profile access and RLS policies
- **Usage:** `node scripts/test-profiles-access.js`
- **Status:** Active

#### `test-properties.js`
- **Purpose:** Tests property-related operations
- **Usage:** `node scripts/test-properties.js`
- **Status:** Active

#### `test-working-users.js`
- **Purpose:** Tests which users are working correctly
- **Usage:** `node scripts/test-working-users.js`
- **Status:** Active

#### `test-xai.js`
- **Purpose:** Tests XAI/Grok API integration
- **Usage:** `node scripts/test-xai.js`
- **Status:** Active

## Archived Scripts

The `_archived/` directory contains scripts that are no longer actively maintained:
- Old user creation scripts
- Deprecated seeding scripts
- Legacy fix scripts

These are kept for reference but should not be used for new deployments.

## Quick Start

### Initial Setup
```bash
# 1. Create test users
node scripts/seed-users.mjs

# 2. Seed properties for test users
node scripts/seed-test-user-properties.js

# 3. Verify setup
node scripts/check-users.js
```

### Troubleshooting
```bash
# Fix missing profiles
node scripts/ensure-profiles.js

# Fix RLS issues
node scripts/fix-profiles-rls.js

# Check schema
node scripts/check-schema.js
```

## Environment Variables

Most scripts require these environment variables (usually in `.env.local`):
- `VITE_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for admin operations)

## Notes

- All scripts should be run from the project root directory
- Test scripts are safe to run and won't modify data
- Seeding scripts will add/modify data - use with caution in production
- Fix scripts should be run when specific issues are encountered

