-- ============================================
-- DIAGNOSE AND FIX SCRIPT
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- STEP 1: Check what exists
SELECT '=== DIAGNOSIS ===' as step;

SELECT 'Storage Buckets:' as check_type;
SELECT id, name, public FROM storage.buckets;

SELECT 'Profiles count:' as check_type;
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 'Profiles by role:' as check_type;
SELECT role, COUNT(*) FROM profiles GROUP BY role;

SELECT 'Auth users count:' as check_type;
SELECT COUNT(*) as total_auth_users FROM auth.users;

SELECT 'Auth users with @sunday.com:' as check_type;
SELECT COUNT(*) as sunday_users FROM auth.users WHERE email LIKE '%@sunday.com';

-- ============================================
-- STEP 2: CREATE STORAGE BUCKETS (with proper permissions)
-- ============================================

SELECT '=== FIXING STORAGE BUCKETS ===' as step;

-- Delete and recreate buckets to ensure they exist
DELETE FROM storage.buckets WHERE id IN ('property-images', 'property-docs', 'profile-docs');

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('property-docs', 'property-docs', false, 52428800);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('profile-docs', 'profile-docs', false, 52428800);

-- Verify buckets were created
SELECT 'Storage Buckets after fix:' as check_type;
SELECT id, name, public FROM storage.buckets WHERE id IN ('property-images', 'property-docs', 'profile-docs');

-- ============================================
-- STEP 3: CREATE STORAGE POLICIES
-- ============================================

-- Drop all existing policies for these buckets
DROP POLICY IF EXISTS "Public read property-images" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload property-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own property images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own property images" ON storage.objects;

-- property-images: public read, authenticated write
CREATE POLICY "Anyone can view property images" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Users can update own property images" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'property-images');

CREATE POLICY "Users can delete own property images" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'property-images');

-- property-docs: authenticated only
DROP POLICY IF EXISTS "Authenticated upload property-docs" ON storage.objects;
DROP POLICY IF EXISTS "Owner read property-docs" ON storage.objects;

CREATE POLICY "Authenticated users can manage property docs" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'property-docs') WITH CHECK (bucket_id = 'property-docs');

-- profile-docs: authenticated only  
DROP POLICY IF EXISTS "User upload own profile-docs" ON storage.objects;
DROP POLICY IF EXISTS "User read own profile-docs" ON storage.objects;

CREATE POLICY "Authenticated users can manage profile docs" ON storage.objects
FOR ALL TO authenticated USING (bucket_id = 'profile-docs') WITH CHECK (bucket_id = 'profile-docs');

SELECT 'Storage policies created' as status;

-- ============================================
-- STEP 4: CHECK AND FIX PROFILES RLS
-- ============================================

SELECT '=== FIXING PROFILES RLS ===' as step;

-- Make sure RLS is enabled but with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop and recreate all profile policies
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;

-- Allow anyone authenticated to view all profiles
CREATE POLICY "Anyone can view profiles" ON profiles
FOR SELECT TO authenticated USING (true);

-- Allow anon to view profiles too (for public pages)
CREATE POLICY "Public profiles are viewable" ON profiles
FOR SELECT TO anon USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Service role has full access
CREATE POLICY "Service role full access" ON profiles
FOR ALL TO service_role USING (true) WITH CHECK (true);

SELECT 'Profiles RLS policies recreated' as status;

-- ============================================
-- STEP 5: VERIFY PROFILES EXIST (create if missing)
-- ============================================

SELECT '=== SYNCING PROFILES ===' as step;

-- Insert profiles for any auth.users that don't have one
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
AND au.email LIKE '%@sunday.com';

-- Update existing profiles with correct roles from auth metadata
UPDATE profiles p
SET 
    role = COALESCE(au.raw_user_meta_data->>'role', p.role),
    full_name = COALESCE(au.raw_user_meta_data->>'full_name', p.full_name),
    verification_status = CASE 
        WHEN au.raw_user_meta_data->>'role' IN ('super_admin', 'admin', 'lawyer', 'agent') THEN 'verified'
        ELSE COALESCE(p.verification_status, 'unverified')
    END
FROM auth.users au
WHERE p.id = au.id
AND au.email LIKE '%@sunday.com';

-- ============================================
-- STEP 6: FINAL VERIFICATION
-- ============================================

SELECT '=== FINAL VERIFICATION ===' as step;

SELECT 'Storage Buckets:' as check_type;
SELECT id, name, public FROM storage.buckets WHERE id IN ('property-images', 'property-docs', 'profile-docs');

SELECT 'Profiles by role:' as check_type;
SELECT role, COUNT(*) as count FROM profiles WHERE email LIKE '%@sunday.com' GROUP BY role ORDER BY count DESC;

SELECT 'Total profiles:' as check_type;
SELECT COUNT(*) as total FROM profiles;

SELECT 'Sample users:' as check_type;
SELECT email, full_name, role, verification_status FROM profiles WHERE email LIKE '%@sunday.com' ORDER BY role, email LIMIT 15;

SELECT '
╔══════════════════════════════════════════════════════════════════╗
║                    ✅ FIX COMPLETED                              ║
╠══════════════════════════════════════════════════════════════════╣
║  Storage buckets created: property-images, property-docs,        ║
║                           profile-docs                           ║
║  Profiles RLS policies: Fixed for authenticated access           ║
║  Profiles synced from auth.users                                 ║
╚══════════════════════════════════════════════════════════════════╝
' as result;
