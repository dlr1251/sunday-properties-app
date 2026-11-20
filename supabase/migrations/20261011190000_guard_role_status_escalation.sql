-- =============================================================================
-- Guard against privilege escalation on public.profiles and public.properties
-- =============================================================================
-- Problem (found 2026-10-11): any signed-in user could UPDATE their own
-- profiles.role / status / verification_status through PostgREST (RLS only
-- checks auth.uid() = id, grants cover every column), and owners could set
-- properties.status = 'published', verified or premium on their own rows.
-- public.create_admin_user(email, role) was also SECURITY DEFINER and EXECUTE-able
-- by anon/authenticated.
--
-- Rule enforced by the BEFORE INSERT OR UPDATE triggers below. A write that
-- touches a protected column is allowed only when the caller is "privileged":
--   * a direct database connection with no PostgREST JWT context
--     (SQL editor, migrations, GoTrue/internal roles such as the
--     handle_new_user trigger fired by signup),
--   * the service_role JWT, or
--   * a signed-in user whose profiles.role is admin or super_admin.
-- Everyone else (anon, authenticated non-admin) gets SQLSTATE 42501 with an
-- explicit message. Fail-closed: a malformed or role-less JWT context is NOT
-- privileged unless the uid resolves to an admin profile.
--
-- Protected columns
--   profiles:   role, status, verification_status
--   properties: status (owners may only do draft->pending, any->draft,
--               any->archived), verified, premium, owner_id, agent_id
-- On INSERT, non-privileged callers may only create role='user',
-- status='active', verification_status='unverified' profiles, and
-- properties with status='draft', verified=false, premium=false, agent_id NULL.
--
-- Rollback: see sp-release-2026-10-11/restore.sql (drops triggers/functions,
-- restores the previous EXECUTE grants on create_admin_user).
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS private;

-- ---------------------------------------------------------------------------
-- 1. Caller classification
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.caller_is_privileged()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  raw_claims text;
  claims     jsonb;
  jwt_role   text;
  v_uid      uuid;
  v_role     text;
BEGIN
  raw_claims := nullif(current_setting('request.jwt.claims', true), '');

  IF raw_claims IS NULL THEN
    jwt_role := nullif(current_setting('request.jwt.claim.role', true), '');
    IF jwt_role IS NULL THEN
      -- No PostgREST context. Trusted only for direct DB sessions; a session
      -- that came in through PostgREST (authenticator) without claims is not.
      RETURN session_user <> 'authenticator';
    END IF;
  ELSE
    BEGIN
      claims := raw_claims::jsonb;
    EXCEPTION WHEN others THEN
      RETURN false;  -- malformed claims: fail closed
    END;
    jwt_role := claims ->> 'role';
  END IF;

  IF jwt_role = 'service_role' THEN
    RETURN true;
  END IF;

  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN false;    -- anon or role-less token
  END IF;

  SELECT p.role INTO v_role FROM public.profiles p WHERE p.id = v_uid;
  RETURN coalesce(v_role IN ('admin', 'super_admin'), false);
END;
$$;

REVOKE ALL ON FUNCTION private.caller_is_privileged() FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. profiles guard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.guard_profiles_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user'
       OR coalesce(NEW.status, 'active') <> 'active'
       OR coalesce(NEW.verification_status, 'unverified') <> 'unverified' THEN
      IF NOT private.caller_is_privileged() THEN
        RAISE EXCEPTION 'No autorizado: solo un administrador puede crear perfiles con role=%, status=%, verification_status=%',
          NEW.role, NEW.status, NEW.verification_status
          USING ERRCODE = '42501';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
    IF NOT private.caller_is_privileged() THEN
      RAISE EXCEPTION 'No autorizado: role, status y verification_status solo los puede cambiar un administrador'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_profiles_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS a_guard_profiles_protected_columns ON public.profiles;
CREATE TRIGGER a_guard_profiles_protected_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.guard_profiles_protected_columns();

-- ---------------------------------------------------------------------------
-- 3. properties guard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.guard_properties_protected_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS DISTINCT FROM 'draft'
       OR coalesce(NEW.verified, false)
       OR coalesce(NEW.premium, false)
       OR NEW.agent_id IS NOT NULL THEN
      IF NOT private.caller_is_privileged() THEN
        RAISE EXCEPTION 'No autorizado: una propiedad nueva solo puede crearse en borrador (status=draft), sin verified/premium ni agent_id'
          USING ERRCODE = '42501';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
     OR NEW.agent_id IS DISTINCT FROM OLD.agent_id
     OR NEW.verified IS DISTINCT FROM OLD.verified
     OR NEW.premium  IS DISTINCT FROM OLD.premium THEN
    IF NOT private.caller_is_privileged() THEN
      RAISE EXCEPTION 'No autorizado: owner_id, agent_id, verified y premium solo los puede cambiar un administrador'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    -- Allowed for owners: draft -> pending (submit for review), any -> draft
    -- (withdraw), any -> archived. Everything else (published, sold, rented,
    -- pending from non-draft, ...) is an admin decision.
    IF NOT (
         NEW.status = 'archived'
      OR NEW.status = 'draft'
      OR (OLD.status = 'draft' AND NEW.status = 'pending')
    ) THEN
      IF NOT private.caller_is_privileged() THEN
        RAISE EXCEPTION 'No autorizado: transicion de status % -> % reservada a administradores', OLD.status, NEW.status
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.guard_properties_protected_columns() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS a_guard_properties_protected_columns ON public.properties;
CREATE TRIGGER a_guard_properties_protected_columns
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION private.guard_properties_protected_columns();

-- ---------------------------------------------------------------------------
-- 4. create_admin_user(): a SECURITY DEFINER role-setter that anon and
--    authenticated could call over RPC. The triggers above already block
--    non-admin callers, but there is no reason for the client roles to be
--    able to execute it at all (no usage in the frontend repo).
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.create_admin_user(text, text) FROM PUBLIC, anon, authenticated;
