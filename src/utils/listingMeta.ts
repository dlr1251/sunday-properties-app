import { publicLocationLabel, sanitizePublicDescription } from './publicLocation';
import { isPropertyUuid } from './propertyPath';

/** Canonical public origin for share cards. Always the lowercase www host. */
export const SITE_ORIGIN = 'https://www.sundayproperties.co';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;
export const DEFAULT_PAGE_TITLE = 'Sunday Properties — Rent and buy in Medellín';
export const DEFAULT_OG_TITLE = 'Sunday Properties';
export const DEFAULT_DESCRIPTION =
  'Rent and buy in Medellín, Colombia — with title, contract, and visit before you commit.';

/**
 * Explicit allow-list for the OG/server lookup.
 * Never add address, minimum_offer_price, owner_id, coordinates, or legal docs.
 */
export const LISTING_OG_COLUMNS = [
  'id',
  'slug',
  'title',
  'description',
  'listing_type',
  'price',
  'rent_monthly',
  'neighborhood',
  'city',
  'images',
  'status',
] as const;

export const LISTING_OG_SELECT = LISTING_OG_COLUMNS.join(',');

export const LISTING_OG_FORBIDDEN_COLUMNS = [
  'address',
  'minimum_offer_price',
  'owner_id',
  'coordinates',
  'legal_docs',
  'documents',
  'phone',
  'email',
  'owner_name',
] as const;

export type ListingForOg = {
  id: string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  listing_type?: string | null;
  price?: number | string | null;
  rent_monthly?: number | string | null;
  neighborhood?: string | null;
  city?: string | null;
  images?: unknown;
  status?: string | null;
};

export type ListingPageMeta = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: string;
  twitterCard: 'summary_large_image';
};

const CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=86400';

export const LISTING_HTML_CACHE_CONTROL = CACHE_CONTROL;

const PUBLIC_SUPABASE_URL = 'https://prtyuwdkrrqhtwolcrav.supabase.co';
/** Same public anon key the browser already ships. RLS still applies. */
const PUBLIC_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBydHl1d2RrcnJxaHR3b2xjcmF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4OTA1MDUsImV4cCI6MjA3NjQ2NjUwNX0.0n7zBh6TvTdHtEDn_lNE0IaPkIVK3Ujhf6hZ2yNFOGo';

export function getSupabasePublicConfig(): { url: string; anonKey: string } {
  const url = (
    process.env.VITE_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    PUBLIC_SUPABASE_URL
  ).trim();
  const anonKey = (
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    PUBLIC_SUPABASE_ANON_KEY
  ).trim();
  return { url: url.replace(/\/$/, ''), anonKey };
}

/** Read `/properties/:slug` or `?slugOrId=` from a request URL. Never treat `/api/...` as a listing. */
export function parseListingSlug(urlOrPath: string, querySlug?: string | null): string {
  const fromQuery = (querySlug || '').trim();
  if (fromQuery) return decodeURIComponent(fromQuery);

  try {
    const url = new URL(urlOrPath, SITE_ORIGIN);
    const fromSearch = url.searchParams.get('slugOrId');
    if (fromSearch) return decodeURIComponent(fromSearch);
    urlOrPath = url.pathname;
  } catch {
    // treat as a raw path
  }

  const parts = urlOrPath.split('/').filter(Boolean);
  const propertiesIndex = parts.indexOf('properties');
  if (propertiesIndex >= 0 && parts[propertiesIndex + 1] && parts[propertiesIndex + 1] !== 'api') {
    return decodeURIComponent(parts[propertiesIndex + 1]);
  }
  return '';
}

export function canonicalListingPath(slugOrId: string): string {
  const trimmed = slugOrId.trim();
  if (isPropertyUuid(trimmed)) return `/properties/${trimmed.toLowerCase()}`;
  return `/properties/${trimmed.toLowerCase()}`;
}

export function canonicalListingUrl(slugOrId: string): string {
  return `${SITE_ORIGIN}${canonicalListingPath(slugOrId)}`;
}

function toFiniteNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : null;
}

export function formatOgCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function listingDealLabel(listingType: string | null | undefined): 'Arriendo' | 'Venta' {
  return listingType === 'rental' ? 'Arriendo' : 'Venta';
}

export function formatOgListingPrice(listing: ListingForOg): string | null {
  const salePrice = toFiniteNumber(listing.price);
  const monthly = toFiniteNumber(listing.rent_monthly);
  if (listing.listing_type === 'rental' && monthly != null) {
    return `${formatOgCop(monthly)}/mes`;
  }
  if (salePrice != null) return formatOgCop(salePrice);
  if (monthly != null) return `${formatOgCop(monthly)}/mes`;
  return null;
}

function isSvgUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return path.endsWith('.svg') || path.endsWith('.svgz');
}

function isAllowedOgImageUrl(url: string): boolean {
  if (!/^https:\/\//i.test(url)) return false;
  if (isSvgUrl(url)) return false;
  const path = url.split('?')[0].toLowerCase();
  return (
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.png') ||
    path.endsWith('.webp') ||
    !/\.[a-z0-9]+$/i.test(path)
  );
}

function imageCandidate(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value && typeof value === 'object') {
    const record = value as { url?: unknown; src?: unknown };
    if (typeof record.url === 'string' && record.url.trim()) return record.url.trim();
    if (typeof record.src === 'string' && record.src.trim()) return record.src.trim();
  }
  return null;
}

export function firstListingOgImage(
  images: unknown,
  supabaseUrl = getSupabasePublicConfig().url
): string | null {
  const list = Array.isArray(images) ? images : [];
  for (const item of list) {
    const raw = imageCandidate(item);
    if (!raw) continue;
    let absolute = raw;
    if (raw.startsWith('//')) absolute = `https:${raw}`;
    else if (raw.startsWith('/storage/')) absolute = `${supabaseUrl}${raw}`;
    else if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
      const path = raw.replace(/^\/+/, '');
      absolute = `${supabaseUrl}/storage/v1/object/public/${path}`;
    }
    if (absolute.startsWith('http://')) {
      absolute = `https://${absolute.slice('http://'.length)}`;
    }
    if (isAllowedOgImageUrl(absolute)) return absolute;
  }
  return null;
}

export function genericSiteMeta(path = '/'): ListingPageMeta {
  const ogUrl = path === '/' ? SITE_ORIGIN : `${SITE_ORIGIN}${path}`;
  return {
    title: DEFAULT_PAGE_TITLE,
    description: DEFAULT_DESCRIPTION,
    ogTitle: DEFAULT_OG_TITLE,
    ogDescription: DEFAULT_DESCRIPTION,
    ogImage: DEFAULT_OG_IMAGE,
    ogUrl,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  };
}

export function buildListingMeta(listing: ListingForOg | null | undefined): ListingPageMeta | null {
  if (!listing || listing.status !== 'published') return null;

  const location = publicLocationLabel(listing);
  const deal = listingDealLabel(listing.listing_type);
  const price = formatOgListingPrice(listing);
  const ogDescription = [deal, price, location].filter(Boolean).join(' · ');
  const titleBase = (listing.title || '').trim() || DEFAULT_OG_TITLE;
  const pageTitle = location ? `${titleBase} · ${location} · Sunday Properties` : `${titleBase} · Sunday Properties`;
  const slugOrId = listing.slug || listing.id;
  const sanitized = sanitizePublicDescription(listing.description);
  const metaDescription = ogDescription || sanitized.slice(0, 160) || DEFAULT_DESCRIPTION;

  return {
    title: pageTitle,
    description: metaDescription,
    ogTitle: titleBase,
    ogDescription: ogDescription || metaDescription,
    ogImage: firstListingOgImage(listing.images) || DEFAULT_OG_IMAGE,
    ogUrl: canonicalListingUrl(slugOrId),
    ogType: 'website',
    twitterCard: 'summary_large_image',
  };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceTitle(html: string, title: string): string {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) {
    return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertTag(
  html: string,
  kind: 'name' | 'property',
  key: string,
  content: string
): string {
  const tag = `<meta ${kind}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(`<meta\\s+[^>]*(?:${kind}=["']${key}["'][^>]*|[^>]*${kind}=["']${key}["'])[^>]*>`, 'i');
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function upsertCanonical(html: string, href: string): string {
  const tag = `<link rel="canonical" href="${escapeAttr(href)}" />`;
  if (/<link\s+[^>]*rel=["']canonical["'][^>]*>/i.test(html)) {
    return html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/i, tag);
  }
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

export function applyListingMetaToHtml(html: string, meta: ListingPageMeta): string {
  let next = replaceTitle(html, meta.title);
  next = upsertTag(next, 'name', 'description', meta.description);
  next = upsertTag(next, 'property', 'og:title', meta.ogTitle);
  next = upsertTag(next, 'property', 'og:description', meta.ogDescription);
  next = upsertTag(next, 'property', 'og:image', meta.ogImage);
  next = upsertTag(next, 'property', 'og:url', meta.ogUrl);
  next = upsertTag(next, 'property', 'og:type', meta.ogType);
  next = upsertTag(next, 'property', 'og:site_name', 'Sunday Properties');
  next = upsertTag(next, 'name', 'twitter:card', meta.twitterCard);
  next = upsertTag(next, 'name', 'twitter:title', meta.ogTitle);
  next = upsertTag(next, 'name', 'twitter:description', meta.ogDescription);
  next = upsertTag(next, 'name', 'twitter:image', meta.ogImage);
  next = upsertCanonical(next, meta.ogUrl);
  return next;
}

export function assertSafeListingMeta(meta: ListingPageMeta, listing?: ListingForOg | null): void {
  const blob = JSON.stringify(meta);
  if (/minimum_offer_price/i.test(blob)) {
    throw new Error('listing meta leaked minimum_offer_price');
  }
  if (listing && 'address' in listing) {
    throw new Error('listing payload must not include address');
  }
}

function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export async function fetchPublishedListingForOg(
  slugOrId: string,
  config = getSupabasePublicConfig()
): Promise<ListingForOg | null> {
  const key = slugOrId.trim();
  if (!key) return null;

  const params = new URLSearchParams();
  params.set('select', LISTING_OG_SELECT);
  params.set('status', 'eq.published');
  params.set('limit', '1');
  if (isPropertyUuid(key)) {
    params.set('id', `eq.${key}`);
  } else {
    params.set('slug', `ilike.${escapeIlikeExact(key)}`);
  }

  const response = await fetch(`${config.url}/rest/v1/properties?${params.toString()}`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${config.anonKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  const rows = (await response.json()) as ListingForOg[];
  if (!Array.isArray(rows) || rows.length === 0) return null;
  const listing = rows[0];
  if (listing.status !== 'published') return null;
  return listing;
}

export async function renderListingIndexHtml(
  html: string,
  slugOrId: string
): Promise<{ html: string; meta: ListingPageMeta; listing: ListingForOg | null }> {
  let listing: ListingForOg | null = null;
  try {
    listing = await fetchPublishedListingForOg(slugOrId);
  } catch {
    listing = null;
  }
  const meta = buildListingMeta(listing) || genericSiteMeta();
  assertSafeListingMeta(meta, listing);
  return { html: applyListingMetaToHtml(html, meta), meta, listing };
}
