import { SITE_ORIGIN } from '../siteOrigin';
import { matchesPublicLocation, normalizeSearch } from '../../utils/publicLocation';
import { SUNNY_PRIVATE_COLUMNS, type SunnyPrivateColumn } from './listing-columns';
import { neutralizeInstructionLikeText } from './sensitive-tool-guard';

export const LISTING_FETCH_LIMIT = 40;
export const LISTING_RETURN_LIMIT = 8;
export const MAX_LISTING_IMAGES = 16;

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
  admin_fee: number | null;
  strata: number | null;
  property_type: string | null;
  verified: boolean | null;
  premium: boolean | null;
  features: string[] | null;
  description: string | null;
  images: string[];
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
  slugs?: string[];
};

const STREET_TYPE =
  '(?:carrera|cra\\.?|cr\\.?|calle|cll\\.?|cl\\.?|transversal|tv\\.?|diagonal|dg\\.?|avenida|av\\.?|circular|circ\\.?|autopista)';

const ADDRESS_RE = new RegExp(
  String.raw`\b${STREET_TYPE}\s+\d+[a-z]?\b|(?:apto\.?|apartamento|interior|torre)\s*#?\s*\d+`,
  'gi',
);

export function toListingNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function clipText(value: string | null | undefined, max: number): string {
  return (value ?? '').trim().slice(0, max);
}

function sanitizeDescription(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const stripped = neutralizeInstructionLikeText(value.replace(ADDRESS_RE, '')).trim();
  if (!stripped) return null;
  return stripped.slice(0, 600);
}

export function publicHttpsImages(value: unknown): string[] {
  const list = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const urls: string[] = [];
  for (const item of list) {
    if (typeof item === 'string' && item.startsWith('https://')) urls.push(item);
    if (urls.length >= MAX_LISTING_IMAGES) break;
  }
  return urls;
}

function listingUrl(slug: string | null, id: string): string {
  const key = (slug || id).toLowerCase();
  return `${SITE_ORIGIN}/properties/${key}`;
}

export function listingHref(hit: Pick<SunnyListingHit, 'slug' | 'id'>): string {
  return `/properties/${(hit.slug || hit.id).toLowerCase()}`;
}

export function listingShortTitle(hit: Pick<SunnyListingHit, 'title' | 'slug' | 'id'>): string {
  const title = hit.title?.trim();
  if (!title) return listingHref(hit);
  return title.split(/\s+[—–-]\s+/)[0]?.trim() || title;
}

export function listingZone(hit: Pick<SunnyListingHit, 'neighborhood' | 'city'>): string | null {
  const parts = [hit.neighborhood, hit.city].filter((part): part is string => Boolean(part?.trim()));
  return parts.length ? parts.join(', ') : null;
}

export function listingDisplayPrice(hit: Pick<SunnyListingHit, 'listing_type' | 'price' | 'rent_monthly'>): number | null {
  if (hit.listing_type === 'rental') return hit.rent_monthly;
  if (hit.price != null) return hit.price;
  return hit.rent_monthly;
}

export function listingPricePerM2(hit: Pick<SunnyListingHit, 'listing_type' | 'price' | 'rent_monthly' | 'area'>): number | null {
  const price = listingDisplayPrice(hit);
  const area = hit.area;
  if (price == null || area == null || price <= 0 || area <= 0) return null;
  return Math.round(price / area);
}

export function formatListingArea(area: number): string {
  const rounded = Number.isInteger(area) ? String(area) : String(area);
  return `${rounded} m²`;
}

export function parseListingSearchInput(
  search: URLSearchParams | Record<string, string | undefined>,
): SunnyListingSearchInput {
  const read = (key: string): string => {
    if (search instanceof URLSearchParams) return search.get(key) ?? '';
    return search[key] ?? '';
  };
  const input: SunnyListingSearchInput = {};
  const query = clipText(read('query'), 180);
  if (query) input.query = query;
  const city = clipText(read('city'), 80);
  if (city) input.city = city;
  const neighborhood = clipText(read('neighborhood'), 80);
  if (neighborhood) input.neighborhood = neighborhood;
  const listingType = clipText(read('listing_type'), 16);
  if (listingType === 'sale' || listingType === 'rental') input.listing_type = listingType;
  const bedroomsRaw = read('bedrooms_min').trim();
  if (bedroomsRaw) {
    const bedrooms = Number(bedroomsRaw);
    if (Number.isInteger(bedrooms) && bedrooms >= 0 && bedrooms <= 20) input.bedrooms_min = bedrooms;
  }
  const maxPriceRaw = read('max_price').trim();
  if (maxPriceRaw) {
    const maxPrice = Number(maxPriceRaw);
    if (Number.isFinite(maxPrice) && maxPrice >= 0) input.max_price = maxPrice;
  }
  const slugOrId = clipText(read('slug_or_id'), 120);
  if (slugOrId) input.slug_or_id = slugOrId;
  const slugsRaw = clipText(read('slugs'), 400);
  if (slugsRaw) {
    const slugs = slugsRaw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, LISTING_RETURN_LIMIT);
    if (slugs.length) input.slugs = slugs;
  }
  return input;
}

export function listingSearchParams(input: SunnyListingSearchInput): URLSearchParams {
  const params = new URLSearchParams();
  if (input.query) params.set('query', input.query);
  if (input.city) params.set('city', input.city);
  if (input.neighborhood) params.set('neighborhood', input.neighborhood);
  if (input.listing_type) params.set('listing_type', input.listing_type);
  if (typeof input.bedrooms_min === 'number') params.set('bedrooms_min', String(input.bedrooms_min));
  if (typeof input.max_price === 'number') params.set('max_price', String(input.max_price));
  if (input.slug_or_id) params.set('slug_or_id', input.slug_or_id);
  if (input.slugs?.length) params.set('slugs', input.slugs.join(','));
  return params;
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
  const images = publicHttpsImages(safe.images ?? safe.image);
  return {
    id,
    slug: typeof safe.slug === 'string' ? safe.slug : null,
    title: typeof safe.title === 'string' ? safe.title : null,
    url: listingUrl(typeof safe.slug === 'string' ? safe.slug : null, id),
    listing_type: typeof safe.listing_type === 'string' ? safe.listing_type : null,
    neighborhood: typeof safe.neighborhood === 'string' ? safe.neighborhood : null,
    city: typeof safe.city === 'string' ? safe.city : null,
    bedrooms: toListingNumber(safe.bedrooms),
    bathrooms: toListingNumber(safe.bathrooms),
    area: toListingNumber(safe.area),
    price: toListingNumber(safe.price),
    rent_monthly: toListingNumber(safe.rent_monthly),
    monthly_costs: toListingNumber(safe.monthly_costs),
    admin_fee: toListingNumber(safe.admin_fee),
    strata: toListingNumber(safe.strata),
    property_type: typeof safe.property_type === 'string' ? safe.property_type : null,
    verified: typeof safe.verified === 'boolean' ? safe.verified : null,
    premium: typeof safe.premium === 'boolean' ? safe.premium : null,
    features: Array.isArray(safe.features)
      ? safe.features.filter((item): item is string => typeof item === 'string').slice(0, 8)
      : null,
    description: sanitizeDescription(safe.description),
    images,
    image: images[0] ?? null,
  };
}

export function publicSunnyListingHits(raw: unknown): SunnyListingHit[] {
  if (!Array.isArray(raw)) return [];
  const hits: SunnyListingHit[] = [];
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    if (assertNoPrivateListingFields(record).length > 0) continue;
    const mapped = mapSunnyListing({
      ...record,
      images: record.images ?? (typeof record.image === 'string' ? [record.image] : undefined),
    });
    if (!mapped.id) continue;
    hits.push(mapped);
  }
  return hits;
}

export function publishedListingPrices(hits: readonly SunnyListingHit[]): number[] {
  const amounts: number[] = [];
  for (const hit of hits) {
    if (hit.price != null) amounts.push(hit.price);
    if (hit.rent_monthly != null) amounts.push(hit.rent_monthly);
    if (hit.monthly_costs != null) amounts.push(hit.monthly_costs);
    if (hit.admin_fee != null) amounts.push(hit.admin_fee);
  }
  return amounts;
}

export function filterSunnyListingHits(
  hits: readonly SunnyListingHit[],
  input: SunnyListingSearchInput,
): SunnyListingHit[] {
  let next = [...hits];
  const slugs = input.slugs?.map((slug) => slug.trim().toLowerCase()).filter(Boolean);
  if (slugs?.length) {
    const wanted = new Set(slugs);
    next = next.filter((hit) => hit.slug && wanted.has(hit.slug.toLowerCase()));
    next.sort((a, b) => slugs.indexOf((a.slug ?? '').toLowerCase()) - slugs.indexOf((b.slug ?? '').toLowerCase()));
  }
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
  if (needle && !input.slug_or_id && !slugs?.length) {
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

export type { SunnyPrivateColumn };
