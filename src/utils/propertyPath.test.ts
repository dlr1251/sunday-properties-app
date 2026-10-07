import { describe, it, expect } from 'vitest';
import {
  applyPropertyKeyFilter,
  isPropertyUuid,
  propertyEditPath,
  propertyKey,
  propertyKeyRedirectPath,
  propertyPath,
  slugify,
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

describe('propertyKeyRedirectPath', () => {
  it('redirects mixed-case slugs to the lowercase URL', () => {
    expect(propertyKeyRedirectPath('El-Escorial-701')).toBe('/properties/el-escorial-701');
    expect(propertyKeyRedirectPath('El-Escorial-701', '/edit')).toBe(
      '/properties/el-escorial-701/edit'
    );
    expect(propertyKeyRedirectPath('el-escorial-701')).toBeNull();
    expect(propertyKeyRedirectPath('abd51c41-1234-5678-9abc-def012345678')).toBeNull();
  });
});

describe('applyPropertyKeyFilter', () => {
  it('uses ilike for slugs and eq for UUIDs', () => {
    const slugCalls: Array<[string, string]> = [];
    const uuidCalls: Array<[string, string]> = [];
    const slugQuery = {
      eq(column: string, value: string) {
        uuidCalls.push([column, value]);
        return slugQuery;
      },
      ilike(column: string, value: string) {
        slugCalls.push([column, value]);
        return slugQuery;
      },
    };
    applyPropertyKeyFilter(slugQuery, 'El-Escorial-701');
    expect(slugCalls).toEqual([['slug', 'El-Escorial-701']]);
    expect(uuidCalls).toEqual([]);

    applyPropertyKeyFilter(slugQuery, 'abd51c41-1234-5678-9abc-def012345678');
    expect(uuidCalls).toEqual([['id', 'abd51c41-1234-5678-9abc-def012345678']]);
  });
});
