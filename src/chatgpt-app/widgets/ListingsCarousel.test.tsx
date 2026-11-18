/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import '../../i18n/config';
import { mapSunnyListing } from '../../lib/sunny/listing-hit';
import { ListingsCarousel } from './ListingsCarousel';

afterEach(() => cleanup());

describe('ListingsCarousel', () => {
  it('renders carousel cards with listing and visit CTAs', () => {
    const listing = mapSunnyListing({
      id: 'brisas',
      slug: 'brisas-del-estadio',
      title: 'Brisas del Estadio',
      listing_type: 'sale',
      neighborhood: 'Estadio',
      city: 'Medellín',
      price: 390_000_000,
      area: 45.54,
      bedrooms: 1,
      bathrooms: 2,
      images: ['https://cdn.example/brisas.webp'],
    });
    render(
      <MemoryRouter>
        <ListingsCarousel listings={[listing]} />
      </MemoryRouter>,
    );
    expect(screen.getByTestId('sunday-listings')).toBeTruthy();
    expect(screen.getByTestId('sunny-listing-card')).toBeTruthy();
    expect(screen.getByRole('link', { name: /Ver listado|View listing/i })).toHaveAttribute(
      'href',
      '/properties/brisas-del-estadio',
    );
    expect(screen.getByRole('link', { name: /Agendar visita|Schedule visit/i })).toBeTruthy();
  });
});
