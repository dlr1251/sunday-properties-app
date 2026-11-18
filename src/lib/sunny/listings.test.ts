import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  filterSunnyListingHits,
  listingSearchParams,
  mapSunnyListing,
  parseListingSearchInput,
  publicSunnyListingHits,
} from './listings';
import { resolveListingsApiOrigin, searchPublishedListingsViaHostApi } from './listings-host';
import { sunnyCompanyFacts } from './company';
import { BRAND_EMAIL, BRAND_PHONE } from '../../constants/brand';

function hit(overrides: Record<string, unknown> = {}) {
  return mapSunnyListing({
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'brisas',
    title: 'Brisas del Estadio',
    city: 'Medellín',
    neighborhood: 'Estadio',
    listing_type: 'sale',
    price: 450_000_000,
    ...overrides,
  });
}

describe('filterSunnyListingHits', () => {
  it('matches Medellín with or without the accent', () => {
    const hits = [hit(), hit({ slug: 'bogota-loft', city: 'Bogotá', neighborhood: 'Chapinero' })];
    expect(filterSunnyListingHits(hits, { city: 'Medellín' }).map((row) => row.slug)).toEqual(['brisas']);
    expect(filterSunnyListingHits(hits, { city: 'Medellin' }).map((row) => row.slug)).toEqual(['brisas']);
    expect(filterSunnyListingHits(hits, { city: 'Bogota' }).map((row) => row.slug)).toEqual(['bogota-loft']);
  });

  it('filters neighborhood and free-text without inventing rows', () => {
    const hits = [hit({ description: 'Apartamento cerca al estadio' })];
    expect(filterSunnyListingHits(hits, { neighborhood: 'estadio' })).toHaveLength(1);
    expect(filterSunnyListingHits(hits, { query: 'BRISAS' })).toHaveLength(1);
    expect(filterSunnyListingHits(hits, { query: 'Laureles' })).toHaveLength(0);
  });
});

describe('parseListingSearchInput', () => {
  it('keeps public filters and drops unknown listing_type', () => {
    const parsed = parseListingSearchInput({
      query: '  Brisas  ',
      city: 'Medellín',
      listing_type: 'lease',
      bedrooms_min: '2',
      max_price: '500000000',
      slug_or_id: 'brisas',
    });
    expect(parsed).toEqual({
      query: 'Brisas',
      city: 'Medellín',
      bedrooms_min: 2,
      max_price: 500_000_000,
      slug_or_id: 'brisas',
    });
    expect(parseListingSearchInput({ listing_type: 'rental' }).listing_type).toBe('rental');
    expect(parseListingSearchInput({ slugs: 'el-escorial-701,casa-lauret' }).slugs).toEqual([
      'el-escorial-701',
      'casa-lauret',
    ]);
    expect(parseListingSearchInput(new URLSearchParams())).toEqual({});
  });

  it('round-trips through listingSearchParams', () => {
    const input = {
      city: 'Medellín',
      listing_type: 'sale' as const,
      bedrooms_min: 3,
    };
    expect(parseListingSearchInput(listingSearchParams(input))).toEqual(input);
  });
});

describe('publicSunnyListingHits', () => {
  it('drops rows that still carry private fields and remaps a public hit', () => {
    const leaked = {
      ...hit(),
      minimum_offer_price: 1,
      owner_id: 'secret',
      address: 'Calle 10',
    };
    const publicHit = hit({ images: ['https://cdn.example/brisas.jpg'] });
    expect(publicSunnyListingHits([leaked, publicHit]).map((row) => row.slug)).toEqual(['brisas']);
    expect(publicSunnyListingHits([publicHit])[0]).not.toHaveProperty('minimum_offer_price');
    expect(publicSunnyListingHits([publicHit])[0]).not.toHaveProperty('address');
    expect(publicSunnyListingHits([publicHit])[0]).not.toHaveProperty('owner_id');
  });
});

describe('mapSunnyListing public extras', () => {
  it('keeps https photos, admin fee and strata, and never invents missing ones', () => {
    const withPhotos = hit({
      images: ['https://cdn.example/a.webp', 'http://insecure.example/b.jpg', 'https://cdn.example/c.webp'],
      admin_fee: 322_000,
      strata: 4,
    });
    expect(withPhotos.images).toEqual(['https://cdn.example/a.webp', 'https://cdn.example/c.webp']);
    expect(withPhotos.image).toBe('https://cdn.example/a.webp');
    expect(withPhotos.admin_fee).toBe(322_000);
    expect(withPhotos.strata).toBe(4);

    const sparse = hit();
    expect(sparse.images).toEqual([]);
    expect(sparse.image).toBeNull();
    expect(sparse.admin_fee).toBeNull();
    expect(sparse.strata).toBeNull();
  });

  it('filters and preserves slug order for compare queries', () => {
    const hits = [
      hit({ slug: 'casa-lauret' }),
      hit({ slug: 'brisas-del-estadio' }),
      hit({ slug: 'el-escorial-701' }),
    ];
    expect(
      filterSunnyListingHits(hits, { slugs: ['el-escorial-701', 'casa-lauret'] }).map((row) => row.slug),
    ).toEqual(['el-escorial-701', 'casa-lauret']);
  });
});

describe('listings host API origin', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prefers an explicit origin then VERCEL_URL', () => {
    expect(resolveListingsApiOrigin({ VERCEL_URL: 'sunday-preview.vercel.app' })).toBe(
      'https://sunday-preview.vercel.app',
    );
    expect(
      resolveListingsApiOrigin({
        SUNNY_LISTINGS_API_ORIGIN: 'https://api.example',
        VERCEL_URL: 'ignored.vercel.app',
      }),
    ).toBe('https://api.example');
    expect(resolveListingsApiOrigin({})).toBeNull();
  });

  it('fetches only public hits from the Hono listings route', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url).toContain('/api/sunny/listings?city=Medell');
      expect(init?.method).toBe('GET');
      expect((init?.headers as Record<string, string>)['x-vercel-protection-bypass']).toBe('bypass-secret');
      return new Response(
        JSON.stringify({
          ok: true,
          hits: [
            hit({ images: ['https://cdn.example/brisas.jpg'] }),
            { ...hit({ slug: 'secret-loft' }), minimum_offer_price: 9 },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await searchPublishedListingsViaHostApi(
      { city: 'Medellín' },
      {
        VERCEL_URL: 'sunday-preview.vercel.app',
        VERCEL_AUTOMATION_BYPASS_SECRET: 'bypass-secret',
      },
    );
    expect(result).toEqual({
      ok: true,
      hits: [expect.objectContaining({ slug: 'brisas', title: 'Brisas del Estadio' })],
    });
    expect(result && result.ok ? result.hits[0] : null).not.toHaveProperty('minimum_offer_price');
  });
});

describe('sunnyCompanyFacts', () => {
  it('uses the brand phone and email Daniel should confirm', () => {
    const facts = sunnyCompanyFacts({});
    expect(facts.phone).toBe(BRAND_PHONE);
    expect(facts.email).toBe(BRAND_EMAIL);
    expect(facts.phone).toBe('+57 300 679 1123');
    expect(facts.email).toBe('daniel@luquelaw.co');
  });
});
