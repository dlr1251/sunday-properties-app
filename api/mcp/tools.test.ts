import { describe, expect, it } from 'vitest';

import { mapSunnyListing } from '../../src/lib/sunny/listing-hit';
import { leakedPrivateKeys } from './privacy';
import {
  executeCompareListings,
  executeListingStats,
  executeSearchListings,
  executeShowListings,
  type ListingsLoader,
} from './tools';

function hit(overrides: Record<string, unknown> = {}) {
  return mapSunnyListing({
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'brisas-del-estadio',
    title: 'Brisas del Estadio',
    city: 'Medellín',
    neighborhood: 'Estadio',
    listing_type: 'sale',
    price: 390_000_000,
    area: 45.54,
    bedrooms: 1,
    bathrooms: 2,
    images: ['https://cdn.example/brisas.webp'],
    ...overrides,
  });
}

function loaderOf(hits: ReturnType<typeof hit>[]): ListingsLoader {
  return async () => ({ ok: true, hits });
}

describe('ChatGPT MCP listing tools', () => {
  it('search_listings returns only public published hits', async () => {
    const result = await executeSearchListings({ city: 'Medellín' }, loaderOf([hit()]));
    expect(result.structuredContent.ok).toBe(true);
    expect(result.structuredContent.hits).toHaveLength(1);
    expect(result.structuredContent.hits[0]).not.toHaveProperty('address');
    expect(result.structuredContent.hits[0]).not.toHaveProperty('minimum_offer_price');
    expect(leakedPrivateKeys(result.structuredContent)).toEqual([]);
  });

  it('drops rows that still carry private fields', async () => {
    const leaked = {
      ...hit({ slug: 'secret' }),
      address: 'Calle 10',
      minimum_offer_price: 1,
      owner_id: 'owner',
      deposit: 9,
    };
    const result = await executeShowListings({}, loaderOf([leaked as never, hit()]));
    expect(result.structuredContent.listings.map((row) => row.slug)).toEqual(['brisas-del-estadio']);
    expect(leakedPrivateKeys(result.structuredContent)).toEqual([]);
  });

  it('listing_stats omits fields that were never in the data', async () => {
    const sparse = hit({ admin_fee: null, strata: null, images: [] });
    const result = await executeListingStats({ slug_or_id: 'brisas-del-estadio' }, loaderOf([sparse]));
    expect(result.structuredContent.ok).toBe(true);
    const keys = result.structuredContent.stats.map((stat) => stat.key);
    expect(keys).toContain('price');
    expect(keys).toContain('price_per_m2');
    expect(keys).not.toContain('admin_fee');
    expect(keys).not.toContain('strata');
  });

  it('compare_listings needs two published listings and never invents values', async () => {
    const one = await executeCompareListings({ slugs: ['brisas-del-estadio', 'casa-lauret'] }, loaderOf([hit()]));
    expect(one.structuredContent.ok).toBe(false);
    expect(one.structuredContent.note).toMatch(/at least two/i);

    const a = hit({ id: '1', slug: 'a', price: 400_000_000, area: 40 });
    const b = hit({ id: '2', slug: 'b', price: 300_000_000, area: 80 });
    const compared = await executeCompareListings({ slugs: ['a', 'b'] }, loaderOf([a, b]));
    expect(compared.structuredContent.ok).toBe(true);
    expect(compared.structuredContent.highlights.price).toEqual(['2']);
    expect(compared.structuredContent.highlights.area).toEqual(['2']);
    expect(leakedPrivateKeys(compared.structuredContent)).toEqual([]);
  });

  it('does not invent inventory when the listings source fails', async () => {
    const failing: ListingsLoader = async () => ({ ok: false, error: 'listings_query_failed' });
    const result = await executeSearchListings({ query: 'Poblado' }, failing);
    expect(result.structuredContent).toEqual({
      ok: false,
      hits: [],
      note: expect.stringMatching(/do not invent/i),
    });
  });
});
