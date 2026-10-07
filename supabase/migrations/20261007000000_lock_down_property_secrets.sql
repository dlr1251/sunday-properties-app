-- =============================================================================
-- Lock down listing secrets from the public anon key and from random users
-- =============================================================================
-- DO NOT apply this to the live project until the matching frontend is deployed.
-- select('*') on public.properties will fail for anon after the REVOKE.
--
-- Safe order (same release):
--   1. Deploy the frontend in this PR to Vercel (explicit safe-column selects,
--      properties_private for owner/admin).
--   2. Confirm home, /properties, /properties/:slug, search, map, and share
--      still render.
--   3. Apply THIS file in the Supabase SQL editor of project prtyuwdkrrqhtwolcrav
--      (or `supabase db push` against that project). Do not run it from an
--      agent against production.
--   4. Verify with:
--        node scripts/verify-anon-cannot-read-owner-pii.mjs
--      Expect PASS: anon cannot read address or minimum_offer_price.
--
-- Why frontend and this SQL must ship together:
--   Live public queries use select('*'). After REVOKE, that request fails
--   for the whole row. The new bundle only asks for the granted columns.
--   Applying SQL first would 403 the live site; deploying the bundle first
--   without SQL still leaks address / minimum_offer_price through REST.
--
-- What this does:
--   Live had GRANT ALL on properties to anon, plus RLS
--   "Allow public access to published properties" USING (status = 'published')
--   and "Allow authenticated users to manage properties" USING (true).
--   Anyone with the anon key could read address, the confidential minimum
--   offer, precise coordinates, owner_id, and legal_documents.
--   After this migration, anon and a random authenticated user can SELECT
--   only public-safe columns. Owners and staff read secrets through
--   public.properties_private (SECURITY DEFINER view).
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_profile_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION private.current_profile_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_profile_role() TO authenticated;

-- Neighborhood-level pin (~1.1 km). Maps keep working without a street pin.
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS public_coordinates jsonb
  GENERATED ALWAYS AS (
    CASE
      WHEN (coordinates ? 'lat')
       AND (coordinates ? 'lng')
       AND ((coordinates->>'lat') ~ '^-?[0-9]+(\.[0-9]+)?$')
       AND ((coordinates->>'lng') ~ '^-?[0-9]+(\.[0-9]+)?$')
      THEN jsonb_build_object(
        'lat', round((coordinates->>'lat')::numeric, 2),
        'lng', round((coordinates->>'lng')::numeric, 2)
      )
      ELSE NULL
    END
  ) STORED;

-- ---------------------------------------------------------------------------
-- Column privileges
-- ---------------------------------------------------------------------------
-- Table-level SELECT includes every column. Revoke it, then grant the safe
-- list only. INSERT/UPDATE/DELETE stay on authenticated so owners can still
-- write address / minimum_offer_price / legal_documents on their own rows.
-- UPDATE still needs a SELECT policy on the row (see RLS below).

REVOKE ALL ON TABLE public.properties FROM anon;
REVOKE SELECT ON TABLE public.properties FROM authenticated;

GRANT SELECT (
  id,
  slug,
  title,
  description,
  neighborhood,
  city,
  public_coordinates,
  bedrooms,
  bathrooms,
  area,
  parking,
  floor,
  total_floors,
  year_built,
  property_type,
  strata,
  price,
  monthly_costs,
  accepts_crypto,
  financing,
  visit_price,
  status,
  verified,
  premium,
  images,
  virtual_tour,
  freedom_tradition,
  tags,
  features,
  created_at,
  updated_at,
  published_at,
  listing_type,
  rent_monthly,
  lease_term_months,
  deposit,
  admin_fee,
  utilities_included,
  pets_policy,
  nearby_places
) ON TABLE public.properties TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS: published listings stay readable; writes are owner/admin only
-- ---------------------------------------------------------------------------
-- The previous FOR ALL TO authenticated USING (true) let any signed-up user
-- read drafts and change every listing. Column grants stop them reading
-- address, but they could still UPDATE it. Close that.

DROP POLICY IF EXISTS "Allow public access to published properties" ON public.properties;
DROP POLICY IF EXISTS "Allow authenticated users to manage properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view published properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can manage their properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can select own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can insert own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can update own properties" ON public.properties;
DROP POLICY IF EXISTS "Owners can delete own properties" ON public.properties;

CREATE POLICY "Anyone can view published properties"
  ON public.properties
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Owners can select own properties"
  ON public.properties
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR agent_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin', 'lawyer')
  );

CREATE POLICY "Owners can insert own properties"
  ON public.properties
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Owners can update own properties"
  ON public.properties
  FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin')
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "Owners can delete own properties"
  ON public.properties
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin')
  );

-- ---------------------------------------------------------------------------
-- Owner / staff full-row read (column privileges are per-role, not per-row)
-- ---------------------------------------------------------------------------
-- authenticated cannot be GRANTed address without also giving it to every
-- signed-up user on published rows. This view runs as the owner (bypasses
-- column grants and RLS on properties) and filters to the caller.

CREATE OR REPLACE VIEW public.properties_private
WITH (security_invoker = false, security_barrier = true) AS
SELECT p.*
FROM public.properties p
WHERE
  auth.uid() IS NOT NULL
  AND (
    p.owner_id = auth.uid()
    OR p.agent_id = auth.uid()
    OR private.current_profile_role() IN ('admin', 'super_admin', 'lawyer')
  );

REVOKE ALL ON TABLE public.properties_private FROM PUBLIC;
REVOKE ALL ON TABLE public.properties_private FROM anon;
GRANT SELECT ON TABLE public.properties_private TO authenticated;

COMMENT ON VIEW public.properties_private IS
  'Full property rows for the owning user, assigned agent, or staff. Not available to anon.';

COMMENT ON COLUMN public.properties.public_coordinates IS
  'Neighborhood-level lat/lng (2 decimal degrees). Safe to expose on public listing queries.';
