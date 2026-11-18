import {
  LISTINGS_UNAVAILABLE_NOTE,
  NO_MATCH_NOTE,
  PUBLIC_FIELDS_NOTE,
} from '../../src/lib/sunny/fetch-published-listings';
import {
  compareHighlights,
  listingStatsFromHit,
  slimListingForModel,
} from '../../src/lib/sunny/generative-ui';
import type { SunnyListingHit, SunnyListingSearchInput } from '../../src/lib/sunny/listing-hit';
import { searchPublishedListings } from '../../src/lib/sunny/listings';
import { publicListings } from './privacy';

export type ListingsLoader = (
  input: SunnyListingSearchInput,
) => Promise<{ ok: true; hits: SunnyListingHit[] } | { ok: false; error: string }>;

export const defaultListingsLoader: ListingsLoader = (input) => searchPublishedListings(input);

function textResult(text: string) {
  return [{ type: 'text' as const, text }];
}

type LoadedHits = { ok: true; hits: SunnyListingHit[] } | { ok: false; hits: []; note: string };

function isFailedHits(result: LoadedHits): result is { ok: false; hits: []; note: string } {
  return result.ok === false;
}

async function loadPublicHits(
  loader: ListingsLoader,
  input: SunnyListingSearchInput,
): Promise<LoadedHits> {
  try {
    const result = await loader(input);
    if (!result.ok) return { ok: false, hits: [], note: LISTINGS_UNAVAILABLE_NOTE };
    return { ok: true, hits: publicListings(result.hits) };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('Refusing to return private') || message.includes('private fields')) {
      throw error;
    }
    return { ok: false, hits: [], note: LISTINGS_UNAVAILABLE_NOTE };
  }
}

export async function executeSearchListings(
  input: SunnyListingSearchInput,
  loader: ListingsLoader = defaultListingsLoader,
) {
  const result = await loadPublicHits(loader, input);
  if (isFailedHits(result)) {
    return {
      structuredContent: { ok: false, hits: [], note: result.note },
      content: textResult(result.note),
    };
  }
  const note = result.hits.length === 0 ? NO_MATCH_NOTE : PUBLIC_FIELDS_NOTE;
  return {
    structuredContent: { ok: true, hits: result.hits, note },
    content: textResult(
      result.hits.length
        ? `Found ${result.hits.length} published listing(s). Quote only these public fields.`
        : NO_MATCH_NOTE,
    ),
  };
}

export async function executeShowListings(
  input: SunnyListingSearchInput,
  loader: ListingsLoader = defaultListingsLoader,
) {
  const result = await loadPublicHits(loader, input);
  if (isFailedHits(result)) {
    return {
      structuredContent: { ok: false, listings: [], note: result.note },
      content: textResult(result.note),
    };
  }
  const note = result.hits.length === 0 ? NO_MATCH_NOTE : PUBLIC_FIELDS_NOTE;
  return {
    structuredContent: { ok: true, listings: result.hits, note },
    content: textResult(
      result.hits.length
        ? `Showing ${result.hits.length} published listing card(s): ${result.hits
            .map((hit) => slimListingForModel(hit).title || hit.slug || hit.id)
            .join('; ')}.`
        : NO_MATCH_NOTE,
    ),
  };
}

export async function executeListingStats(
  input: { slug_or_id: string },
  loader: ListingsLoader = defaultListingsLoader,
) {
  const result = await loadPublicHits(loader, { slug_or_id: input.slug_or_id });
  if (isFailedHits(result)) {
    return {
      structuredContent: { ok: false, listing: null, stats: [], note: result.note },
      content: textResult(result.note),
    };
  }
  const listing = result.hits[0] ?? null;
  if (!listing) {
    return {
      structuredContent: { ok: false, listing: null, stats: [], note: NO_MATCH_NOTE },
      content: textResult(NO_MATCH_NOTE),
    };
  }
  const stats = listingStatsFromHit(listing);
  const note = 'Report only these stats. If a field is missing, say you do not have it.';
  return {
    structuredContent: { ok: true, listing, stats, note },
    content: textResult(
      `Figures for ${slimListingForModel(listing).title || listing.slug || listing.id}. ${stats.length} public field(s).`,
    ),
  };
}

export async function executeCompareListings(
  input: {
    slugs?: string[];
    query?: string;
    city?: string;
    neighborhood?: string;
    listing_type?: 'sale' | 'rental';
  },
  loader: ListingsLoader = defaultListingsLoader,
) {
  const search: SunnyListingSearchInput = input.slugs?.length
    ? { slugs: input.slugs }
    : {
        query: input.query,
        city: input.city,
        neighborhood: input.neighborhood,
        listing_type: input.listing_type,
      };
  const result = await loadPublicHits(loader, search);
  if (isFailedHits(result)) {
    return {
      structuredContent: {
        ok: false,
        listings: [],
        highlights: compareHighlights([]),
        note: result.note,
      },
      content: textResult(result.note),
    };
  }
  const listings = result.hits.slice(0, 4);
  if (listings.length < 2) {
    const note =
      listings.length === 0 ? NO_MATCH_NOTE : 'Need at least two published listings to compare.';
    return {
      structuredContent: {
        ok: false,
        listings,
        highlights: compareHighlights(listings),
        note,
      },
      content: textResult(note),
    };
  }
  const highlights = compareHighlights(listings);
  return {
    structuredContent: { ok: true, listings, highlights, note: PUBLIC_FIELDS_NOTE },
    content: textResult(
      `Comparing ${listings.length} published listings. Highlighted cells are the best public value among comparable rows.`,
    ),
  };
}
