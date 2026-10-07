-- =============================================================================
-- Migration A (additive): neighborhood-level public_coordinates
-- =============================================================================
-- Safe to apply BEFORE the matching frontend deploy.
-- The new bundle selects public_coordinates. Adding the generated column
-- does not revoke anything, so live select('*') keeps working.
--
-- Release order:
--   1. Apply THIS file to project prtyuwdkrrqhtwolcrav.
--   2. Deploy the frontend in this PR.
--   3. Apply 20261007000000_lock_down_property_secrets.sql (revokes).
--
-- Do not apply the revoke migration from an agent against production.
-- jsonb_build_object is STABLE (error 42P17). Build the pin with text
-- concatenation so the generation expression is IMMUTABLE.
-- =============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS public_coordinates jsonb
  GENERATED ALWAYS AS (
    CASE
      WHEN coordinates IS NULL THEN NULL
      WHEN (coordinates ? 'lat')
       AND (coordinates ? 'lng')
       AND ((coordinates->>'lat') ~ '^-?[0-9]+(\.[0-9]+)?$')
       AND ((coordinates->>'lng') ~ '^-?[0-9]+(\.[0-9]+)?$')
      THEN (
        '{"lat":'
        || round((coordinates->>'lat')::numeric, 2)::text
        || ',"lng":'
        || round((coordinates->>'lng')::numeric, 2)::text
        || '}'
      )::jsonb
      ELSE NULL
    END
  ) STORED;

GRANT SELECT (public_coordinates) ON TABLE public.properties TO anon, authenticated;

COMMENT ON COLUMN public.properties.public_coordinates IS
  'Neighborhood-level lat/lng (2 decimal degrees). Safe to expose on public listing queries.';
