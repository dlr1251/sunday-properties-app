-- Property Storage Buckets
-- Create storage buckets for property media and documents

-- Create property-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create property-videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-videos', 'property-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create property-docs bucket (private for legal documents)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-docs', 'property-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Create profile-docs bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-docs', 'profile-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for property-photos bucket (public thumbnails, authenticated upload)
-- Allow authenticated users to upload property photos
CREATE POLICY "Authenticated users can upload property photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

-- Allow public to view property photos (for thumbnails)
CREATE POLICY "Public can view property photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-photos');

-- Allow property owners to delete their own photos
CREATE POLICY "Property owners can delete their photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for property-videos bucket (authenticated only)
CREATE POLICY "Authenticated users can upload property videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-videos');

-- Allow property owners and admins to view videos
CREATE POLICY "Property owners and admins can view videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-videos'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
      )
    )
  );

-- Allow property owners to delete their videos
CREATE POLICY "Property owners can delete their videos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-videos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for property-docs bucket (private legal documents)
CREATE POLICY "Property owners can upload legal documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-docs');

-- Allow property owners, lawyers, and admins to view legal documents
CREATE POLICY "Authorized users can view legal documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'property-docs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin', 'lawyer')
      )
    )
  );

-- Allow property owners to delete their documents
CREATE POLICY "Property owners can delete their documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- RLS Policies for profile-docs bucket (verification documents)
CREATE POLICY "Users can upload verification documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-docs');

-- Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow admins and lawyers to view verification documents for review
CREATE POLICY "Admins and lawyers can review verification documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-docs'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'lawyer')
    )
  );

-- Allow users to delete their own verification documents
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-docs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Comments removed due to storage.objects ownership restrictions
