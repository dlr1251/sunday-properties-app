import { defineTool } from 'eve/tools';
import { never } from 'eve/tools/approval';

import { logPublicSupabaseError } from '../../src/lib/publicSupabase';
import {
  fetchPublishedListings,
  LISTINGS_UNAVAILABLE_NOTE,
  NO_MATCH_NOTE,
  PUBLIC_FIELDS_NOTE,
} from '../../src/lib/sunny/fetch-published-listings';
import { compareHighlights, slimListingForModel } from '../../src/lib/sunny/generative-ui';
import type { SunnyListingSearchInput } from '../../src/lib/sunny/listing-hit';
import { compareListingsInputSchema } from '../../src/lib/sunny/listing-search-schema';

async function loadPublishedListings(input: SunnyListingSearchInput) {
  "use step";
  return fetchPublishedListings(input);
}

export default defineTool({
  description:
    'Compare 2–4 published listings side by side in the chat, highlighting best public values (lowest price/m², largest area, etc.). Use when the visitor asks to compare ("compara estas dos"). Pass published slugs when you know them; otherwise search filters return up to four matches. After it runs, write a short caption. Do not invent values.',
  approval: never(),
  inputSchema: compareListingsInputSchema,
  label: {
    start: (input) =>
      input.slugs?.length ? `Comparing ${input.slugs.length} listings` : 'Comparing listings',
  },
  async execute(input) {
    const search: SunnyListingSearchInput = input.slugs?.length
      ? { slugs: input.slugs }
      : {
          query: input.query,
          city: input.city,
          neighborhood: input.neighborhood,
          listing_type: input.listing_type,
        };
    let result: Awaited<ReturnType<typeof loadPublishedListings>>;
    try {
      result = await loadPublishedListings(search);
    } catch (error) {
      logPublicSupabaseError('sunny-compare-listings', error, { city: input.city });
      return { ok: false, listings: [], highlights: compareHighlights([]), note: LISTINGS_UNAVAILABLE_NOTE };
    }
    if (!result.ok) {
      return { ok: false, listings: [], highlights: compareHighlights([]), note: LISTINGS_UNAVAILABLE_NOTE };
    }
    const listings = result.hits.slice(0, 4);
    if (listings.length < 2) {
      return {
        ok: false,
        listings,
        highlights: compareHighlights(listings),
        note: listings.length === 0 ? NO_MATCH_NOTE : 'Need at least two published listings to compare.',
      };
    }
    return {
      ok: true,
      listings,
      highlights: compareHighlights(listings),
      note: PUBLIC_FIELDS_NOTE,
    };
  },
  toModelOutput(output) {
    return {
      type: 'json' as const,
      value: {
        ok: output.ok,
        listings: output.listings.map(slimListingForModel),
        highlights: 'highlights' in output ? output.highlights : undefined,
        note: output.note,
      },
    };
  },
});
