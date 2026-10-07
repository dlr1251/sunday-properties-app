-- =============================================================================
-- Between A and B: properties.area integer → numeric(8,2)
-- =============================================================================
-- Apply after 20261006120000_add_public_coordinates.sql and before
-- 20261007000000_lock_down_property_secrets.sql.
-- Does not change grants or row values. Existing integers cast in place.
-- =============================================================================

ALTER TABLE public.properties
  ALTER COLUMN area TYPE numeric(8, 2)
  USING area::numeric(8, 2);

COMMENT ON COLUMN public.properties.area IS
  'Floor area in m². numeric(8,2) so listings can store decimals (e.g. 45.54).';
