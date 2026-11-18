import { describe, expect, it } from 'vitest';

import {
  compareHighlights,
  listingStatsFromHit,
  parseCompareListingsOutput,
  parseListingStatsOutput,
  parseShowListingsOutput,
} from './generative-ui';
import { mapSunnyListing } from './listing-hit';

function rental(overrides: Record<string, unknown> = {}) {
  return mapSunnyListing({
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    slug: 'campo-nuevo',
    title: 'Campo Nuevo',
    listing_type: 'rental',
    neighborhood: 'Campo Nuevo',
    city: 'Medellín',
    bedrooms: 2,
    bathrooms: 2,
    area: 52,
    rent_monthly: 2_450_000,
    admin_fee: 245_000,
    strata: 3,
    images: ['https://cdn.example/campo.jpg'],
    ...overrides,
  });
}

describe('listingStatsFromHit', () => {
  it('omits fields that were never in the data', () => {
    const sparse = mapSunnyListing({
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      slug: 'el-escorial-701',
      title: 'El Escorial 701',
      listing_type: 'rental',
      neighborhood: 'Conquistadores',
      city: 'Medellín',
      bedrooms: 4,
      bathrooms: 3,
      area: 140,
      rent_monthly: 6_000_000,
    });
    const keys = listingStatsFromHit(sparse).map((stat) => stat.key);
    expect(keys).toEqual(['price', 'price_per_m2', 'area', 'bedrooms', 'bathrooms', 'zone']);
    expect(keys).not.toContain('admin_fee');
    expect(keys).not.toContain('strata');
  });

  it('derives COP/m² only when price and area both exist', () => {
    const noArea = rental({ area: null });
    expect(listingStatsFromHit(noArea).some((stat) => stat.key === 'price_per_m2')).toBe(false);
    const stats = listingStatsFromHit(rental());
    expect(stats.find((stat) => stat.key === 'price_per_m2')?.value).toBe(Math.round(2_450_000 / 52));
  });
});

describe('compareHighlights', () => {
  it('marks the largest area and lowest rent among comparable rentals', () => {
    const cheapSmall = rental({ id: '1', slug: 'a', rent_monthly: 2_000_000, area: 40, bedrooms: 1 });
    const big = rental({ id: '2', slug: 'b', rent_monthly: 5_000_000, area: 180, bedrooms: 4 });
    const mid = rental({ id: '3', slug: 'c', rent_monthly: 3_000_000, area: 70, bedrooms: 2 });
    const highlights = compareHighlights([cheapSmall, big, mid]);
    expect(highlights.price).toEqual(['1']);
    expect(highlights.area).toEqual(['2']);
    expect(highlights.bedrooms).toEqual(['2']);
  });

  it('does not compare sale price against monthly rent', () => {
    const sale = mapSunnyListing({
      id: 'sale',
      slug: 'brisas-del-estadio',
      listing_type: 'sale',
      price: 390_000_000,
      area: 45.54,
    });
    const rent = rental({ id: 'rent' });
    const highlights = compareHighlights([sale, rent]);
    expect(highlights.price).toEqual([]);
    expect(highlights.price_per_m2).toEqual([]);
    expect(highlights.area.length).toBeGreaterThan(0);
  });
});

describe('tool output parsers', () => {
  it('drops leaked private fields from UI payloads', () => {
    const listings = parseShowListingsOutput({
      ok: true,
      listings: [
        { ...rental(), minimum_offer_price: 9, address: 'Calle 10' },
        rental({ slug: 'casa-lauret', id: 'safe' }),
      ],
    });
    expect(listings?.map((row) => row.slug)).toEqual(['casa-lauret']);
    expect(parseListingStatsOutput({ listing: rental() })?.slug).toBe('campo-nuevo');
    expect(parseCompareListingsOutput({ listings: [rental(), rental({ id: '2', slug: 'otra' })] })?.listings).toHaveLength(
      2,
    );
  });
});
