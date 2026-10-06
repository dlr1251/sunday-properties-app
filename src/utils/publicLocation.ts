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
