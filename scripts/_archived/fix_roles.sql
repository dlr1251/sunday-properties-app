-- Fix the role constraint to allow all required roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('visitor', 'registered', 'verified', 'premium', 'lawyer', 'admin', 'super_admin'));
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'visitor';
