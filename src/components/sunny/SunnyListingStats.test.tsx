/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import '../../i18n/config';
import { mapSunnyListing } from '../../lib/sunny/listing-hit';
import { SunnyListingStats } from './SunnyListingStats';

afterEach(() => cleanup());

describe('SunnyListingStats', () => {
  it('renders only fields present on the listing', () => {
    const listing = mapSunnyListing({
      id: 'escorial',
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
    render(
      <MemoryRouter>
        <SunnyListingStats listing={listing} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('sunny-stats')).toBeTruthy();
    expect(screen.getByText('El Escorial 701')).toBeTruthy();
    expect(screen.queryByText(/Administración|Admin fee|Estrato|Stratum/i)).toBeNull();
    expect(screen.getByRole('link', { name: /Ver listado|View listing/i })).toHaveAttribute(
      'href',
      '/properties/el-escorial-701',
    );
  });
});
