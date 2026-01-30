#!/bin/bash
# ============================================
# RESET AND SEED - Full Database Reset for Testing
# ============================================
# This script resets the local database, applies migrations, and seeds with test data
# Perfect for rapid development and testing iterations
# Usage: ./scripts/reset-and-seed.sh

set -e  # Exit on any error

echo "🔄 Starting full database reset and seeding..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must be run from the project root directory"
    exit 1
fi

echo "1️⃣ Resetting local database..."
if ! supabase db reset --local; then
    echo "❌ Error: Failed to reset database"
    exit 1
fi

echo "2️⃣ Creating auth users via API..."
if ! node scripts/seed-users.mjs; then
    echo "❌ Error: Failed to create auth users"
    exit 1
fi

echo "3️⃣ Applying consolidated migrations..."
if ! supabase migration up --local; then
    echo "❌ Error: Failed to apply migrations"
    exit 1
fi

echo "4️⃣ Seeding with local test data..."
if ! psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -f supabase/seeds/seed-local.sql; then
    echo "❌ Error: Failed to seed database"
    exit 1
fi

echo "5️⃣ Seeding with negotiation test data..."
if [ -f "supabase/seeds/seed-negotiation-test-data.sql" ]; then
    if ! psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -f supabase/seeds/seed-negotiation-test-data.sql; then
        echo "❌ Error: Failed to seed negotiation test data"
        exit 1
    fi
else
    echo "⚠️  Warning: seed-negotiation-test-data.sql not found, skipping..."
fi

echo "✅ Database reset and seeding complete!"
echo ""
echo "📊 Database status:"
psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -c "
SELECT
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM public.profiles) as profiles_count,
  (SELECT COUNT(*) FROM public.properties) as properties_count,
  (SELECT COUNT(*) FROM public.negotiations) as negotiations_count,
  (SELECT COUNT(*) FROM public.offers) as offers_count;
" 2>/dev/null || echo "⚠️  Could not get database stats (might be expected)"

echo ""
echo "🚀 Ready for testing! Run 'npm run dev' to start the frontend."
echo "💡 Tip: Use 'npm run db:reset-seed' for quick resets during development."
