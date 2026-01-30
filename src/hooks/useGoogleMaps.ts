import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, hasGoogleMapsKey } from '@/lib/googleMaps';

/**
 * Hook to check if Google Maps is loaded and available
 * This hook uses useJsApiLoader which handles script loading automatically
 */
export function useGoogleMaps() {
  const hasApiKey = hasGoogleMapsKey();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry', 'marker'], // 'marker' required for AdvancedMarkerElement
    version: 'weekly', // Use weekly channel for latest features
  });

  return {
    isLoaded: hasApiKey && isLoaded,
    loadError: hasApiKey ? loadError : 'Google Maps API key no configurada',
    hasApiKey,
  };
}

