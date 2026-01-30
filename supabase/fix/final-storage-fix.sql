-- ============================================
-- FINAL STORAGE BUCKETS FIX
-- ============================================

-- Check current buckets
SELECT 'Current buckets:' as info;
SELECT id, name, public FROM storage.buckets;

-- Force create/update buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('property-images', 'property-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']),
    ('property-docs', 'property-docs', false, 52428800, NULL),
    ('profile-docs', 'profile-docs', false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit;

-- Verify buckets exist
SELECT 'Buckets after fix:' as info;
SELECT id, name, public FROM storage.buckets WHERE id IN ('property-images', 'property-docs', 'profile-docs');

-- Create storage policies
DROP POLICY IF EXISTS "storage_public_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_insert" ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_auth_delete" ON storage.objects;

CREATE POLICY "storage_public_select" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "storage_auth_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "storage_auth_update" ON storage.objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "storage_auth_delete" ON storage.objects FOR DELETE TO authenticated USING (true);

SELECT '✅ Storage buckets created!' as result;
