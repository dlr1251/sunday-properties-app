import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import {
  fetchPublishedListings,
  LISTINGS_UNAVAILABLE_NOTE,
  NO_MATCH_NOTE,
  PUBLIC_FIELDS_NOTE,
} from '../../src/lib/sunny/fetch-published-listings';
import { slimListingForModel } from '../../src/lib/sunny/generative-ui';
import type { SunnyListingSearchInput } from '../../src/lib/sunny/listing-hit';
import { sunnyListingSearchSchema } from '../../src/lib/sunny/listing-search-schema';

async function loadPublishedListings(input: SunnyListingSearchInput) {
  "use step";
  return fetchPublishedListings(input);
}

export default defineTool({
  description:
    'Show published listings as photo cards in the chat. Use when the visitor asks to see properties, photos, a gallery, or "muéstrame". Fetches the same public published rows as search_listings. After it runs, write a short caption; the cards appear automatically. Do not paste image URLs.',
  approval: never(),
  inputSchema: sunnyListingSearchSchema,
  label: {
    start: () => 'Showing listings',
  },
  async execute(input) {
    let result: Awaited<ReturnType<typeof loadPublishedListings>>;
    try {
      result = await loadPublishedListings(input);
    } catch (error) {
      logPublicSupabaseError('sunny-show-listings', error, { city: input.city });
      return { ok: false, listings: [], note: LISTINGS_UNAVAILABLE_NOTE };
    }
    if (!result.ok) {
      return { ok: false, listings: [], note: LISTINGS_UNAVAILABLE_NOTE };
    }
    return {
      ok: true,
      listings: result.hits,
      note: result.hits.length === 0 ? NO_MATCH_NOTE : PUBLIC_FIELDS_NOTE,
    };
  },
  toModelOutput(output) {
    return {
      type: 'json' as const,
      value: {
        ok: output.ok,
        listings: output.listings.map(slimListingForModel),
        note: output.note,
      },
    };
  },
});
