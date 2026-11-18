import { searchPublishedListingsViaHostApi } from './listings-host';
import { searchPublishedListings } from './listings';
import type { SunnyListingHit, SunnyListingSearchInput } from './listing-hit';

export type PublishedListingsResult =
  | { ok: true; hits: SunnyListingHit[] }
  | { ok: false; error: string };

/** Host-side fetch: Hono listings API first, then direct Supabase. */
export async function fetchPublishedListings(
  input: SunnyListingSearchInput,
): Promise<PublishedListingsResult> {
  const viaHost = await searchPublishedListingsViaHostApi(input);
  if (viaHost) return viaHost;
  return searchPublishedListings(input);
}

export const LISTINGS_UNAVAILABLE_NOTE =
  'Could not load published listings. Offer a human follow-up; do not invent inventory.';

export const NO_MATCH_NOTE =
  'No published listing matched. Do not invent a property, price, or availability.';

export const PUBLIC_FIELDS_NOTE =
  'Quote only these public fields. Never mention address, owner, minimum offer, or deposit.';
