import {
  SUNNY_LISTING_SELECT,
  SUNNY_PRIVATE_COLUMNS,
  type SunnyPrivateColumn,
} from './listing-columns';
import { neutralizeInstructionLikeText } from './sensitive-tool-guard';

export type SunnyListingHit = {
  id: string;
  slug: string | null;
  title: string | null;
  url: string;
  listing_type: string | null;
  neighborhood: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  price: number | null;
  rent_monthly: number | null;
  monthly_costs: number | null;
  property_type: string | null;
  verified: boolean | null;
  premium: boolean | null;
  features: string[] | null;
  description: string | null;
  image: string | null;
};

export type SunnyListingSearchInput = {
  query?: string;
  city?: string;
  neighborhood?: string;
  listing_type?: 'sale' | 'rental';
  bedrooms_min?: number;
  max_price?: number;
  slug_or_id?: string;
};

const SITE_ORIGIN = 'https://www.sundayproperties.co';

const STREET_TYPE =
  '(?:carrera|cra\\.?|cr\\.?|calle|cll\\.?|cl\\.?|transversal|tv\\.?|diagonal|dg\\.?|avenida|av\\.?|circular|circ\\.?|autopista)';

const ADDRESS_RE = new RegExp(
  String.raw`\b${STREET_TYPE}\s+\d+[a-z]?\b|(?:apto\.?|apartamento|interior|torre)\s*#?\s*\d+`,
  'gi',
);

function getPublicSupabaseConfig(env: Readonly<Record<string, string | undefined>> = process.env): {
  url: string;
  anonKey: string;
} {
  const url = (
    env.VITE_SUPABASE_URL ||
    env.SUPABASE_URL ||
    'https://prtyuwdkrrqhtwolcrav.supabase.co'
  ).trim();
  const anonKey = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim();
  return { url: url.replace(/\/$/, ''), anonKey };
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function sanitizeDescription(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const stripped = neutralizeInstructionLikeText(value.replace(ADDRESS_RE, '')).trim();
  if (!stripped) return null;
  return stripped.slice(0, 600);
}

function firstImage(value: unknown): string | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const first = value[0];
  return typeof first === 'string' && first.startsWith('https://') ? first : null;
}

function listingUrl(slug: string | null, id: string): string {
  const key = (slug || id).toLowerCase();
  return `${SITE_ORIGIN}/properties/${key}`;
}

export function stripPrivateListingFields<T extends Record<string, unknown>>(row: T): T {
  const next = { ...row };
  for (const column of SUNNY_PRIVATE_COLUMNS) {
    delete next[column];
  }
  return next;
}

export function assertNoPrivateListingFields(row: Record<string, unknown>): string[] {
  return SUNNY_PRIVATE_COLUMNS.filter((column) => column in row && row[column] != null);
}

export function mapSunnyListing(row: Record<string, unknown>): SunnyListingHit {
  const safe = stripPrivateListingFields(row);
  const id = String(safe.id ?? '');
  return {
    id,
    slug: typeof safe.slug === 'string' ? safe.slug : null,
    title: typeof safe.title === 'string' ? safe.title : null,
    url: listingUrl(typeof safe.slug === 'string' ? safe.slug : null, id),
    listing_type: typeof safe.listing_type === 'string' ? safe.listing_type : null,
    neighborhood: typeof safe.neighborhood === 'string' ? safe.neighborhood : null,
    city: typeof safe.city === 'string' ? safe.city : null,
    bedrooms: toNumber(safe.bedrooms),
    bathrooms: toNumber(safe.bathrooms),
    area: toNumber(safe.area),
    price: toNumber(safe.price),
    rent_monthly: toNumber(safe.rent_monthly),
    monthly_costs: toNumber(safe.monthly_costs),
    property_type: typeof safe.property_type === 'string' ? safe.property_type : null,
    verified: typeof safe.verified === 'boolean' ? safe.verified : null,
    premium: typeof safe.premium === 'boolean' ? safe.premium : null,
    features: Array.isArray(safe.features)
      ? safe.features.filter((item): item is string => typeof item === 'string').slice(0, 8)
      : null,
    description: sanitizeDescription(safe.description),
    image: firstImage(safe.images),
  };
}

export function publishedListingPrices(hits: readonly SunnyListingHit[]): number[] {
  const amounts: number[] = [];
  for (const hit of hits) {
    if (hit.price != null) amounts.push(hit.price);
    if (hit.rent_monthly != null) amounts.push(hit.rent_monthly);
    if (hit.monthly_costs != null) amounts.push(hit.monthly_costs);
  }
  return amounts;
}

export async function searchPublishedListings(
  input: SunnyListingSearchInput,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<{ ok: true; hits: SunnyListingHit[] } | { ok: false; error: string }> {
  const { url, anonKey } = getPublicSupabaseConfig(env);
  if (!url || !anonKey) return { ok: false, error: 'listings_not_configured' };

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let query = supabase
    .from('properties')
    .select(SUNNY_LISTING_SELECT)
    .eq('status', 'published')
    .limit(8);

  if (input.slug_or_id?.trim()) {
    const key = input.slug_or_id.trim();
    const uuid = /^[0-9a-f-]{36}$/i.test(key);
    query = uuid ? query.eq('id', key) : query.ilike('slug', key);
  }
  if (input.city?.trim()) query = query.ilike('city', `%${input.city.trim()}%`);
  if (input.neighborhood?.trim()) {
    query = query.ilike('neighborhood', `%${input.neighborhood.trim()}%`);
  }
  if (input.listing_type) query = query.eq('listing_type', input.listing_type);
  if (typeof input.bedrooms_min === 'number') query = query.gte('bedrooms', input.bedrooms_min);

  const needle = input.query?.trim();
  if (needle && !input.slug_or_id) {
    query = query.or(
      `title.ilike.%${needle}%,neighborhood.ilike.%${needle}%,city.ilike.%${needle}%,description.ilike.%${needle}%`,
    );
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: 'listings_query_failed' };

  let hits = (data ?? []).map((row) => mapSunnyListing(row as unknown as Record<string, unknown>));
  if (typeof input.max_price === 'number') {
    hits = hits.filter((hit) => {
      const amount = hit.listing_type === 'rental' ? hit.rent_monthly : hit.price;
      return amount == null || amount <= input.max_price!;
    });
  }
  return { ok: true, hits };
}

export function listingSelectContainsPrivate(): SunnyPrivateColumn[] {
  const selected = new Set(SUNNY_LISTING_SELECT.split(','));
  return SUNNY_PRIVATE_COLUMNS.filter((column) => selected.has(column));
}
