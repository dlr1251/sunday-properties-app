-- Fix infinite recursion in profiles RLS policies
-- The issue is that admin policies are querying the profiles table within the policy,
-- causing infinite recursion

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Create simple, working policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Enable all access for service role (for seeding and admin operations)
CREATE POLICY "Enable all access for service role" ON profiles
  FOR ALL USING (true);

-- Admin policies (for users with admin roles to manage all profiles)
-- This avoids recursion by not querying the profiles table
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'super_admin'));
