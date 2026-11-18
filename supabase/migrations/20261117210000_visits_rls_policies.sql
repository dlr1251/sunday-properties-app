-- =============================================================================
-- visits RLS policies
-- =============================================================================
-- Live had RLS enabled on public.visits with no policies. Postgres denies
-- every row when RLS is on and the role has no policy, so authenticated
-- booking (INSERT) and dashboards (SELECT) both fail.
--
-- Do NOT apply this from an agent against production. Review, then run it
-- in the SQL editor of project prtyuwdkrrqhtwolcrav (or `supabase db push`
-- after that review). It is additive: ENABLE RLS + GRANT/REVOKE + policies.
-- It does not DROP the table or rewrite visit rows.
--
-- Policy model
-- ------------
-- Role           SELECT                         INSERT              UPDATE
-- anon           deny (no policy, grants off)   deny                deny
-- visitor        own rows (visitor_id)          own rows            own rows
-- property owner visits on their listings       deny                those rows
-- assigned agent visits on assigned listings    deny                deny
-- admin /
-- super_admin    all rows                       deny                all rows
--
-- "Owners can read all" means all visits on listings they own, not every
-- visit in the database. Platform admins (profiles.role in admin,
-- super_admin) read every visit.
--
-- Staff checks use private.current_profile_role() (profiles.role), not
-- auth.jwt() ->> 'role'. Production JWTs do not currently carry the role
-- in app_metadata; user_metadata is user-editable and must not be used.
-- Owner/agent checks go through SECURITY DEFINER helpers so policies
-- still work after properties.owner_id / agent_id were revoked from
-- invoker roles (20261007000000).
--
-- UPDATE is included because booking writes a pending visit then updates
-- it after payment, and visitors/owners cancel or confirm via UPDATE.
-- There is no DELETE policy: cancel is a status change. service_role
-- still bypasses RLS for scripts.
--
-- Follow-up (not in this file): counting other people's visits for
-- max_visits_per_day currently under-counts once RLS is on. A SECURITY
-- DEFINER counter would restore that without exposing rows to anon.
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

CREATE OR REPLACE FUNCTION private.property_owner_id(p_property_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT owner_id FROM public.properties WHERE id = p_property_id;
$$;

CREATE OR REPLACE FUNCTION private.is_assigned_agent(p_property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.properties
    WHERE id = p_property_id
      AND agent_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION private.current_profile_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.current_profile_role() FROM anon;
GRANT EXECUTE ON FUNCTION private.current_profile_role() TO authenticated;

REVOKE ALL ON FUNCTION private.property_owner_id(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.property_owner_id(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.property_owner_id(uuid) TO authenticated;

REVOKE ALL ON FUNCTION private.is_assigned_agent(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_assigned_agent(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION private.is_assigned_agent(uuid) TO authenticated;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.visits FROM PUBLIC;
REVOKE ALL ON TABLE public.visits FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.visits TO authenticated;

DROP POLICY IF EXISTS "Users can view their own visits" ON public.visits;
DROP POLICY IF EXISTS "Users can create visits" ON public.visits;
DROP POLICY IF EXISTS "Users can update their own visits" ON public.visits;
DROP POLICY IF EXISTS "Owners can view visits to their properties" ON public.visits;
DROP POLICY IF EXISTS "Visit select for participants" ON public.visits;
DROP POLICY IF EXISTS "Insert only by verified users for published properties" ON public.visits;
DROP POLICY IF EXISTS "visits_select_own" ON public.visits;
DROP POLICY IF EXISTS "visits_select_property_owner" ON public.visits;
DROP POLICY IF EXISTS "visits_select_assigned_agent" ON public.visits;
DROP POLICY IF EXISTS "visits_select_staff" ON public.visits;
DROP POLICY IF EXISTS "visits_insert_own" ON public.visits;
DROP POLICY IF EXISTS "visits_update_own" ON public.visits;
DROP POLICY IF EXISTS "visits_update_property_owner" ON public.visits;
DROP POLICY IF EXISTS "visits_update_staff" ON public.visits;

CREATE POLICY "visits_select_own"
  ON public.visits
  FOR SELECT
  TO authenticated
  USING (visitor_id = auth.uid());

CREATE POLICY "visits_select_property_owner"
  ON public.visits
  FOR SELECT
  TO authenticated
  USING (private.property_owner_id(property_id) = auth.uid());

CREATE POLICY "visits_select_assigned_agent"
  ON public.visits
  FOR SELECT
  TO authenticated
  USING (private.is_assigned_agent(property_id));

CREATE POLICY "visits_select_staff"
  ON public.visits
  FOR SELECT
  TO authenticated
  USING (private.current_profile_role() IN ('admin', 'super_admin'));

CREATE POLICY "visits_insert_own"
  ON public.visits
  FOR INSERT
  TO authenticated
  WITH CHECK (visitor_id = auth.uid());

CREATE POLICY "visits_update_own"
  ON public.visits
  FOR UPDATE
  TO authenticated
  USING (visitor_id = auth.uid())
  WITH CHECK (visitor_id = auth.uid());

CREATE POLICY "visits_update_property_owner"
  ON public.visits
  FOR UPDATE
  TO authenticated
  USING (private.property_owner_id(property_id) = auth.uid())
  WITH CHECK (private.property_owner_id(property_id) = auth.uid());

CREATE POLICY "visits_update_staff"
  ON public.visits
  FOR UPDATE
  TO authenticated
  USING (private.current_profile_role() IN ('admin', 'super_admin'))
  WITH CHECK (private.current_profile_role() IN ('admin', 'super_admin'));
