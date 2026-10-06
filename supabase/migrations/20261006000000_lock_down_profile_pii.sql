-- =============================================================================
-- Lock down owner/profile PII from the public anon key
-- =============================================================================
-- DO NOT apply this to the live project until the frontend that stops embedding
-- owner(full_name, email, phone) on public listing queries is deployed.
--
-- Safe order:
--   1. Deploy the matching frontend (this PR) to Vercel.
--   2. Confirm /properties and /properties/:slug still render.
--   3. Apply THIS file in the Supabase SQL editor of project prtyuwdkrrqhtwolcrav
--      (or `supabase db push` against that project). Do not run it from this
--      agent against production.
--   4. Verify with:
--        curl -sS "$SUPABASE_URL/rest/v1/profiles?select=id,email,full_name,phone" \
--          -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--      Expect [] (no rows). A request that selects email/phone/full_name as anon
--      should fail with a permission error after the REVOKE.
--      Also:
--        curl -sS "$SUPABASE_URL/rest/v1/properties?select=slug,owner:owner_id(email)&status=eq.published" \
--          -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--      Expect each listing's owner to be null, with no emails.
--
-- Why this can wait until after the frontend deploy:
--   The live site currently selects owner(full_name, email, phone). Dropping
--   the open SELECT policy alone would return owner: null and keep listings
--   working. REVOKE of those columns from anon, however, makes that same
--   select fail the whole /properties request. Deploy the frontend first so
--   the live bundle no longer asks for those columns.
--
-- What this does:
--   Live had policy profiles_select_all USING (true) plus GRANT SELECT on
--   email/phone/full_name to anon. That let any visitor read every profile,
--   including via GET /rest/v1/properties?select=...,owner:owner_id(email).
--   After this migration, anon has no profile rows and no PII column grants.
--   Authenticated users still read their own profile, staff (admin,
--   super_admin, lawyer, agent) can read profiles, and counterparties in
--   conversations / negotiations / visits / offers / cases can read each other.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

-- Reads profiles.role without hitting profiles RLS (avoids recursion).
-- Role is stored on profiles; production JWTs do not currently carry it in
-- app_metadata, so auth.jwt() ->> 'role' is not a safe staff check.
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

-- Close the public hole. Empty polroles meant PUBLIC, including anon.
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Staff can read profiles" ON public.profiles;
CREATE POLICY "Staff can read profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    private.current_profile_role() IN ('admin', 'super_admin', 'lawyer', 'agent')
  );

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
      JOIN public.properties p ON p.id = v.property_id
      WHERE (v.visitor_id = auth.uid() AND p.owner_id = profiles.id)
         OR (p.owner_id = auth.uid() AND v.visitor_id = profiles.id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.offers o
      JOIN public.properties p ON p.id = o.property_id
      WHERE (o.buyer_id = auth.uid() AND p.owner_id = profiles.id)
         OR (p.owner_id = auth.uid() AND o.buyer_id = profiles.id)
         OR (o.buyer_id = auth.uid() AND o.seller_id = profiles.id)
         OR (o.seller_id = auth.uid() AND o.buyer_id = profiles.id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.cases c
      WHERE auth.uid() IN (c.buyer_id, c.seller_id, c.lawyer_id)
        AND profiles.id IN (c.buyer_id, c.seller_id, c.lawyer_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.agent_id = auth.uid()
        AND p.owner_id = profiles.id
    )
  );

-- Defense in depth: anon currently has table-level ALL on profiles (SELECT,
-- INSERT, UPDATE, DELETE). Strip that. Authenticated and service_role keep
-- their existing grants; RLS above restricts which rows they can see.
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE SELECT (email, phone, full_name) ON TABLE public.profiles FROM anon;
