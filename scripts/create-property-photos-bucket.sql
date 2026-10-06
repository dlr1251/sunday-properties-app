-- Crear bucket property-photos para fotos de propiedades
-- Ejecutar en Supabase Dashboard > SQL Editor, o: supabase db execute -f scripts/create-property-photos-bucket.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-photos', 'property-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Políticas RLS para property-photos
DROP POLICY IF EXISTS "Authenticated users can upload property photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property photos" ON storage.objects;
DROP POLICY IF EXISTS "Property owners can delete their photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload property photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Public can view property photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-photos');

CREATE POLICY "Authenticated users can delete property photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'property-photos');
