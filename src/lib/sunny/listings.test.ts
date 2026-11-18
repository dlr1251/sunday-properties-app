import { describe, expect, it } from 'vitest';

import { filterSunnyListingHits, mapSunnyListing } from './listings';
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

describe('sunnyCompanyFacts', () => {
  it('uses the brand phone and email Daniel should confirm', () => {
    const facts = sunnyCompanyFacts({});
    expect(facts.phone).toBe(BRAND_PHONE);
    expect(facts.email).toBe(BRAND_EMAIL);
    expect(facts.phone).toBe('+57 300 679 1123');
    expect(facts.email).toBe('daniel@luquelaw.co');
  });
});
