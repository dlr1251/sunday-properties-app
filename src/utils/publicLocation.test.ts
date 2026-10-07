import { describe, expect, it } from 'vitest';
import {
  approximateNeighborhoodCoords,
  googleMapsNeighborhoodUrl,
  matchesPublicLocation,
  normalizeSearch,
  publicLocationLabel,
  sanitizePublicDescription,
} from './publicLocation';

describe('publicLocationLabel', () => {
  it('joins neighborhood and city', () => {
    expect(publicLocationLabel({ neighborhood: 'Laureles', city: 'Medellín' })).toBe(
      'Laureles, Medellín'
    );
  });

  it('omits missing parts and never invents a street', () => {
    expect(publicLocationLabel({ neighborhood: 'Laureles' })).toBe('Laureles');
    expect(publicLocationLabel({ city: 'Medellín' })).toBe('Medellín');
    expect(publicLocationLabel({})).toBe('');
  });
});

describe('normalizeSearch / matchesPublicLocation', () => {
  it('matches Medellín with or without accent', () => {
    expect(normalizeSearch('Medellín')).toBe('medellin');
    expect(matchesPublicLocation({ city: 'Medellín', neighborhood: 'Laureles' }, 'Medellin')).toBe(
      true
    );
    expect(matchesPublicLocation({ city: 'Medellín', neighborhood: 'Laureles' }, 'laureles')).toBe(
      true
    );
    expect(matchesPublicLocation({ city: 'Medellín', neighborhood: 'Laureles' }, 'bogota')).toBe(
      false
    );
  });
});

describe('approximateNeighborhoodCoords', () => {
  it('rounds to neighborhood-level precision', () => {
    expect(
      approximateNeighborhoodCoords({ lat: 6.2476123, lng: -75.5658456 })
    ).toEqual({ lat: 6.25, lng: -75.57 });
  });
});

describe('googleMapsNeighborhoodUrl', () => {
  it('uses neighborhood + city, never a street address', () => {
    const url = googleMapsNeighborhoodUrl({
      neighborhood: 'Laureles',
      city: 'Medellín',
      coordinates: { lat: 6.2476123, lng: -75.5658456 },
    });
    expect(url).toContain('Laureles');
    expect(url).toContain('Medell');
    expect(url).not.toContain('Carrera');
    expect(url).not.toContain('6.2476123');
  });
});

describe('sanitizePublicDescription', () => {
  it('redacts apartment, house number, and the listing street', () => {
    const raw =
      'Apto 101 + parqueadero privado. El conjunto está sobre la Carrera 80. Dirección: Carrera 80 No. 12-34.';
    const clean = sanitizePublicDescription(raw, 'Carrera 80 No. 12-34, Apto 101');
    expect(clean).not.toMatch(/Carrera\s*80/i);
    expect(clean).not.toMatch(/Apto\s*101/i);
    expect(clean).not.toMatch(/No\.\s*12-34/i);
    expect(clean).not.toMatch(/sobre la,/i);
    expect(clean).toMatch(/parqueadero/i);
  });

  it('keeps neighborhood prose that is not a street address', () => {
    const raw = 'En Estadio, cerca del Metro y del Atanasio Girardot.';
    expect(sanitizePublicDescription(raw)).toBe(raw);
  });
});
