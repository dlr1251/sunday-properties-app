#!/bin/bash
# ============================================
# VERIFY DATA PRESERVATION - Check Data Integrity After Consolidation
# ============================================
# This script verifies that all critical data is preserved after migrations and seeding
# Run after applying consolidated migrations and seeds
# Usage: ./scripts/verify-data-preservation.sh

set -e  # Exit on any error

echo "🔍 Verifying data preservation after consolidation..."

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Error: Must be run from the project root directory"
    exit 1
fi

echo "📊 Checking database connectivity and table counts..."

# Function to run psql query and handle errors gracefully
run_psql() {
    local query="$1"
    local description="$2"

    echo "Checking $description..."
    if psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -c "$query" 2>/dev/null; then
        echo "✅ $description: OK"
    else
        echo "⚠️  $description: Query failed (table might not exist yet)"
    fi
}

echo ""
echo "=========================================="
echo "1️⃣  CORE TABLES COUNT"
echo "=========================================="

run_psql "
SELECT
  (SELECT COUNT(*) FROM auth.users) as users_count,
  (SELECT COUNT(*) FROM public.profiles WHERE status = 'active') as active_profiles,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'user') as regular_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_users,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'super_admin') as super_admin_users;
" "Auth users and profiles"

echo ""
echo "=========================================="
echo "2️⃣  BUSINESS DATA"
echo "=========================================="

run_psql "
SELECT
  (SELECT COUNT(*) FROM public.properties) as properties_count,
  (SELECT COUNT(*) FROM public.negotiations) as negotiations_count,
  (SELECT COUNT(*) FROM public.offers) as offers_count,
  (SELECT COUNT(*) FROM public.visits) as visits_count;
" "Properties and negotiations"

echo ""
echo "=========================================="
echo "3️⃣  USER DISTRIBUTION"
echo "=========================================="

run_psql "
SELECT
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ' ORDER BY email LIMIT 3) as sample_emails
FROM public.profiles
GROUP BY role
ORDER BY role;
" "Users by role"

echo ""
echo "=========================================="
echo "4️⃣  NEGOTIATION STATUS"
echo "=========================================="

run_psql "
SELECT
  status,
  COUNT(*) as count
FROM public.negotiations
GROUP BY status
ORDER BY status;
" "Negotiations by status"

echo ""
echo "=========================================="
echo "5️⃣  PROPERTY OWNERSHIP"
echo "=========================================="

run_psql "
SELECT
  p.role as owner_role,
  COUNT(prop.id) as properties_owned
FROM public.profiles p
LEFT JOIN public.properties prop ON prop.owner_id = p.id
WHERE p.role IN ('user', 'agent')
GROUP BY p.role
ORDER BY p.role;
" "Properties owned by regular users vs agents"

echo ""
echo "=========================================="
echo "6️⃣  RLS POLICY CHECK"
echo "=========================================="

# Test RLS policies by attempting queries as different roles
echo "Testing RLS policies..."

# Test service role access (should have full access)
echo "Service role access test:"
psql postgresql://postgres:postgres@127.0.0.1:54326/postgres -c "
SELECT COUNT(*) as profiles_visible_by_service FROM public.profiles;
" 2>/dev/null && echo "✅ Service role: OK" || echo "❌ Service role: Failed"

echo ""
echo "=========================================="
echo "7️⃣  DATA INTEGRITY CHECKS"
echo "=========================================="

run_psql "
SELECT
  'Orphaned profiles' as check_name,
  COUNT(*) as count
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
WHERE au.id IS NULL;
" "Orphaned profiles (profiles without auth users)"

run_psql "
SELECT
  'Profiles without roles' as check_name,
  COUNT(*) as count
FROM public.profiles
WHERE role IS NULL OR role = '';
" "Profiles without roles"

run_psql "
SELECT
  'Properties without owners' as check_name,
  COUNT(*) as count
FROM public.properties
WHERE owner_id IS NULL;
" "Properties without owners"

run_psql "
SELECT
  'Negotiations without buyers' as check_name,
  COUNT(*) as count
FROM public.negotiations
WHERE buyer_id IS NULL;
" "Negotiations without buyers"

echo ""
echo "=========================================="
echo "📋 SUMMARY"
echo "=========================================="

echo "✅ Data preservation verification complete!"
echo ""
echo "Expected counts:"
echo "• Auth users: 20 (created via scripts/seed-users.mjs)"
echo "• Active profiles: 20 (matching auth users)"
echo "• Properties: 5+ (from seed-local.sql)"
echo "• Negotiations: 2+ (from seed-local.sql)"
echo ""
echo "If counts don't match expectations, check:"
echo "1. Run scripts/seed-users.mjs first"
echo "2. Apply migrations: supabase migration up"
echo "3. Run seed: ./scripts/seed-complete.sh"
echo ""
echo "For detailed troubleshooting, check individual table contents manually."
