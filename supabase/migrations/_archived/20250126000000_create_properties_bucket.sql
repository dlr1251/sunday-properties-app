-- Create the missing 'properties' bucket for PropertyUploadWizard
-- This bucket is used by the PropertyUploadWizard component

-- Create properties bucket (public for property images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'properties',
  'properties',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for properties bucket
-- Allow authenticated users to upload property images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'properties');

-- Allow public to view property images (for property listings)
CREATE POLICY "Public can view property images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'properties');

-- Allow authenticated users to update their property images
CREATE POLICY "Authenticated users can update property images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'properties');

-- Allow authenticated users to delete property images
CREATE POLICY "Authenticated users can delete property images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'properties');
