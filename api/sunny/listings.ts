import {
  parseListingSearchInput,
  searchPublishedListings,
} from '../../src/lib/sunny/listings';
import { logPublicSupabaseError } from '../../src/lib/publicSupabase';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}

export async function GET(request: Request): Promise<Response> {
  const input = parseListingSearchInput(new URL(request.url).searchParams);
  try {
    const result = await searchPublishedListings(input);
    if (!result.ok) {
      return jsonResponse(503, {
        ok: false,
        hits: [],
        error: 'listings_unavailable',
      });
    }
    return jsonResponse(200, { ok: true, hits: result.hits });
  } catch (error) {
    logPublicSupabaseError('sunny-listings-api', error, { city: input.city });
    return jsonResponse(503, {
      ok: false,
      hits: [],
      error: 'listings_unavailable',
    });
  }
}
