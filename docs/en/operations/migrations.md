# Migrations

Supabase migrations and seed data.

## Structure

Migrations live in `supabase/migrations/`. Names use a numeric prefix for order (e.g. `20240101000000_01_base_schema.sql`). Consolidated migrations cover schema, RLS, functions, triggers, indexes, etc.

## Basic commands

```bash
# Local Supabase
supabase start
supabase db reset --local    # Apply migrations and seed
supabase db push --local     # Migrations only

# Linked remote project
supabase link --project-ref YOUR_REF
supabase db push             # Apply migrations to remote
```

## Seeds

Initial data (test users, properties, etc.) is loaded via scripts or SQL in `supabase/seeds/` and `scripts/` (e.g. `seed-users.mjs`, `seed-complete.sh`).

```bash
npm run db:reset-seed        # Reset + migrations + seed (local)
./scripts/seed-complete.sh   # Full seed
```

## Create a new migration

```bash
supabase migration new descriptive_name
```

A file is created in `migrations/`. Edit the SQL, then run `supabase db reset --local` or `db push` to apply.

## Good practices

- Do not modify migrations already applied in production. Add a new migration for changes.
- Ensure RLS and policies still meet security requirements.
- Test locally before running `db push` to the remote.

## Related

- [Database — Schema](../reference/database/schema)
- [Quick Start](../guide/quick-start)
- [Deployment](deployment)
