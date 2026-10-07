import { describe, expect, it } from 'vitest';
import {
  PUBLIC_PROPERTY_COLUMNS,
  PUBLIC_PROPERTY_EMBED,
  PUBLIC_PROPERTY_SELECT,
  SENSITIVE_PROPERTY_COLUMNS,
  mapPublicProperty,
  publicMapCoordinates,
} from './propertyPrivacy';

describe('public property columns', () => {
  it('never includes exact addresses, offer floors, owner ids, legal docs, or deposits', () => {
    for (const column of SENSITIVE_PROPERTY_COLUMNS) {
      expect(PUBLIC_PROPERTY_COLUMNS).not.toContain(column);
      expect(PUBLIC_PROPERTY_SELECT.split(',')).not.toContain(column);
      expect(PUBLIC_PROPERTY_EMBED.split(',')).not.toContain(column);
    }
  });

  it('keeps the fields public listing pages and maps need', () => {
    for (const column of [
      'id',
      'slug',
      'title',
      'description',
      'neighborhood',
      'city',
      'public_coordinates',
      'price',
      'rent_monthly',
      'listing_type',
      'images',
      'nearby_places',
      'status',
    ]) {
      expect(PUBLIC_PROPERTY_COLUMNS).toContain(column);
    }
  });
});

describe('mapPublicProperty', () => {
  it('exposes only neighborhood-level coordinates and strips secrets', () => {
    const mapped = mapPublicProperty({
      id: '1',
      title: 'Brisas',
      public_coordinates: { lat: 6.26, lng: -75.59 },
      coordinates: { lat: 6.2643, lng: -75.5875 },
      address: 'Carrera 70 No. 1-23',
      minimum_offer_price: 370000000,
      owner_id: 'owner-1',
      deposit: 4900000,
    });

    expect(mapped.coordinates).toEqual({ lat: 6.26, lng: -75.59 });
    expect(mapped).not.toHaveProperty('address');
    expect(mapped).not.toHaveProperty('minimum_offer_price');
    expect(mapped).not.toHaveProperty('owner_id');
    expect(mapped).not.toHaveProperty('deposit');
  });
});

describe('publicMapCoordinates', () => {
  it('prefers the stored neighborhood pin over a precise building pin', () => {
    expect(
      publicMapCoordinates({
        public_coordinates: { lat: 6.26, lng: -75.59 },
        coordinates: { lat: 6.2643123, lng: -75.5875456 },
      })
    ).toEqual({ lat: 6.26, lng: -75.59 });
  });
});
