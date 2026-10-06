export type PublicLocationSource = {
  neighborhood?: string | null;
  city?: string | null;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

const MEDELLIN_CENTER: Coordinates = { lat: 6.2476, lng: -75.5658 };

/** Strip combining marks so "Medellín" matches "Medellin". */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function publicLocationLabel(
  source: PublicLocationSource | null | undefined
): string {
  if (!source) return '';
  return [source.neighborhood, source.city].filter(Boolean).join(', ');
}

export function matchesPublicLocation(
  source: PublicLocationSource | null | undefined,
  query: string
): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const haystack = normalizeSearch(
    [source?.neighborhood, source?.city].filter(Boolean).join(' ')
  );
  return haystack.includes(needle);
}

/**
 * ~1.1 km grid — enough to place a pin in the neighborhood without
 * revealing a street or apartment.
 */
export function approximateNeighborhoodCoords(
  coords: Coordinates | null | undefined
): Coordinates | null {
  if (!isValidCoordinates(coords)) return null;
  return {
    lat: Math.round(coords.lat * 100) / 100,
    lng: Math.round(coords.lng * 100) / 100,
  };
}

export function isValidCoordinates(
  coords: Coordinates | null | undefined
): coords is Coordinates {
  if (!coords) return false;
  return (
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    Number.isFinite(coords.lat) &&
    Number.isFinite(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180 &&
    !(coords.lat === 0 && coords.lng === 0)
  );
}

export function getBoundsCenter(
  coordinates: Array<Coordinates | null | undefined>
): Coordinates {
  const valid = coordinates.filter(isValidCoordinates);
  if (valid.length === 0) return MEDELLIN_CENTER;
  return {
    lat: valid.reduce((sum, coord) => sum + coord.lat, 0) / valid.length,
    lng: valid.reduce((sum, coord) => sum + coord.lng, 0) / valid.length,
  };
}

export function googleMapsNeighborhoodUrl(options: {
  neighborhood?: string | null;
  city?: string | null;
  coordinates?: Coordinates | null;
}): string {
  const label = publicLocationLabel(options);
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}`;
  }
  const approx = approximateNeighborhoodCoords(options.coordinates);
  if (approx) {
    return `https://www.google.com/maps/search/?api=1&query=${approx.lat},${approx.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Medellín, Colombia')}`;
}

export const DEFAULT_MAP_CENTER = MEDELLIN_CENTER;
export const DEFAULT_MAP_ZOOM = 12;

const STREET_TYPE =
  '(?:carrera|cra\\.?|cr\\.?|calle|cll\\.?|cl\\.?|transversal|tv\\.?|diagonal|dg\\.?|avenida|av\\.?|circular|circ\\.?|autopista)';

const UNIT_RE = new RegExp(
  String.raw`\b(?:apto\.?|apt\.?|apartamento|apart\.?|interior|int\.?|torre|unidad)\s*#?\s*\d+[a-z]?\b`,
  'gi'
);

const HOUSE_NO_RE = /\b(?:no\.?|#|n[úu]mero)\s*\d+\s*-\s*\d+\b/gi;

const FULL_ADDRESS_RE = new RegExp(
  String.raw`\b${STREET_TYPE}\s+\d+[a-z]?\s*(?:no\.?|#|n[úu]mero)\s*\d+(?:\s*-\s*\d+)?`,
  'gi'
);

const STREET_PLUS_NUMBER_RE = new RegExp(
  String.raw`\b${STREET_TYPE}\s+\d+[a-z]?\b`,
  'gi'
);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractAddressFragments(address: string): string[] {
  const fragments = new Set<string>();
  const trimmed = address.trim();
  if (trimmed) fragments.add(trimmed);

  for (const chunk of address.split(',')) {
    const part = chunk.trim();
    if (part.length >= 4) fragments.add(part);
  }

  const street = address.match(new RegExp(`${STREET_TYPE}\\s+\\d+[a-z]?`, 'i'));
  if (street) fragments.add(street[0]);

  const unit = address.match(
    /(?:apto\.?|apt\.?|apartamento|interior|int\.?|torre)\s*#?\s*\d+[a-z]?/i
  );
  if (unit) fragments.add(unit[0]);

  const house = address.match(/(?:no\.?|#|n[úu]mero)\s*\d+\s*-\s*\d+/i);
  if (house) fragments.add(house[0]);

  return [...fragments].sort((a, b) => b.length - a.length);
}

function tidyPublicText(value: string): string {
  return value
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,.;]){2,}/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+\+\s+/g, ' ')
    .replace(/^[\s,;:+-]+/gm, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\bsobre\s+(?:la|el)\s*,/gi, '')
    .replace(/\s+,/g, ',')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

/**
 * Strip street, house number, and apartment identifiers from public copy.
 * Landmark corridors without a house number are also generalized so a
 * listing never publishes its own via or unit.
 */
export function sanitizePublicDescription(
  text: string | null | undefined,
  address?: string | null
): string {
  if (!text) return '';
  let out = String(text);

  if (address) {
    for (const fragment of extractAddressFragments(address)) {
      out = out.replace(new RegExp(escapeRegExp(fragment), 'gi'), ' ');
    }
  }

  out = out.replace(FULL_ADDRESS_RE, ' ');
  out = out.replace(UNIT_RE, ' ');
  out = out.replace(HOUSE_NO_RE, ' ');
  out = out.replace(STREET_PLUS_NUMBER_RE, ' ');

  return tidyPublicText(out);
}
