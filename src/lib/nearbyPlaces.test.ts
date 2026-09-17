import { describe, it, expect } from 'vitest';
import {
  groupPlacesByCategory,
  hasValidMapCoordinates,
  isPropertyUuid,
  parseNearbyPlaces,
} from './nearbyPlaces';

describe('isPropertyUuid', () => {
  it('accepts a listing UUID', () => {
    expect(isPropertyUuid('abd51c41-a57f-469f-8601-595d003a35c2')).toBe(true);
  });

  it('rejects a slug', () => {
    expect(isPropertyUuid('el-escorial-701')).toBe(false);
  });
});

describe('hasValidMapCoordinates', () => {
  it('accepts Escorial 701 coordinates', () => {
    expect(hasValidMapCoordinates({ lat: 6.2421, lng: -75.5818 })).toBe(true);
  });

  it('rejects missing or zeroed pins', () => {
    expect(hasValidMapCoordinates(null)).toBe(false);
    expect(hasValidMapCoordinates({ lat: 0, lng: 0 })).toBe(false);
  });
});

describe('parseNearbyPlaces', () => {
  it('returns an empty list for missing or invalid payloads', () => {
    expect(parseNearbyPlaces(null)).toEqual([]);
    expect(parseNearbyPlaces(undefined)).toEqual([]);
    expect(parseNearbyPlaces({})).toEqual([]);
    expect(parseNearbyPlaces('[]')).toEqual([]);
  });

  it('keeps valid POIs and drops broken rows', () => {
    const places = parseNearbyPlaces([
      {
        id: 'parques-del-rio',
        name: 'Parques del Río Medellín',
        category: 'parks',
        lat: 6.24368,
        lng: -75.57957,
        note: '8 min a pie',
      },
      { name: 'Sin coordenadas', category: 'transit' },
      { name: 'Categoría inválida', category: 'cafes', lat: 6.24, lng: -75.58 },
    ]);

    expect(places).toHaveLength(1);
    expect(places[0].id).toBe('parques-del-rio');
    expect(places[0].category).toBe('parks');
  });
});

describe('groupPlacesByCategory', () => {
  it('preserves Sunday category order and skips empty groups', () => {
    const groups = groupPlacesByCategory(
      parseNearbyPlaces([
        { name: 'UPB', category: 'universities', lat: 6.24, lng: -75.58 },
        { name: 'Parques del Río', category: 'parks', lat: 6.24, lng: -75.57 },
        { name: 'Metro Exposiciones', category: 'transit', lat: 6.24, lng: -75.57 },
      ])
    );

    expect(groups.map((group) => group.category)).toEqual([
      'parks',
      'transit',
      'universities',
    ]);
  });
});
