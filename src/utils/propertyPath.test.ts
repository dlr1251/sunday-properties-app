import { describe, it, expect } from 'vitest';
import {
  isPropertyUuid,
  slugify,
  propertyKey,
  propertyPath,
  propertyEditPath,
} from './propertyPath';

describe('slugify', () => {
  it('builds readable ASCII slugs from Spanish titles', () => {
    expect(slugify('El Escorial 701 — Arriendo en Conquistadores')).toBe(
      'el-escorial-701-arriendo-en-conquistadores'
    );
    expect(slugify('Brisas del Estadio — Apartamento dúplex en venta')).toBe(
      'brisas-del-estadio-apartamento-duplex-en-venta'
    );
    expect(slugify('Casa Lauret — Arriendo en Laureles')).toBe(
      'casa-lauret-arriendo-en-laureles'
    );
  });

  it('falls back when the title has no letters', () => {
    expect(slugify('???')).toBe('propiedad');
    expect(slugify('')).toBe('propiedad');
  });
});

describe('isPropertyUuid', () => {
  it('detects UUIDs vs readable slugs', () => {
    expect(isPropertyUuid('abd51c41-1234-5678-9abc-def012345678')).toBe(true);
    expect(isPropertyUuid('el-escorial-701')).toBe(false);
  });
});

describe('propertyPath', () => {
  it('prefers slug over id', () => {
    const property = { id: 'abc-uuid', slug: 'el-escorial-701' };
    expect(propertyKey(property)).toBe('el-escorial-701');
    expect(propertyPath(property)).toBe('/properties/el-escorial-701');
    expect(propertyEditPath(property)).toBe('/properties/el-escorial-701/edit');
  });

  it('falls back to id when slug is missing', () => {
    expect(propertyPath({ id: 'abc-uuid' })).toBe('/properties/abc-uuid');
  });
});
