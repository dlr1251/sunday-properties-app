-- ============================================
-- QUICK FIX: Production Database Setup
-- ============================================
-- Run this in Supabase Dashboard > SQL Editor
-- This fixes missing columns, storage buckets, and RLS policies
-- ============================================

-- ============================================
-- 0. FIX PROFILES TABLE RLS POLICIES
-- ============================================

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable all access for service role" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;

-- Allow authenticated users to view ALL profiles (needed for user lists, chat, etc.)
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert profiles (for creating users)
CREATE POLICY "Admins can insert all profiles" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Service role bypass (for backend operations)
CREATE POLICY "Enable all access for service role" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 1. Add verification_status column to profiles if missing
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';
    
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_verification_status_check
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected', 'premium'));
    
    RAISE NOTICE 'Added verification_status column to profiles';
  ELSE
    RAISE NOTICE 'verification_status column already exists';
  END IF;
END $$;

-- 2. Create index on verification_status
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status 
ON public.profiles(verification_status);

-- 3. Create storage buckets
-- property-images (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images', 
  'property-images', 
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- property-docs (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', false)
ON CONFLICT (id) DO NOTHING;

-- profile-docs (private)  
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-docs', 'profile-docs', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for property-images (public read)
DROP POLICY IF EXISTS "Public read property-images" ON storage.objects;
CREATE POLICY "Public read property-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated upload property-images" ON storage.objects;
CREATE POLICY "Authenticated upload property-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated update property-images" ON storage.objects;
CREATE POLICY "Authenticated update property-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Authenticated delete property-images" ON storage.objects;
CREATE POLICY "Authenticated delete property-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

-- 5. Storage policies for property-docs (private)
DROP POLICY IF EXISTS "Authenticated upload property-docs" ON storage.objects;
CREATE POLICY "Authenticated upload property-docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-docs');

DROP POLICY IF EXISTS "Owner read property-docs" ON storage.objects;
CREATE POLICY "Owner read property-docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-docs' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'lawyer')
    )
  )
);

-- 6. Storage policies for profile-docs (private verification docs)
DROP POLICY IF EXISTS "User upload own profile-docs" ON storage.objects;
CREATE POLICY "User upload own profile-docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-docs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "User read own profile-docs" ON storage.objects;
CREATE POLICY "User read own profile-docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-docs' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  )
);

-- ============================================
-- 7. Verify setup
-- ============================================

SELECT 'RLS Policies on profiles:' as status;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

SELECT 'Storage buckets created:' as status;
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('property-images', 'property-docs', 'profile-docs');

SELECT 'Profiles table columns:' as status;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'verification_status';

SELECT '✅ Setup complete!' as result;
