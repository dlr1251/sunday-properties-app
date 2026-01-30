-- ============================================
-- FIX AUTH SCHEMA ERRORS
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- STEP 1: Check current state
SELECT '=== DIAGNOSIS ===' as step;

SELECT 'Auth users count:' as info, COUNT(*) as count FROM auth.users;
SELECT 'Profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Auth users without profiles:' as info, COUNT(*) as count 
FROM auth.users au 
LEFT JOIN profiles p ON p.id = au.id 
WHERE p.id IS NULL;

-- STEP 2: Fix the handle_new_user function
-- This function creates a profile when a new user signs up
SELECT '=== FIXING HANDLE_NEW_USER FUNCTION ===' as step;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, status, verification_status)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        'active',
        'unverified'
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(profiles.full_name, EXCLUDED.full_name),
        updated_at = NOW();
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth
        RAISE WARNING 'handle_new_user error: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'handle_new_user function updated' as status;

-- STEP 3: Ensure all auth users have profiles
SELECT '=== CREATING MISSING PROFILES ===' as step;

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
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = au.id);

SELECT 'Missing profiles created' as status;

-- STEP 4: Grant necessary permissions
SELECT '=== FIXING PERMISSIONS ===' as step;

-- Grant execute on function to authenticated users
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;

-- Ensure profiles table has correct grants
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;
GRANT INSERT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;

SELECT 'Permissions granted' as status;

-- STEP 5: Check for any broken triggers or functions
SELECT '=== CHECKING TRIGGERS ===' as step;

SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'profiles'::regclass 
   OR tgrelid = 'auth.users'::regclass;

-- STEP 6: Verify the fix
SELECT '=== FINAL VERIFICATION ===' as step;

SELECT 'Profiles by role:' as info;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role ORDER BY count DESC;

SELECT 'Sample profiles:' as info;
SELECT id, email, full_name, role, verification_status FROM profiles LIMIT 10;

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║                 ✅ AUTH SCHEMA FIX COMPLETED                     ║
╠══════════════════════════════════════════════════════════════════╣
║  - handle_new_user function recreated with error handling        ║
║  - Missing profiles created                                      ║
║  - Permissions granted                                           ║
║                                                                  ║
║  Try logging in again!                                           ║
╚══════════════════════════════════════════════════════════════════╝
' as result;
