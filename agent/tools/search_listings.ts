import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import {
  fetchPublishedListings,
  LISTINGS_UNAVAILABLE_NOTE,
  NO_MATCH_NOTE,
  PUBLIC_FIELDS_NOTE,
} from '../../src/lib/sunny/fetch-published-listings';
import { sunnyListingSearchSchema } from '../../src/lib/sunny/listing-search-schema';
import type { SunnyListingSearchInput } from '../../src/lib/sunny/listing-hit';

/**
 * Host Node step (not the workflow VM, not the inert sunny-none sandbox).
 * Prefer the Hono `api` service, which has normal Node egress to Supabase.
 */
async function loadPublishedListings(input: SunnyListingSearchInput) {
  "use step";
  return fetchPublishedListings(input);
}

export default defineTool({
  description:
    'Search Sunday Properties listings that are publicly published. Returns only public-safe fields (no address, owner contact, minimum offer, deposit, or internal notes). Call this before answering any question about a specific property, price, area, neighborhood inventory, or availability unless you already have those rows from show_listings, listing_stats, or compare_listings. If it returns no rows, say you do not have a published match and offer a human follow-up. For photos, cards, a stats panel, or a comparison table, also call the matching UI tool so the chat can render them.',
  approval: never(),
  inputSchema: sunnyListingSearchSchema,
  async execute(input) {
    let result: Awaited<ReturnType<typeof loadPublishedListings>>;
    try {
      result = await loadPublishedListings(input);
    } catch (error) {
      logPublicSupabaseError('sunny-listings', error, { city: input.city });
      return {
        ok: false,
        hits: [],
        note: LISTINGS_UNAVAILABLE_NOTE,
      };
    }
    if (!result.ok) {
      return {
        ok: false,
        hits: [],
        note: LISTINGS_UNAVAILABLE_NOTE,
      };
    }
    return {
      ok: true,
      hits: result.hits,
      note: result.hits.length === 0 ? NO_MATCH_NOTE : PUBLIC_FIELDS_NOTE,
    };
  },
});
