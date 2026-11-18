import { SITE_ORIGIN } from '../siteOrigin';
import { logPublicSupabaseError, resolvePublicSupabaseConfig } from '../publicSupabase';
import { matchesPublicLocation, normalizeSearch } from '../../utils/publicLocation';
import {
  PUBLISHED_LISTING_STATUS,
  SUNNY_LISTING_CORE_SELECT,
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

const STREET_TYPE =
  '(?:carrera|cra\\.?|cr\\.?|calle|cll\\.?|cl\\.?|transversal|tv\\.?|diagonal|dg\\.?|avenida|av\\.?|circular|circ\\.?|autopista)';

const ADDRESS_RE = new RegExp(
  String.raw`\b${STREET_TYPE}\s+\d+[a-z]?\b|(?:apto\.?|apartamento|interior|torre)\s*#?\s*\d+`,
  'gi',
);

const LISTING_FETCH_LIMIT = 40;
const LISTING_RETURN_LIMIT = 8;

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

export function filterSunnyListingHits(
  hits: readonly SunnyListingHit[],
  input: SunnyListingSearchInput,
): SunnyListingHit[] {
  let next = [...hits];
  const city = input.city?.trim();
  if (city) {
    next = next.filter((hit) => matchesPublicLocation({ city: hit.city, neighborhood: hit.neighborhood }, city));
  }
  const neighborhood = input.neighborhood?.trim();
  if (neighborhood) {
    next = next.filter((hit) =>
      matchesPublicLocation({ neighborhood: hit.neighborhood, city: hit.city }, neighborhood),
    );
  }
  const needle = input.query?.trim();
  if (needle && !input.slug_or_id) {
    const folded = normalizeSearch(needle);
    next = next.filter((hit) => {
      const haystack = normalizeSearch(
        [hit.title, hit.neighborhood, hit.city, hit.description].filter(Boolean).join(' '),
      );
      return haystack.includes(folded);
    });
  }
  if (typeof input.max_price === 'number') {
    next = next.filter((hit) => {
      const amount = hit.listing_type === 'rental' ? hit.rent_monthly : hit.price;
      return amount == null || amount <= input.max_price!;
    });
  }
  return next.slice(0, LISTING_RETURN_LIMIT);
}

async function queryPublishedRows(
  supabase: { from: (table: string) => any },
  input: SunnyListingSearchInput,
  select: string,
) {
  let query = supabase
    .from('properties')
    .select(select)
    .eq('status', PUBLISHED_LISTING_STATUS)
    .order('created_at', { ascending: false })
    .limit(input.slug_or_id?.trim() ? 1 : LISTING_FETCH_LIMIT);

  if (input.slug_or_id?.trim()) {
    const key = input.slug_or_id.trim();
    const uuid = /^[0-9a-f-]{36}$/i.test(key);
    query = uuid ? query.eq('id', key) : query.ilike('slug', key);
  }
  if (input.listing_type) query = query.eq('listing_type', input.listing_type);
  if (typeof input.bedrooms_min === 'number') query = query.gte('bedrooms', input.bedrooms_min);

  return query;
}

export async function searchPublishedListings(
  input: SunnyListingSearchInput,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<{ ok: true; hits: SunnyListingHit[] } | { ok: false; error: string }> {
  const config = resolvePublicSupabaseConfig(env);
  const { url, anonKey } = config;
  if (!url || !anonKey) {
    logPublicSupabaseError('sunny-listings', new Error('listings_not_configured'), {
      urlSource: config.urlSource,
      anonKeySource: config.anonKeySource,
      hasUrl: Boolean(url),
      hasAnonKey: Boolean(anonKey),
    });
    return { ok: false, error: 'listings_not_configured' };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let { data, error } = await queryPublishedRows(supabase, input, SUNNY_LISTING_SELECT);
    if (error) {
      logPublicSupabaseError('sunny-listings', error, {
        select: 'full',
        url,
        urlSource: config.urlSource,
        anonKeySource: config.anonKeySource,
        city: input.city,
      });
      const retry = await queryPublishedRows(supabase, input, SUNNY_LISTING_CORE_SELECT);
      data = retry.data;
      error = retry.error;
      if (error) {
        logPublicSupabaseError('sunny-listings', error, {
          select: 'core',
          url,
          urlSource: config.urlSource,
          anonKeySource: config.anonKeySource,
          city: input.city,
        });
        return { ok: false, error: 'listings_query_failed' };
      }
    }

    const hits = filterSunnyListingHits(
      (data ?? []).map((row: unknown) => mapSunnyListing(row as Record<string, unknown>)),
      input,
    );
    return { ok: true, hits };
  } catch (error) {
    logPublicSupabaseError('sunny-listings', error, {
      url,
      urlSource: config.urlSource,
      anonKeySource: config.anonKeySource,
      city: input.city,
    });
    return { ok: false, error: 'listings_query_failed' };
  }
}

export function listingSelectContainsPrivate(): SunnyPrivateColumn[] {
  const selected = new Set(SUNNY_LISTING_SELECT.split(','));
  return SUNNY_PRIVATE_COLUMNS.filter((column) => selected.has(column));
}
