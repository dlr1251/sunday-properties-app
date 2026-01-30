/**
 * Google Maps configuration and utilities
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || '';

export const DEFAULT_CENTER = {
  lat: 6.2476, // Medellín, Colombia
  lng: -75.5658,
};

export const DEFAULT_ZOOM = 12;

export const COLOMBIA_BOUNDS = {
  north: 12.5,
  south: -4.0,
  east: -66.0,
  west: -82.0,
};

/**
 * Check if Google Maps API key is configured
 */
export function hasGoogleMapsKey(): boolean {
  return !!GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key';
}

/**
 * Get Google Maps script URL with API key
 */
export function getGoogleMapsScriptUrl(libraries: string[] = ['places', 'geometry', 'marker']): string {
  const apiKey = GOOGLE_MAPS_API_KEY;
  const libs = libraries.join(',');
  return `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}`;
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coords: { lat: number; lng: number } | null | undefined): boolean {
  if (!coords) return false;
  return (
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    !isNaN(coords.lat) &&
    !isNaN(coords.lng) &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  );
}

/**
 * Get center point from multiple coordinates
 */
export function getBoundsCenter(coordinates: Array<{ lat: number; lng: number }>): { lat: number; lng: number } {
  if (coordinates.length === 0) return DEFAULT_CENTER;

  const validCoords = coordinates.filter(isValidCoordinates);
  if (validCoords.length === 0) return DEFAULT_CENTER;

  const latSum = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
  const lngSum = validCoords.reduce((sum, coord) => sum + coord.lng, 0);

  return {
    lat: latSum / validCoords.length,
    lng: lngSum / validCoords.length,
  };
}

/**
 * Get bounds from multiple coordinates
 */
export function getBounds(coordinates: Array<{ lat: number; lng: number }>): google.maps.LatLngBounds | null {
  if (coordinates.length === 0) return null;

  const validCoords = coordinates.filter(isValidCoordinates);
  if (validCoords.length === 0) return null;

  const bounds = new google.maps.LatLngBounds();

  validCoords.forEach((coord) => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  });

  return bounds;
}

