import { logPublicSupabaseError, resolvePublicSupabaseConfig } from '../publicSupabase';
import {
  PUBLISHED_LISTING_STATUS,
  SUNNY_LISTING_CORE_SELECT,
  SUNNY_LISTING_SELECT,
  SUNNY_PRIVATE_COLUMNS,
  type SunnyPrivateColumn,
} from './listing-columns';
import {
  LISTING_FETCH_LIMIT,
  filterSunnyListingHits,
  mapSunnyListing,
  type SunnyListingHit,
  type SunnyListingSearchInput,
} from './listing-hit';

export {
  LISTING_FETCH_LIMIT,
  LISTING_RETURN_LIMIT,
  MAX_LISTING_IMAGES,
  assertNoPrivateListingFields,
  filterSunnyListingHits,
  formatListingArea,
  listingDisplayPrice,
  listingHref,
  listingPricePerM2,
  listingShortTitle,
  listingSearchParams,
  listingZone,
  mapSunnyListing,
  parseListingSearchInput,
  publicHttpsImages,
  publicSunnyListingHits,
  publishedListingPrices,
  stripPrivateListingFields,
  toListingNumber,
} from './listing-hit';
export type { SunnyListingHit, SunnyListingSearchInput } from './listing-hit';

async function queryPublishedRows(
  supabase: { from: (table: string) => any },
  input: SunnyListingSearchInput,
  select: string,
) {
  const slugs = input.slugs?.map((slug) => slug.trim()).filter(Boolean) ?? [];
  const exactKey = input.slug_or_id?.trim() ?? '';
  const limit = slugs.length ? slugs.length : exactKey ? 1 : LISTING_FETCH_LIMIT;

  let query = supabase
    .from('properties')
    .select(select)
    .eq('status', PUBLISHED_LISTING_STATUS)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (slugs.length) {
    query = query.in('slug', slugs);
  } else if (exactKey) {
    const uuid = /^[0-9a-f-]{36}$/i.test(exactKey);
    query = uuid ? query.eq('id', exactKey) : query.ilike('slug', exactKey);
  }
  if (input.listing_type) query = query.eq('listing_type', input.listing_type);
  if (typeof input.bedrooms_min === 'number') query = query.gte('bedrooms', input.bedrooms_min);

  return query;
}

export async function searchPublishedListings(
  input: SunnyListingSearchInput,
  env: Readonly<Record<string, string | undefined>> = process.env,
): Promise<{ ok: true; hits: SunnyListingHit[] } | { ok: false; error: string }> {
  try {
    const { setDefaultResultOrder } = await import('node:dns');
    setDefaultResultOrder('ipv4first');
  } catch {
    // Edge / browsers have no dns module; Hono Node does.
  }

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
