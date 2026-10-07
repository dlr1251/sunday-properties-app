-- =============================================================================
-- Migration B (revokes): lock down listing secrets
-- =============================================================================
-- DO NOT apply this until:
--   1. 20261006120000_add_public_coordinates.sql is applied (additive;
--      safe before the frontend deploy), AND
--   2. the matching frontend is deployed (explicit safe-column selects,
--      properties_private for owner/admin).
--
-- Release order:
--   A.  20261006120000_add_public_coordinates.sql — APPLIED in production.
--   A2. 20261006130000_area_numeric.sql — area integer → numeric(8,2);
--       no grant or row-value changes. Apply before this file.
--   B.  Deploy this frontend to Vercel. Confirm home, /properties,
--       /properties/:slug, search, map, and share still render.
--   C.  Apply THIS file in the Supabase SQL editor of project prtyuwdkrrqhtwolcrav
--       (or `supabase db push` against that project). Do not run it from an
--       agent against production.
--   D.  Verify with:
--         node scripts/verify-anon-cannot-read-owner-pii.mjs
--       Expect PASS: anon cannot read address, minimum_offer_price, or deposit.
--
-- Applying THIS file first 403s live select('*'). Deploying the bundle
-- without A 400s public_coordinates. Deploying the bundle without THIS
-- file still leaks address / minimum_offer_price / deposit through REST.
--
-- What this does:
--   Live had GRANT ALL on properties to anon, plus RLS
--   "Allow public access to published properties" USING (status = 'published')
--   and "Allow authenticated users to manage properties" USING (true).
--   Anyone with the anon key could read address, the confidential minimum
--   offer, precise coordinates, owner_id, legal_documents, and deposit.
--   Deposit is withheld from the public column list: Ley 820 art. 16
--   forbids requiring a deposit on Colombian urban housing leases.
--   After this migration, anon and a random authenticated user can SELECT
--   only public-safe columns. Owners and staff read secrets through
--   public.properties_private (SECURITY DEFINER view).
--   Policies on profiles and property_visit_availability that joined
--   properties.owner_id / agent_id go through private.property_owner_id
--   and private.is_agent_for_owner.
--   Per-person listing counts go through public.property_counts_by_owner
--   (admin/super_admin or the owner themselves). PostgREST embeds through
--   properties.owner_id fail after the column REVOKE.
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
REVOKE ALL ON FUNCTION private.current_profile_role() FROM anon;
GRANT EXECUTE ON FUNCTION private.current_profile_role() TO authenticated;

-- Invoker policies on other tables cannot SELECT properties.owner_id /
-- agent_id after the column REVOKE. These helpers run as the owner.
CREATE OR REPLACE FUNCTION private.property_owner_id(p_property_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT owner_id FROM public.properties WHERE id = p_property_id;
$$;

CREATE OR REPLACE FUNCTION private.is_agent_for_owner(p_owner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE agent_id = auth.uid()
      AND owner_id = p_owner_id
  );
$$;

REVOKE ALL ON FUNCTION private.property_owner_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.property_owner_id(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.property_owner_id(uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.is_agent_for_owner(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_agent_for_owner(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.is_agent_for_owner(uuid) TO authenticated;

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

-- ---------------------------------------------------------------------------
-- Per-person listing counts (PostgREST owner_id embeds fail after REVOKE)
-- ---------------------------------------------------------------------------
-- Restricted to admin / super_admin or the owner themselves. Lawyer is not
-- included: they already read their assigned rows through properties_private.

CREATE OR REPLACE FUNCTION public.property_counts_by_owner(owner_ids uuid[])
RETURNS TABLE(owner_id uuid, total bigint, published bigint, sold bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.owner_id,
    COUNT(*)::bigint AS total,
    COUNT(*) FILTER (WHERE p.status = 'published')::bigint AS published,
    COUNT(*) FILTER (WHERE p.status = 'sold')::bigint AS sold
  FROM public.properties p
  WHERE p.owner_id = ANY (owner_ids)
    AND (
      p.owner_id = auth.uid()
      OR private.current_profile_role() IN ('admin', 'super_admin')
    )
  GROUP BY p.owner_id;
$$;

REVOKE ALL ON FUNCTION public.property_counts_by_owner(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.property_counts_by_owner(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.property_counts_by_owner(uuid[]) TO authenticated;

COMMENT ON FUNCTION public.property_counts_by_owner(uuid[]) IS
  'Listing counts per owner_id. Callers see only their own row, or every requested owner if they are admin/super_admin.';

-- ---------------------------------------------------------------------------
-- Invoker policies that read properties.owner_id / agent_id
-- ---------------------------------------------------------------------------
-- Live audit (pg_policy): only these two policies join properties for
-- protected columns. Storage policies do not. Same-table RLS on
-- properties (owner_id = auth.uid()) does not need a helper.

DROP POLICY IF EXISTS "Participants can read counterpart profiles" ON public.profiles;
CREATE POLICY "Participants can read counterpart profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE auth.uid() = ANY (c.participants)
        AND profiles.id = ANY (c.participants)
    )
    OR EXISTS (
      SELECT 1
      FROM public.negotiations n
      WHERE (
          auth.uid() IN (n.buyer_id, n.seller_id, n.lawyer_id, n.agent_id)
          OR auth.uid() = ANY (n.participants)
        )
        AND profiles.id IN (n.buyer_id, n.seller_id, n.lawyer_id, n.agent_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.visits v
      WHERE (v.visitor_id = auth.uid() AND private.property_owner_id(v.property_id) = profiles.id)
         OR (private.property_owner_id(v.property_id) = auth.uid() AND v.visitor_id = profiles.id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.offers o
      WHERE (o.buyer_id = auth.uid() AND private.property_owner_id(o.property_id) = profiles.id)
         OR (private.property_owner_id(o.property_id) = auth.uid() AND o.buyer_id = profiles.id)
         OR (o.buyer_id = auth.uid() AND o.seller_id = profiles.id)
         OR (o.seller_id = auth.uid() AND o.buyer_id = profiles.id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE auth.uid() IN (c.buyer_id, c.seller_id, c.lawyer_id)
        AND profiles.id IN (c.buyer_id, c.seller_id, c.lawyer_id)
    )
    OR private.is_agent_for_owner(profiles.id)
  );

DROP POLICY IF EXISTS "Owners can manage their property availability" ON public.property_visit_availability;
CREATE POLICY "Owners can manage their property availability"
  ON public.property_visit_availability
  FOR ALL
  TO authenticated
  USING (private.property_owner_id(property_id) = auth.uid())
  WITH CHECK (private.property_owner_id(property_id) = auth.uid());

-- Unused SELECT * INTO property failed after REVOKE (column privileges
-- apply to invoker functions). The row was never read.
CREATE OR REPLACE FUNCTION public.get_offer_net_efficiency_index(p_offer_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
    offer RECORD;
    net_value DECIMAL;
    closing_days INTEGER;
    efficiency_index DECIMAL;
BEGIN
    SELECT * INTO offer FROM offers WHERE id = p_offer_id;

    net_value := offer.price * 0.95;
    closing_days := EXTRACT(DAYS FROM (offer.closing_date - CURRENT_DATE));

    IF closing_days > 0 THEN
        efficiency_index := net_value / closing_days;
    ELSE
        efficiency_index := 0;
    END IF;

    RETURN efficiency_index;
END;
$$;
