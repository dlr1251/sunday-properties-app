-- ============================================
-- DISABLE ALL AUTH TRIGGERS
-- ============================================
-- This completely disables triggers that might be causing auth errors
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- STEP 1: Drop ALL triggers on auth.users
DO $$
DECLARE
    trigger_rec RECORD;
BEGIN
    FOR trigger_rec IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'auth.users'::regclass
        AND tgisinternal = false
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trigger_rec.tgname);
        RAISE NOTICE 'Dropped trigger: %', trigger_rec.tgname;
    END LOOP;
END $$;

-- STEP 2: Drop the handle_new_user function completely
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 3: Ensure profiles exist for all auth users (manual sync)
INSERT INTO profiles (id, email, full_name, role, status, verification_status)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'user'),
    'active',
    CASE 
        WHEN au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'lawyer', 'agent') THEN 'verified'
        ELSE 'unverified'
    END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- STEP 4: Verify no triggers remain
SELECT 'Remaining triggers on auth.users:' as check_type;
SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass AND tgisinternal = false;

-- STEP 5: Verify profiles exist
SELECT 'Profiles synced:' as check_type;
SELECT COUNT(*) as profile_count FROM profiles;
SELECT email, role FROM profiles WHERE email LIKE '%@sunday.com' LIMIT 10;

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║          ✅ AUTH TRIGGERS DISABLED                               ║
╠══════════════════════════════════════════════════════════════════╣
║  All triggers on auth.users have been removed.                   ║
║  The handle_new_user function has been dropped.                  ║
║  Existing profiles have been synced.                             ║
║                                                                  ║
║  TRY LOGGING IN NOW!                                             ║
║                                                                  ║
║  Note: New user signups wont auto-create profiles.              ║
║  Well need to recreate the trigger once auth works.             ║
╚══════════════════════════════════════════════════════════════════╝
' as result;
