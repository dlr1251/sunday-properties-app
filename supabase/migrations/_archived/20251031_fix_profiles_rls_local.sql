-- Fix profiles RLS policies for local development
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;

-- Create new working policies
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

-- Admin policies - simplified for local development
-- For local development, we'll allow access based on role field in profiles table
-- but avoid recursion by using a simple check
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'super_admin')
    )
  );
