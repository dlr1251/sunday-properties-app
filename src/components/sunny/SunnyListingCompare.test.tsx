/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import '../../i18n/config';
import { mapSunnyListing } from '../../lib/sunny/listing-hit';
import { SunnyListingCompare } from './SunnyListingCompare';

afterEach(() => cleanup());

describe('SunnyListingCompare', () => {
  it('renders a comparison table and a price-per-m² chart', () => {
    const listings = [
      mapSunnyListing({
        id: '1',
        slug: 'apartamento-campo-nuevo',
        title: 'Campo Nuevo',
        listing_type: 'rental',
        neighborhood: 'Campo Nuevo',
        city: 'Medellín',
        bedrooms: 2,
        area: 52,
        rent_monthly: 2_450_000,
        admin_fee: 245_000,
      }),
      mapSunnyListing({
        id: '2',
        slug: 'casa-lauret',
        title: 'Casa Lauret',
        listing_type: 'rental',
        neighborhood: 'Laureles',
        city: 'Medellín',
        bedrooms: 4,
        area: 220,
        rent_monthly: 5_200_000,
        admin_fee: 520_000,
      }),
    ];
    render(
      <MemoryRouter>
        <SunnyListingCompare listings={listings} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('sunny-compare')).toBeTruthy();
    expect(screen.getByTestId('sunny-compare-chart')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Campo Nuevo' })).toHaveAttribute(
      'href',
      '/properties/apartamento-campo-nuevo',
    );
  });
});
