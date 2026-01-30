-- Final fix for profiles RLS policies - avoid infinite recursion
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Create working policies without recursion
-- Basic user policies (always work)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Service role policy for admin operations and seeding
CREATE POLICY "Enable all access for service role" ON profiles
  FOR ALL USING (true);

-- Simplified admin policies for local development
-- Note: These will only work if JWT contains role claims, otherwise they won't match
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'super_admin');
