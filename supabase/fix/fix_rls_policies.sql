-- Fix infinite recursion in profiles RLS policies
-- This script completely resets the RLS policies to prevent circular dependencies

-- Step 1: Disable RLS temporarily to avoid conflicts during policy changes
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Step 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create simple, non-recursive policies
-- Basic user policies (no admin checks to avoid recursion)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Create admin policies that check user metadata instead of querying profiles table
-- This avoids the circular dependency issue
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
  );

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.jwt() ->> 'role' = 'super_admin'
  );

-- Step 6: Sync existing profile roles to auth.users.app_metadata
-- This ensures JWT claims are populated for existing users
UPDATE auth.users au
SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
FROM profiles p
WHERE au.id = p.id AND p.role IS NOT NULL
AND (au.raw_app_meta_data->>'role' IS NULL OR au.raw_app_meta_data->>'role' != p.role);

-- Verification: Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
