import { supabase } from './supabase';
import { applyPropertyKeyFilter } from '../utils/propertyPath';
import {
  approximateNeighborhoodCoords,
  isValidCoordinates,
  type Coordinates,
} from '../utils/publicLocation';

/**
 * Columns the anon key (and a random signed-in user) may read on
 * public.properties. Keep in sync with
 * supabase/migrations/20261006120000_add_public_coordinates.sql
 * (additive; apply first) and
 * supabase/migrations/20261007000000_lock_down_property_secrets.sql
 * (revokes; apply after the frontend deploy).
 *
 * Do not add address, exact coordinates, owner/agent ids, offer floors,
 * commissions, legal docs, negotiation terms, or rental deposits
 * (Ley 820 art. 16 — Colombian housing leases cannot require deposits).
 */
export const PUBLIC_PROPERTY_COLUMNS = [
  'id',
  'slug',
  'title',
  'description',
  'neighborhood',
  'city',
  'public_coordinates',
  'bedrooms',
  'bathrooms',
  'area',
  'parking',
  'floor',
  'total_floors',
  'year_built',
  'property_type',
  'strata',
  'price',
  'monthly_costs',
  'accepts_crypto',
  'financing',
  'visit_price',
  'status',
  'verified',
  'premium',
  'images',
  'virtual_tour',
  'freedom_tradition',
  'tags',
  'features',
  'created_at',
  'updated_at',
  'published_at',
  'listing_type',
  'rent_monthly',
  'lease_term_months',
  'admin_fee',
  'utilities_included',
  'pets_policy',
  'nearby_places',
] as const;

export const SENSITIVE_PROPERTY_COLUMNS = [
  'address',
  'minimum_offer_price',
  'coordinates',
  'legal_documents',
  'owner_id',
  'agent_id',
  'negotiation_terms',
  'deposit',
] as const;

export const PUBLIC_PROPERTY_SELECT = PUBLIC_PROPERTY_COLUMNS.join(',');

/** Nested PostgREST embed. Must not include any SENSITIVE_PROPERTY_COLUMNS. */
export const PUBLIC_PROPERTY_EMBED = PUBLIC_PROPERTY_SELECT;

export const PROPERTIES_PRIVATE_VIEW = 'properties_private';

export type PublicPropertyColumn = (typeof PUBLIC_PROPERTY_COLUMNS)[number];
export type SensitivePropertyColumn = (typeof SENSITIVE_PROPERTY_COLUMNS)[number];

export function publicPropertiesTable() {
  return supabase.from('properties').select(PUBLIC_PROPERTY_SELECT);
}

export function privatePropertiesTable() {
  return supabase.from(PROPERTIES_PRIVATE_VIEW as 'properties');
}

export function publicMapCoordinates(source: {
  public_coordinates?: Coordinates | null;
  coordinates?: Coordinates | null;
}): Coordinates | null {
  if (isValidCoordinates(source.public_coordinates)) {
    return source.public_coordinates;
  }
  return approximateNeighborhoodCoords(source.coordinates);
}

export function mapPublicProperty<T extends Record<string, unknown>>(row: T) {
  const mapped: Record<string, unknown> = { ...row };
  const pin = publicMapCoordinates(row as {
    public_coordinates?: Coordinates | null;
    coordinates?: Coordinates | null;
  });
  for (const column of SENSITIVE_PROPERTY_COLUMNS) {
    delete mapped[column];
  }
  mapped.coordinates = pin;
  return mapped;
}

export async function fetchOwnedPropertyIds(userId: string): Promise<string[]> {
  const { data, error } = await privatePropertiesTable()
    .select('id')
    .eq('owner_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.id);
}

export async function fetchPrivatePropertyByKey(key: string) {
  return applyPropertyKeyFilter(privatePropertiesTable().select('*'), key).maybeSingle();
}

function collectPropertyIds<T extends Record<string, any>>(rows: T[]): string[] {
  const ids = new Set<string>();
  for (const row of rows) {
    if (typeof row.property_id === 'string') ids.add(row.property_id);
    if (typeof row.property?.id === 'string') ids.add(row.property.id);
    if (typeof row.properties?.id === 'string') ids.add(row.properties.id);
    if (typeof row.reported_property?.id === 'string') ids.add(row.reported_property.id);
  }
  return [...ids];
}

/**
 * Overlay owner/admin/lawyer fields from properties_private onto nested
 * property objects. Buyers and other signed-in users get no extra fields.
 */
export async function hydrateSensitivePropertyFields<T extends Record<string, any>>(
  rows: T[]
): Promise<T[]> {
  const ids = collectPropertyIds(rows);
  if (ids.length === 0) return rows;

  const { data, error } = await privatePropertiesTable().select('*').in('id', ids);
  if (error || !data?.length) return rows;

  const byId = new Map(data.map((property) => [property.id, property]));
  return rows.map((row) => {
    const id = row.property?.id || row.properties?.id || row.reported_property?.id || row.property_id;
    const priv = typeof id === 'string' ? byId.get(id) : undefined;
    if (!priv) return row;

    const next = { ...row };
    if (row.property) next.property = { ...row.property, ...priv };
    if (row.properties) next.properties = { ...row.properties, ...priv };
    if (row.reported_property) next.reported_property = { ...row.reported_property, ...priv };
    return next;
  });
}
