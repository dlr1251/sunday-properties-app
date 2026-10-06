-- ============================================
-- PRUNE TO CORE + REAL DATA (SQL version)
-- ============================================
-- Use this when you prefer direct psql / Supabase SQL editor.
-- It keeps only the three "real" properties (by title) + 1-2 minimal demo ones.
--
-- Run AFTER you have inserted the real properties with the .mjs seeder.
--
-- WARNING: This deletes a lot of test data. Backup first if needed.

-- 1. Delete dependent records for non-whitelisted properties
WITH props_to_delete AS (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'  -- optional minimal demo, remove if you want zero test props
  )
)
DELETE FROM public.offers WHERE property_id IN (SELECT id FROM props_to_delete);

WITH props_to_delete AS (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'
  )
)
DELETE FROM public.visits WHERE property_id IN (SELECT id FROM props_to_delete);

-- Legal cases
WITH props_to_delete AS (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'
  )
),
cases_to_delete AS (
  SELECT id FROM public.cases WHERE property_id IN (SELECT id FROM props_to_delete)
)
DELETE FROM public.case_documents WHERE case_id IN (SELECT id FROM cases_to_delete);

DELETE FROM public.cases
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'
  )
);

-- Availability & rules (best effort)
DELETE FROM public.property_availability
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'
  )
);

DELETE FROM public.negotiation_rules
WHERE property_id IN (
  SELECT id FROM public.properties
  WHERE title NOT IN (
    'Casa Lauret — Arriendo en Laureles',
    'Casa Lauret - Arriendo en Laureles',
    'Apartamento Campo Nuevo — Arriendo',
    'Apartamento Campo Nuevo - Arriendo',
    'Brisas del Estadio — Apartamento dúplex en venta',
    'Apartamento Moderno en El Poblado'
  )
);

-- 2. Finally delete the properties
DELETE FROM public.properties
WHERE title NOT IN (
  'Casa Lauret - Arriendo en Laureles',
  'Apartamento Campo Nuevo - Arriendo',
  'Propiedad Peter Pitchler - Venta',
  'Apartamento Moderno en El Poblado'   -- remove this line if you want ONLY the 3 real ones
);

-- Optional: you can also clean up completely orphaned notifications, chats etc. later.

SELECT 'Prune complete. Remaining properties:' as info;
SELECT id, title, listing_type, status FROM public.properties ORDER BY created_at DESC;
