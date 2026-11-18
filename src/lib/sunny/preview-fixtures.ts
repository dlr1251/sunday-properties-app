import { mapSunnyListing, type SunnyListingHit } from './listing-hit';

const BRISAS_IMAGES = [
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-01.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-02.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-03.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-04.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-05.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-06.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-07.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/brisas-estadio/Brisas-del-Estadio-08.webp',
];

const ESCORIAL_IMAGES = [
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/AMELIA-PATINO-_ENTRADA.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/AMELIA-PATINO_BIBLIOTECA.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/AMELIA-PATINO_COCINA.webp',
  'https://prtyuwdkrrqhtwolcrav.supabase.co/storage/v1/object/public/property-photos/escorial-701/AMELIA-PATINO_HABITACION.webp',
];

export function previewBrisas(): SunnyListingHit {
  return mapSunnyListing({
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'brisas-del-estadio',
    title: 'Brisas del Estadio — Apartamento dúplex en venta',
    listing_type: 'sale',
    neighborhood: 'Estadio',
    city: 'Medellín',
    bedrooms: 1,
    bathrooms: 2,
    area: 45.54,
    price: 390_000_000,
    admin_fee: 322_000,
    strata: 4,
    images: BRISAS_IMAGES,
  });
}

export function previewEscorial(): SunnyListingHit {
  return mapSunnyListing({
    id: '22222222-2222-4222-8222-222222222222',
    slug: 'el-escorial-701',
    title: 'El Escorial 701 — Arriendo en Conquistadores',
    listing_type: 'rental',
    neighborhood: 'Conquistadores',
    city: 'Medellín',
    bedrooms: 4,
    bathrooms: 3,
    area: 140,
    rent_monthly: 6_000_000,
    images: ESCORIAL_IMAGES,
  });
}

export function previewCasaLauret(): SunnyListingHit {
  return mapSunnyListing({
    id: '33333333-3333-4333-8333-333333333333',
    slug: 'casa-lauret',
    title: 'Casa Lauret — Arriendo en Laureles',
    listing_type: 'rental',
    neighborhood: 'Laureles',
    city: 'Medellín',
    bedrooms: 4,
    bathrooms: 3,
    area: 220,
    rent_monthly: 5_200_000,
    admin_fee: 520_000,
    strata: 4,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop',
    ],
  });
}

export function previewCampoNuevo(): SunnyListingHit {
  return mapSunnyListing({
    id: '44444444-4444-4444-8444-444444444444',
    slug: 'apartamento-campo-nuevo',
    title: 'Apartamento Campo Nuevo — Arriendo',
    listing_type: 'rental',
    neighborhood: 'Campo Nuevo',
    city: 'Medellín',
    bedrooms: 2,
    bathrooms: 2,
    area: 52,
    rent_monthly: 2_450_000,
    admin_fee: 245_000,
    strata: 3,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  });
}

export type SunnyPreviewMode = 'markdown' | 'listings' | 'stats' | 'compare';

export function parseSunnyPreviewMode(search: string): SunnyPreviewMode | null {
  const raw = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search).get('sunny_preview');
  if (!raw) return null;
  if (raw === 'listings' || raw === 'stats' || raw === 'compare') return raw;
  if (raw === '1' || raw === 'true') return 'markdown';
  return null;
}

export type PreviewChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<
    | { type: 'text'; text: string }
    | { type: 'tool'; name: string; callId: string; state: 'completed'; output: unknown }
  >;
};

export function previewMessages(mode: SunnyPreviewMode): PreviewChatMessage[] {
  if (mode === 'markdown') {
    return [
      {
        id: 'preview-user',
        role: 'user',
        parts: [{ type: 'text', text: '¿Tienen un 3 habitaciones en El Poblado?' }],
      },
      {
        id: 'preview-sunny',
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: 'Sí. **El Escorial 701** es un 3 habitaciones publicado en El Poblado.\n\n→ /properties/el-escorial-701',
          },
        ],
      },
    ];
  }

  if (mode === 'listings') {
    const listings = [previewBrisas(), previewEscorial()];
    return [
      {
        id: 'preview-user-listings',
        role: 'user',
        parts: [{ type: 'text', text: 'Muéstrame fotos de Brisas del Estadio y El Escorial.' }],
      },
      {
        id: 'preview-sunny-listings',
        role: 'assistant',
        parts: [
          {
            type: 'tool',
            name: 'show_listings',
            callId: 'preview-show',
            state: 'completed',
            output: { ok: true, listings },
          },
          {
            type: 'text',
            text: 'Estas son las fotos publicadas de **Brisas del Estadio** y **El Escorial 701**.',
          },
        ],
      },
    ];
  }

  if (mode === 'stats') {
    const listing = previewBrisas();
    return [
      {
        id: 'preview-user-stats',
        role: 'user',
        parts: [{ type: 'text', text: '¿Cuánto cuesta el m² de Brisas del Estadio?' }],
      },
      {
        id: 'preview-sunny-stats',
        role: 'assistant',
        parts: [
          {
            type: 'tool',
            name: 'listing_stats',
            callId: 'preview-stats',
            state: 'completed',
            output: { ok: true, listing },
          },
          {
            type: 'text',
            text: 'Cifras publicadas de **Brisas del Estadio**. El precio por m² sale de precio y área; no hay más campos inventados.',
          },
        ],
      },
    ];
  }

  const listings = [previewEscorial(), previewCasaLauret(), previewCampoNuevo()];
  return [
    {
      id: 'preview-user-compare',
      role: 'user',
      parts: [{ type: 'text', text: 'Compara estos tres arriendos.' }],
    },
    {
      id: 'preview-sunny-compare',
      role: 'assistant',
      parts: [
        {
          type: 'tool',
          name: 'compare_listings',
          callId: 'preview-compare',
          state: 'completed',
          output: { ok: true, listings },
        },
        {
          type: 'text',
          text: 'Comparación de tres arriendos publicados. Destaco el menor precio/m² y el área más grande solo cuando el dato existe.',
        },
      ],
    },
  ];
}
