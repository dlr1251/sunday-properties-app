import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import {
  fetchPublishedListings,
  LISTINGS_UNAVAILABLE_NOTE,
  NO_MATCH_NOTE,
} from '../../src/lib/sunny/fetch-published-listings';
import { listingStatsFromHit, slimListingForModel } from '../../src/lib/sunny/generative-ui';
import type { SunnyListingSearchInput } from '../../src/lib/sunny/listing-hit';
import { listingStatsInputSchema } from '../../src/lib/sunny/listing-search-schema';

async function loadPublishedListings(input: SunnyListingSearchInput) {
  "use step";
  return fetchPublishedListings(input);
}

export default defineTool({
  description:
    'Show a stats panel for one published listing: price, COP/m², area, rooms, estrato, and admin fee — only fields that exist in the data. Use when they ask for key numbers or "cuánto cuesta el m2". Pass slug_or_id from a published listing. After it runs, write a short caption; do not invent missing figures.',
  approval: never(),
  inputSchema: listingStatsInputSchema,
  label: {
    start: ({ slug_or_id }) => `Listing stats for ${slug_or_id}`,
  },
  async execute(input) {
    let result: Awaited<ReturnType<typeof loadPublishedListings>>;
    try {
      result = await loadPublishedListings({ slug_or_id: input.slug_or_id });
    } catch (error) {
      logPublicSupabaseError('sunny-listing-stats', error, { slug: input.slug_or_id });
      return { ok: false, listing: null, stats: [], note: LISTINGS_UNAVAILABLE_NOTE };
    }
    if (!result.ok) {
      return { ok: false, listing: null, stats: [], note: LISTINGS_UNAVAILABLE_NOTE };
    }
    const listing = result.hits[0] ?? null;
    if (!listing) {
      return { ok: false, listing: null, stats: [], note: NO_MATCH_NOTE };
    }
    return {
      ok: true,
      listing,
      stats: listingStatsFromHit(listing),
      note: 'Report only these stats. If a field is missing, say you do not have it.',
    };
  },
  toModelOutput(output) {
    return {
      type: 'json' as const,
      value: {
        ok: output.ok,
        listing: output.listing ? slimListingForModel(output.listing) : null,
        stats: output.stats,
        note: output.note,
      },
    };
  },
});
