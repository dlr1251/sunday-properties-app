import React, { useMemo, useRef, useEffect } from 'react';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import { DEFAULT_CENTER, DEFAULT_ZOOM, isValidCoordinates } from '@/lib/googleMaps';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertCircle } from 'lucide-react';

export interface PropertyMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  price?: number | string;
  image?: string;
  address?: string;
  onClick?: () => void;
}

export interface PropertyMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: PropertyMarker[];
  height?: string;
  className?: string;
  onMarkerClick?: (markerId: string) => void;
  mapContainerStyle?: React.CSSProperties;
}

const defaultMapContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};

/**
 * Internal component that creates AdvancedMarkerElement instances
 */
const MapMarkers: React.FC<{
  map: google.maps.Map | null;
  markers: PropertyMarker[];
  selectedMarkerId: string | null;
  onMarkerClick: (markerId: string) => void;
}> = ({ map, markers, selectedMarkerId, onMarkerClick }) => {
  const markerInstancesRef = useRef<Map<string, {
    element: google.maps.marker.AdvancedMarkerElement;
    pinElement: google.maps.marker.PinElement;
  }>>(new Map());

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps?.marker) return;

    // Create or update markers
    markers.forEach((marker) => {
      if (!isValidCoordinates(marker.position)) return;

      const isSelected = selectedMarkerId === marker.id;
      const existing = markerInstancesRef.current.get(marker.id);

      if (existing) {
        // Update existing marker
        try {
          existing.pinElement.background = isSelected ? '#EF4444' : '#3B82F6';
          existing.pinElement.scale = isSelected ? 1.25 : 1;
          existing.element.position = marker.position;
          existing.element.title = marker.title;
        } catch (error) {
          console.error('Error updating marker:', error);
          // If update fails, remove and recreate
          try {
            existing.element.map = null;
          } catch (e) {
            // Ignore cleanup errors
          }
          markerInstancesRef.current.delete(marker.id);
          // Will be recreated below
        }
      }

      // Create new marker if it doesn't exist or update failed
      if (!markerInstancesRef.current.has(marker.id)) {
        try {
          const pinElement = new google.maps.marker.PinElement({
            background: isSelected ? '#EF4444' : '#3B82F6',
            borderColor: '#FFFFFF',
            glyphColor: '#FFFFFF',
            scale: isSelected ? 1.25 : 1,
          });

          const advancedMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: marker.position,
            title: marker.title,
            content: pinElement.element,
          });

          advancedMarker.addListener('click', () => {
            onMarkerClick(marker.id);
          });

          markerInstancesRef.current.set(marker.id, {
            element: advancedMarker,
            pinElement,
          });
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      }
    });

    // Remove markers that are no longer in the list
    markerInstancesRef.current.forEach((instance, markerId) => {
      const stillExists = markers.some((m) => m.id === markerId);
      if (!stillExists) {
        try {
          if (instance.element && map && map.getDiv()) {
            // Only remove if map is still valid
            instance.element.map = null;
          }
        } catch (error) {
          // Map or marker might already be destroyed, ignore
        }
        markerInstancesRef.current.delete(markerId);
      }
    });
  }, [map, markers, selectedMarkerId, onMarkerClick]);

  // Cleanup effect - only clean up if map still exists
  useEffect(() => {
    return () => {
      // Only cleanup if we have a valid map reference
      if (!map) {
        markerInstancesRef.current.clear();
        return;
      }

      // Clean up markers one by one, catching any errors
      const instancesToClean = Array.from(markerInstancesRef.current.entries());
      instancesToClean.forEach(([markerId, instance]) => {
        try {
          // Try to check if map is still valid before removing marker
          if (instance.element) {
            // Set map to null to remove marker
            instance.element.map = null;
          }
        } catch (error) {
          // Ignore errors during cleanup - map/marker might already be destroyed
        }
      });
      markerInstancesRef.current.clear();
    };
  }, [map]);

  return null; // This component doesn't render anything
};

export const PropertyMap: React.FC<PropertyMapProps> = ({
  center,
  zoom = DEFAULT_ZOOM,
  markers = [],
  height = '100%',
  className = '',
  onMarkerClick,
  mapContainerStyle = defaultMapContainerStyle,
}) => {
  const { isLoaded } = useGoogleMaps();
  const [selectedMarker, setSelectedMarker] = React.useState<string | null>(null);
  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const mapCenter = useMemo(() => {
    if (isValidCoordinates(center)) {
      return center;
    }
    return DEFAULT_CENTER;
  }, [center]);

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      mapId: 'PROPERTY_MAP', // Required for AdvancedMarkerElement
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    }),
    []
  );

  const handleMarkerClick = (markerId: string) => {
    setSelectedMarker(markerId === selectedMarker ? null : markerId);
    if (onMarkerClick) {
      onMarkerClick(markerId);
    }
  };

  const handleMapLoad = (mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  };

  const formatPrice = (price?: number | string): string => {
    if (!price) return 'Precio no disponible';
    if (typeof price === 'string') {
      const numPrice = parseInt(price.replace(/\D/g, ''), 10);
      if (isNaN(numPrice)) return price;
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(numPrice);
    }
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const selectedMarkerData = markers.find((m) => m.id === selectedMarker);

  return (
    <div className={className} style={{ height, position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={{ ...mapContainerStyle, height }}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {map && isLoaded && typeof google !== 'undefined' && google.maps?.marker && (
          <MapMarkers
            map={map}
            markers={markers}
            selectedMarkerId={selectedMarker}
            onMarkerClick={handleMarkerClick}
          />
        )}
        {selectedMarkerData && (
          <InfoWindow
            position={selectedMarkerData.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="p-2 max-w-xs">
              {selectedMarkerData.image && (
                <img
                  src={selectedMarkerData.image}
                  alt={selectedMarkerData.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-sm mb-1">{selectedMarkerData.title}</h3>
              {selectedMarkerData.address && (
                <p className="text-xs text-muted-foreground mb-1">{selectedMarkerData.address}</p>
              )}
              {selectedMarkerData.price && (
                <p className="text-sm font-medium text-primary">{formatPrice(selectedMarkerData.price)}</p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

/**
 * Fallback component when Google Maps is not available
 */
export const MapFallback: React.FC<{ message?: string }> = ({ message = 'Mapa no disponible' }) => {
  return (
    <Card className="flex items-center justify-center" style={{ minHeight: '400px' }}>
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
};
