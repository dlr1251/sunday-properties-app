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
