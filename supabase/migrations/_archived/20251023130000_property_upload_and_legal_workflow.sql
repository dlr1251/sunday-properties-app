-- Property upload and legal workflow: columns, status values, storage buckets and policies

-- 1) Properties table: add negotiation_terms, legal_docs, review_notes
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS negotiation_terms JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS legal_docs JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- 2) Ensure status supports the required workflow values
DO $$
DECLARE
  chk_name text;
BEGIN
  SELECT conname INTO chk_name
  FROM pg_constraint
  WHERE conrelid = 'public.properties'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%CHECK%';

  IF chk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.properties DROP CONSTRAINT %I', chk_name);
  END IF;

  -- Add new constraint only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'properties_status_check'
  ) THEN
    ALTER TABLE public.properties
    ADD CONSTRAINT properties_status_check
    CHECK (status IN ('draft','submitted','approved','published','sold','rented','archived'));
  END IF;
END$$;

-- 3) Storage buckets: property-images (public), property-docs (private)
-- Create buckets if not exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'property-images','property-images', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property-images');

INSERT INTO storage.buckets (id, name, public)
SELECT 'property-docs','property-docs', false
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'property-docs');

-- 4) Storage policies
-- property-images: public read
DROP POLICY IF EXISTS "Public can read property images" ON storage.objects;
CREATE POLICY "Public can read property images"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- property-images: authenticated can insert/update/delete (dev-friendly)
DROP POLICY IF EXISTS "Authenticated can write property images" ON storage.objects;
CREATE POLICY "Authenticated can write property images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- property-docs: only owner (path prefix by auth.uid()) or lawyers/admins
-- SELECT
DROP POLICY IF EXISTS "Read property docs: owner or legal" ON storage.objects;
CREATE POLICY "Read property docs: owner or legal"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'property-docs' AND (
    -- Owner access by path prefix: {userId}/...
    position((auth.uid())::text || '/' in name) = 1
    OR (auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin')
  )
);

-- INSERT/UPDATE/DELETE: owner (path must start with auth.uid()) or admins
DROP POLICY IF EXISTS "Write property docs: owner or admin" ON storage.objects;
CREATE POLICY "Write property docs: owner or admin"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'property-docs' AND (
    position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt() ->> 'role') IN ('admin','super_admin')
  )
)
WITH CHECK (
  bucket_id = 'property-docs' AND (
    position((auth.uid())::text || '/' in name) = 1 OR (auth.jwt() ->> 'role') IN ('admin','super_admin')
  )
);

-- 5) RLS: allow owners to update their properties; lawyers/admins can update status
-- Owners: can insert and update their own rows (except publishing is enforced at app layer)
DROP POLICY IF EXISTS "Owners can insert properties" ON public.properties;
CREATE POLICY "Owners can insert properties"
ON public.properties FOR INSERT TO authenticated
WITH CHECK (auth.uid()::text = owner_id::text);

DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
CREATE POLICY "Owners can update own properties"
ON public.properties FOR UPDATE TO authenticated
USING (auth.uid()::text = owner_id::text)
WITH CHECK (auth.uid()::text = owner_id::text);

-- Lawyers/Admins: can update status and review fields
DROP POLICY IF EXISTS "Lawyers and admins can review properties" ON public.properties;
CREATE POLICY "Lawyers and admins can review properties"
ON public.properties FOR UPDATE TO authenticated
USING ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('lawyer','admin','super_admin'));


