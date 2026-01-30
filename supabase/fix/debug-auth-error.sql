-- ============================================
-- DEBUG AUTH ERROR
-- ============================================
-- Run this to diagnose the auth schema error
-- ============================================

-- STEP 1: Check auth.users table
SELECT '=== AUTH.USERS TABLE ===' as step;
SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- STEP 2: Check if there are any triggers on auth.users
SELECT '=== TRIGGERS ON AUTH.USERS ===' as step;
SELECT 
    tgname as trigger_name,
    tgtype,
    tgenabled,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'auth.users'::regclass;

-- STEP 3: Check all functions in public schema that might affect auth
SELECT '=== FUNCTIONS THAT MIGHT AFFECT AUTH ===' as step;
SELECT 
    proname as function_name,
    prosecdef as security_definer
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace
AND (proname LIKE '%user%' OR proname LIKE '%auth%' OR proname LIKE '%profile%');

-- STEP 4: Check for any broken/invalid functions
SELECT '=== CHECKING FOR INVALID FUNCTIONS ===' as step;
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname = 'handle_new_user';

-- STEP 5: Test the handle_new_user function manually
SELECT '=== TESTING HANDLE_NEW_USER ===' as step;

-- STEP 6: Check auth schema hooks (skipped - table may not exist)
SELECT '=== AUTH HOOKS ===' as step;
SELECT 'auth.hooks table check skipped' as info;

-- STEP 7: Check for auth.config
SELECT '=== AUTH CONFIG ===' as step;
-- This might not work depending on permissions

-- STEP 8: Check profiles table structure
SELECT '=== PROFILES TABLE STRUCTURE ===' as step;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- STEP 9: Check if profiles.id references auth.users
SELECT '=== PROFILES FOREIGN KEYS ===' as step;
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'profiles' AND tc.constraint_type = 'FOREIGN KEY';

-- STEP 10: Check RLS on profiles
SELECT '=== PROFILES RLS STATUS ===' as step;
SELECT 
    relname,
    relrowsecurity as rls_enabled,
    relforcerowsecurity as rls_forced
FROM pg_class
WHERE relname = 'profiles';

SELECT '=== PROFILES POLICIES ===' as step;
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 11: Try to identify the exact error
SELECT '=== SIMULATING AUTH QUERY ===' as step;

-- This simulates what Supabase auth might be doing
DO $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
BEGIN
    -- Get a test user
    SELECT id INTO v_user_id FROM auth.users WHERE email LIKE '%@sunday.com' LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No test users found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing with user_id: %', v_user_id;
    
    -- Try to query profiles like auth would
    BEGIN
        SELECT * INTO v_profile FROM profiles WHERE id = v_user_id;
        RAISE NOTICE 'Profile query successful: %', v_profile.email;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Profile query failed: %', SQLERRM;
    END;
END $$;

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║                    DEBUG COMPLETE                                ║
║                                                                  ║
║  Review the output above to identify the issue.                  ║
║  Common causes of "Database error querying schema":              ║
║  1. Broken trigger on auth.users                                 ║
║  2. Invalid function referenced by a trigger                     ║
║  3. RLS policy that causes infinite recursion                    ║
║  4. Missing columns in profiles table                            ║
╚══════════════════════════════════════════════════════════════════╝
' as info;
