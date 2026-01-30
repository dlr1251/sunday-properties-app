-- Finalize user role and verification status structure
-- This migration consolidates all role and verification status fixes
-- Roles: user, agent, lawyer, admin, super_admin
-- Verification statuses: unverified, pending, verified, rejected, premium

-- Fix role constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'agent', 'lawyer', 'admin', 'super_admin'));

ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Fix verification_status constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_verification_status_check
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'premium'));

-- Update any existing invalid roles
UPDATE profiles 
SET role = CASE
  WHEN role IN ('visitor', 'registered', 'verified') THEN 'user'
  WHEN role = 'premium' THEN 'agent'
  ELSE role
END
WHERE role NOT IN ('user', 'agent', 'lawyer', 'admin', 'super_admin');

-- Helper function to fix test user profiles (for seeding)
CREATE OR REPLACE FUNCTION fix_test_user_profiles()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    role = CASE
      WHEN email = 'superadmin@sunday.local' THEN 'super_admin'
      WHEN email IN ('admin@sunday.local', 'admin1@sunday.local', 'admin2@sunday.local') THEN 'admin'
      WHEN email LIKE 'lawyer%' AND email LIKE '%@sunday.local' THEN 'lawyer'
      WHEN email LIKE 'agent%' AND email LIKE '%@sunday.local' THEN 'agent'
      WHEN email LIKE 'user%' AND email LIKE '%@sunday.local' THEN 'user'
      ELSE 'user'
    END,
    updated_at = NOW()
  WHERE email LIKE '%@sunday.local';
END;
$$ LANGUAGE plpgsql;
