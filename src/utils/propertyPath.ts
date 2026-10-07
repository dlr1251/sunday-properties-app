const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPropertyUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/** ASCII kebab-case slug from a Spanish title. Mirrors private.slugify in SQL. */
export function slugify(input: string): string {
  const slug = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'propiedad';
}

export type PropertyPathSource = {
  id: string;
  slug?: string | null;
};

export function propertyKey(property: PropertyPathSource): string {
  return property.slug || property.id;
}

export function propertyPath(property: PropertyPathSource): string {
  return `/properties/${propertyKey(property)}`;
}

export function propertyEditPath(property: PropertyPathSource): string {
  return `${propertyPath(property)}/edit`;
}

function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/** Case-insensitive slug match; UUIDs stay exact. */
export function applyPropertyKeyFilter<
  Q extends { eq: (column: string, value: string) => Q; ilike: (column: string, value: string) => Q },
>(query: Q, propertyId: string): Q {
  return isPropertyUuid(propertyId)
    ? query.eq('id', propertyId)
    : query.ilike('slug', escapeIlikeExact(propertyId));
}

/**
 * If the public listing key is a mixed-case slug, return the lowercase
 * canonical path (plus optional suffix such as `/edit`).
 */
export function propertyKeyRedirectPath(
  propertyId: string,
  suffix = ''
): string | null {
  if (!propertyId || isPropertyUuid(propertyId)) return null;
  const lower = propertyId.toLowerCase();
  if (propertyId === lower) return null;
  return `/properties/${lower}${suffix}`;
}
