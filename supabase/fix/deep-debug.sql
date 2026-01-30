-- ============================================
-- DEEP DEBUG - FIND THE EXACT PROBLEM
-- ============================================

-- Check auth.users structure
SELECT '=== AUTH.USERS COLUMNS ===' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for any views that reference auth.users
SELECT '=== VIEWS REFERENCING AUTH ===' as step;
SELECT schemaname, viewname 
FROM pg_views 
WHERE definition LIKE '%auth.users%' OR definition LIKE '%profiles%';

-- Check for any functions that might be called during auth
SELECT '=== ALL TRIGGERS ON AUTH.USERS ===' as step;
SELECT 
    t.tgname as trigger_name,
    t.tgenabled as enabled,
    p.proname as function_name,
    n.nspname as function_schema
FROM pg_trigger t
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE t.tgrelid = 'auth.users'::regclass;

-- Check if there are internal triggers
SELECT '=== INTERNAL AUTH TRIGGERS ===' as step;
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;

-- Check auth.identities table
SELECT '=== AUTH.IDENTITIES ===' as step;
SELECT COUNT(*) as identity_count FROM auth.identities;

-- Check if auth.users has required columns
SELECT '=== VERIFY AUTH.USERS HAS email COLUMN ===' as step;
SELECT id, email, created_at 
FROM auth.users 
WHERE email LIKE '%@sunday.com'
LIMIT 3;

-- Check for orphaned references
SELECT '=== PROFILES WITH MISSING AUTH.USERS ===' as step;
SELECT p.id, p.email 
FROM profiles p 
LEFT JOIN auth.users au ON p.id = au.id 
WHERE au.id IS NULL
LIMIT 5;

-- Check for broken constraints
SELECT '=== CONSTRAINTS ON PROFILES ===' as step;
SELECT 
    conname as constraint_name,
    contype as type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- Check if there are any invalid indexes
SELECT '=== INVALID INDEXES ===' as step;
SELECT indexrelid::regclass as index_name, indisvalid
FROM pg_index
WHERE NOT indisvalid;

-- Check for any materialized views that might be stale
SELECT '=== MATERIALIZED VIEWS ===' as step;
SELECT schemaname, matviewname 
FROM pg_matviews 
WHERE schemaname IN ('public', 'auth');

-- Try a simple query that auth might do
SELECT '=== SIMULATING AUTH QUERY ===' as step;
DO $$
DECLARE
    v_user RECORD;
BEGIN
    -- This simulates what Supabase auth does
    SELECT * INTO v_user 
    FROM auth.users 
    WHERE email = 'user1@sunday.com';
    
    IF v_user.id IS NOT NULL THEN
        RAISE NOTICE 'User found: id=%, email=%', v_user.id, v_user.email;
        RAISE NOTICE 'User meta: %', v_user.raw_user_meta_data;
    ELSE
        RAISE NOTICE 'User NOT found';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error querying auth.users: %', SQLERRM;
END $$;

-- Check for any scheduled jobs or cron that might interfere
SELECT '=== CRON JOBS ===' as step;
SELECT 'cron extension not installed' as info;

SELECT '
========================================
Check the output above for any errors.
Also check Supabase Dashboard > Logs
for the actual error message.
========================================
' as info;
