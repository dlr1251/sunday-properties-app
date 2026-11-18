-- =============================================================================
-- Sunny public chat leads
-- =============================================================================
-- Inserts go through the Sunny agent server with the service role. Anon and a
-- random authenticated user must not SELECT this table. Admins may read it.
-- Do not grant INSERT to anon: the public chat never talks to PostgREST for
-- leads. This file does not send WhatsApp, email, or any other message.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.agent_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text,
  contact text,
  listing_of_interest text,
  message text NOT NULL,
  locale text NOT NULL DEFAULT 'es'
    CHECK (locale IN ('es', 'en')),
  handoff_requested boolean NOT NULL DEFAULT false,
  session_id text,
  source text NOT NULL DEFAULT 'sunny'
);

COMMENT ON TABLE public.agent_leads IS
  'Leads captured by the Sunny public chat agent. Handoff_requested marks a human follow-up; no outbound message is sent.';

ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_leads FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.agent_leads FROM PUBLIC;
REVOKE ALL ON TABLE public.agent_leads FROM anon;
REVOKE ALL ON TABLE public.agent_leads FROM authenticated;

GRANT ALL ON TABLE public.agent_leads TO service_role;
GRANT SELECT ON TABLE public.agent_leads TO authenticated;

DROP POLICY IF EXISTS agent_leads_no_anon ON public.agent_leads;
CREATE POLICY agent_leads_no_anon
  ON public.agent_leads
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS agent_leads_admin_select ON public.agent_leads;
CREATE POLICY agent_leads_admin_select
  ON public.agent_leads
  FOR SELECT
  TO authenticated
  USING (private.current_profile_role() IN ('admin', 'super_admin'));
