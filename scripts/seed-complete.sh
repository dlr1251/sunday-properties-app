#!/bin/bash
# ============================================
# SEED COMPLETE - Full Seeding Script
# ============================================
# This script creates auth users and seeds the database with test data
# Run after migrations are applied: supabase migration up
# Usage: ./scripts/seed-complete.sh

set -e  # Exit on any error

echo "🌱 Starting complete seeding process..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must be run from the project root directory"
    exit 1
fi

# Check if seed-local.sql exists
if [ ! -f "supabase/seeds/seed-local.sql" ]; then
    echo "❌ Error: supabase/seeds/seed-local.sql not found"
    exit 1
fi

echo "1️⃣ Creating auth users via API..."
if ! node scripts/seed-users.mjs; then
    echo "❌ Error: Failed to create auth users"
    exit 1
fi

echo "2️⃣ Seeding database with local test data..."
if ! psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -f supabase/seeds/seed-local.sql; then
    echo "❌ Error: Failed to seed database"
    exit 1
fi

echo "✅ Seeding complete!"
echo ""
echo "📊 Database status:"
psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -c "
SELECT
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.properties) as properties_count,
  (SELECT COUNT(*) FROM public.negotiations) as negotiations_count;
" 2>/dev/null || echo "⚠️  Could not get database stats (might be expected if tables don't exist yet)"

echo ""
echo "🚀 Ready for testing! Run 'npm run dev' to start the frontend."
