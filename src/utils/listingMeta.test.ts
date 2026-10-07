import { describe, expect, it } from 'vitest';
import {
  LISTING_OG_COLUMNS,
  LISTING_OG_FORBIDDEN_COLUMNS,
  LISTING_OG_SELECT,
  applyListingMetaToHtml,
  buildListingMeta,
  fetchPublishedListingForOg,
  firstListingOgImage,
  parseListingSlug,
  formatOgListingPrice,
  genericSiteMeta,
} from './listingMeta';

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="es">
  <head>
    <title>Sunday Properties — Rent and buy in Medellín</title>
    <meta name="description" content="Sunday Properties — rent and buy in Colombia with title documents, verified visits, and transparent negotiation." />
    <meta property="og:title" content="Sunday Properties" />
    <meta property="og:description" content="Rent and buy in Medellín, Colombia — with title, contract, and visit before you commit." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.sundayproperties.co" />
    <meta property="og:image" content="https://www.sundayproperties.co/og-image.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

describe('parseListingSlug', () => {
  it('reads the rewrite query or the public path, never /api/listing-html', () => {
    expect(parseListingSlug('/api/listing-html?slugOrId=el-escorial-701')).toBe('el-escorial-701');
    expect(parseListingSlug('/properties/brisas-del-estadio')).toBe('brisas-del-estadio');
    expect(parseListingSlug('/api/listing-html', 'El-Escorial-701')).toBe('El-Escorial-701');
    expect(parseListingSlug('/api/listing-html')).toBe('');
  });
});

describe('LISTING_OG_COLUMNS', () => {
  it('selects only the explicit public allow-list', () => {
    expect(LISTING_OG_SELECT).toBe(
      'id,slug,title,description,listing_type,price,rent_monthly,neighborhood,city,images,status'
    );
    expect(LISTING_OG_SELECT).not.toContain('*');
    for (const forbidden of LISTING_OG_FORBIDDEN_COLUMNS) {
      expect(LISTING_OG_COLUMNS).not.toContain(forbidden);
      expect(LISTING_OG_SELECT).not.toContain(forbidden);
    }
  });
});

describe('buildListingMeta', () => {
  it('builds rental tags with price, Arriendo, and neighborhood + city only', () => {
    const meta = buildListingMeta({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'el-escorial-701',
      title: 'El Escorial 701 — Arriendo en Conquistadores',
      listing_type: 'rental',
      price: null,
      rent_monthly: 6000000,
      neighborhood: 'Conquistadores',
      city: 'Medellín',
      images: [
        'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/AMELIA-PATINO-_ENTRADA.webp',
      ],
      status: 'published',
      description: 'Se arrienda apartamento en Conquistadores. Carrera 80 No. 12-34, Apto 101.',
    });

    expect(meta).not.toBeNull();
    expect(meta?.ogTitle).toBe('El Escorial 701 — Arriendo en Conquistadores');
    expect(meta?.ogDescription).toMatch(/Arriendo/);
    expect(meta?.ogDescription).toMatch(/6\.000\.000/);
    expect(meta?.ogDescription).toContain('Conquistadores, Medellín');
    expect(meta?.ogDescription).not.toMatch(/Carrera/i);
    expect(meta?.ogDescription).not.toMatch(/Apto/i);
    expect(meta?.ogDescription).not.toMatch(/12-34/);
    expect(meta?.ogUrl).toBe('https://www.sundayproperties.co/properties/el-escorial-701');
    expect(meta?.ogImage).toMatch(/AMELIA-PATINO-_ENTRADA\.webp$/);
    expect(meta?.ogImage).toMatch(/^https:\/\//);
    expect(meta?.twitterCard).toBe('summary_large_image');
    expect(JSON.stringify(meta)).not.toMatch(/minimum_offer_price/i);
    expect(JSON.stringify(meta)).not.toMatch(/owner_id/i);
  });

  it('builds sale tags with Venta and the first raster photo', () => {
    const meta = buildListingMeta({
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'brisas-del-estadio',
      title: 'Brisas del Estadio — Apartamento dúplex en venta',
      listing_type: 'sale',
      price: 390000000,
      rent_monthly: null,
      neighborhood: 'Estadio',
      city: 'Medellín',
      images: [
        'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-01.webp',
      ],
      status: 'published',
    });

    expect(meta?.ogDescription).toMatch(/Venta/);
    expect(meta?.ogDescription).toMatch(/390\.000\.000/);
    expect(meta?.ogDescription).toContain('Estadio, Medellín');
    expect(meta?.ogUrl).toBe('https://www.sundayproperties.co/properties/brisas-del-estadio');
    expect(meta?.ogImage).toMatch(/Brisas-del-Estadio-01\.webp$/);
  });

  it('falls back to generic tags when the listing is missing or unpublished', () => {
    expect(buildListingMeta(null)).toBeNull();
    expect(buildListingMeta({ id: 'x', status: 'draft', title: 'Hidden' })).toBeNull();
    expect(genericSiteMeta().ogImage).toBe('https://www.sundayproperties.co/og-image.png');
    expect(genericSiteMeta().ogImage).not.toMatch(/\.svg(\?|$)/);
  });
});

describe('firstListingOgImage', () => {
  it('skips SVG and requires an absolute https raster URL', () => {
    expect(firstListingOgImage(['https://example.com/card.svg'])).toBeNull();
    expect(firstListingOgImage(['/relative.jpg'])).toMatch(/^https:\/\//);
    expect(firstListingOgImage(['https://cdn.example.com/photo.png'])).toBe(
      'https://cdn.example.com/photo.png'
    );
  });
});

describe('formatOgListingPrice', () => {
  it('uses monthly rent for rentals', () => {
    expect(
      formatOgListingPrice({
        id: 'x',
        listing_type: 'rental',
        price: null,
        rent_monthly: 6000000,
      })
    ).toMatch(/6\.000\.000.*\/mes/);
  });
});

describe('fetchPublishedListingForOg', () => {
  it('loads published listings with only the public column allow-list', async () => {
    const escorial = await fetchPublishedListingForOg('El-Escorial-701');
    const brisas = await fetchPublishedListingForOg('brisas-del-estadio');
    expect(escorial?.slug).toBe('el-escorial-701');
    expect(brisas?.slug).toBe('brisas-del-estadio');
    expect(escorial?.listing_type).toBe('rental');
    expect(brisas?.listing_type).toBe('sale');
    for (const row of [escorial, brisas]) {
      expect(row).toBeTruthy();
      expect(Object.keys(row as object).sort()).toEqual([...LISTING_OG_COLUMNS].sort());
      expect(row).not.toHaveProperty('address');
      expect(row).not.toHaveProperty('minimum_offer_price');
      expect(row).not.toHaveProperty('owner_id');
      expect(row).not.toHaveProperty('coordinates');
    }
    const missing = await fetchPublishedListingForOg('this-listing-does-not-exist');
    expect(missing).toBeNull();
  }, 20_000);
});

describe('applyListingMetaToHtml', () => {
  it('rewrites title and og tags without leaking address or reserve price', () => {
    const meta = buildListingMeta({
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'el-escorial-701',
      title: 'El Escorial 701 — Arriendo en Conquistadores',
      listing_type: 'rental',
      rent_monthly: 6000000,
      neighborhood: 'Conquistadores',
      city: 'Medellín',
      images: ['https://cdn.example.com/escorial.webp'],
      status: 'published',
    });
    const html = applyListingMetaToHtml(SAMPLE_HTML, meta!);
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain('src="/src/main.tsx"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('El Escorial 701');
    expect(html).toContain('summary_large_image');
    expect(html).toContain('https://www.sundayproperties.co/properties/el-escorial-701');
    expect(html).not.toMatch(/minimum_offer_price/i);
    expect(html).not.toMatch(/Carrera 80/i);
    expect(html).not.toMatch(/og-image\.svg/);
  });
});
