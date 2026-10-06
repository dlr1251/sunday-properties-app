-- Readable public slugs for property detail URLs (/properties/el-escorial-701).
-- UUID ids stay the internal primary key; old /properties/:uuid links still resolve.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.slugify(input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  result := lower(trim(coalesce(input, '')));
  result := translate(
    result,
    'áàäâãåéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÅÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
    'aaaaaaeeeeiiiiooooouuuuncaaaaaaeeeeiiiiooooouuuunc'
  );
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  result := regexp_replace(result, '(^-+|-+$)', '', 'g');
  result := left(result, 80);
  IF result IS NULL OR result = '' THEN
    RETURN 'propiedad';
  END IF;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION private.unique_property_slug(p_base text, p_exclude_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base text;
  candidate text;
  n integer := 0;
BEGIN
  base := private.slugify(p_base);
  candidate := base;

  WHILE EXISTS (
    SELECT 1
    FROM public.properties
    WHERE slug = candidate
      AND (p_exclude_id IS NULL OR id <> p_exclude_id)
  ) LOOP
    n := n + 1;
    candidate := left(base, 70) || '-' || n::text;
  END LOOP;

  RETURN candidate;
END;
$$;

REVOKE ALL ON FUNCTION private.slugify(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.unique_property_slug(text, uuid) FROM PUBLIC;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS slug VARCHAR(120);

COMMENT ON COLUMN public.properties.slug IS
  'Unique URL slug for public listing pages. Stable after publish.';

-- Preferred readable slugs for the current real listings.
UPDATE public.properties AS p
SET slug = v.slug
FROM (
  VALUES
    ('Brisas del Estadio — Apartamento dúplex en venta', 'brisas-del-estadio'),
    ('El Escorial 701 — Arriendo en Conquistadores', 'el-escorial-701'),
    ('Apartamento Campo Nuevo — Arriendo', 'apartamento-campo-nuevo'),
    ('Casa Lauret — Arriendo en Laureles', 'casa-lauret'),
    ('Distrito Vera 1310 — Apartamento en venta', 'distrito-vera-1310')
) AS v(title, slug)
WHERE p.title = v.title
  AND (p.slug IS NULL OR btrim(p.slug) = '');

UPDATE public.properties
SET slug = private.unique_property_slug(title, id)
WHERE slug IS NULL OR btrim(slug) = '';

ALTER TABLE public.properties
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug ON public.properties (slug);

CREATE OR REPLACE FUNCTION private.properties_assign_slug()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
      NEW.slug := private.unique_property_slug(NEW.title, NEW.id);
    ELSE
      NEW.slug := private.unique_property_slug(NEW.slug, NEW.id);
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.slug IS DISTINCT FROM OLD.slug AND NEW.slug IS NOT NULL AND btrim(NEW.slug) <> '' THEN
    NEW.slug := private.unique_property_slug(NEW.slug, NEW.id);
  ELSIF NEW.title IS DISTINCT FROM OLD.title AND NEW.status IN ('draft', 'pending') THEN
    NEW.slug := private.unique_property_slug(NEW.title, NEW.id);
  ELSIF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    NEW.slug := private.unique_property_slug(COALESCE(NEW.title, 'propiedad'), NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.properties_assign_slug() FROM PUBLIC;

DROP TRIGGER IF EXISTS properties_assign_slug ON public.properties;
CREATE TRIGGER properties_assign_slug
  BEFORE INSERT OR UPDATE OF title, slug, status
  ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION private.properties_assign_slug();
