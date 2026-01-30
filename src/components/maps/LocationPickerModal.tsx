import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GoogleMap } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { DEFAULT_CENTER, DEFAULT_ZOOM, isValidCoordinates } from '@/lib/googleMaps';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export interface LocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoordinates?: { lat: number; lng: number } | null;
  onLocationSelect: (coordinates: { lat: number; lng: number }) => void;
  address?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onOpenChange,
  initialCoordinates,
  onLocationSelect,
  address,
}) => {
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialCoordinates || null
  );
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [searchQuery, setSearchQuery] = useState(address || '');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Initialize with initial coordinates or default center
  const center = initialCoordinates && isValidCoordinates(initialCoordinates)
    ? initialCoordinates
    : DEFAULT_CENTER;

  const mapOptions = React.useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      scrollwheel: true,
      zoomControl: true,
      streetViewControl: true,
      mapTypeControl: false,
      fullscreenControl: true,
      mapId: 'LOCATION_PICKER_MAP', // Required for AdvancedMarkerElement
    }),
    []
  );

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newLocation = { lat, lng };

    setSelectedLocation(newLocation);

    // Update marker
    if (map && typeof google !== 'undefined' && google.maps?.marker) {
      // Remove old marker
      if (marker) {
        marker.map = null;
      }

      // Create new marker
      const pinElement = new google.maps.marker.PinElement({
        background: '#3B82F6',
        borderColor: '#FFFFFF',
        glyphColor: '#FFFFFF',
        scale: 1.5,
      });

      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: newLocation,
        content: pinElement.element,
        title: 'Ubicación seleccionada',
      });

      setMarker(newMarker);

      // Reverse geocoding to get address
      if (google.maps.Geocoder) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: newLocation }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setSearchQuery(results[0].formatted_address);
          }
        });
      }
    }
  }, [map, marker]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !map || !google.maps?.Geocoder) return;

    setIsGeocoding(true);
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsGeocoding(false);

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const newLocation = {
          lat: location.lat(),
          lng: location.lng(),
        };

        setSelectedLocation(newLocation);

        // Center map on location
        map.setCenter(newLocation);
        map.setZoom(16);

        // Update marker
        if (marker) {
          marker.map = null;
        }

        if (typeof google !== 'undefined' && google.maps?.marker) {
          const pinElement = new google.maps.marker.PinElement({
            background: '#3B82F6',
            borderColor: '#FFFFFF',
            glyphColor: '#FFFFFF',
            scale: 1.5,
          });

          const newMarker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: newLocation,
            content: pinElement.element,
            title: 'Ubicación seleccionada',
          });

          setMarker(newMarker);
        }
      }
    });
  }, [searchQuery, map, marker]);

  const handleConfirm = useCallback(() => {
    if (selectedLocation && isValidCoordinates(selectedLocation)) {
      onLocationSelect(selectedLocation);
      onOpenChange(false);
    }
  }, [selectedLocation, onLocationSelect, onOpenChange]);

  // Initialize marker when map loads and we have initial coordinates
  useEffect(() => {
    if (!map || !isLoaded || !initialCoordinates || !isValidCoordinates(initialCoordinates)) return;

    if (typeof google !== 'undefined' && google.maps?.marker) {
      const pinElement = new google.maps.marker.PinElement({
        background: '#3B82F6',
        borderColor: '#FFFFFF',
        glyphColor: '#FFFFFF',
        scale: 1.5,
      });

      const newMarker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: initialCoordinates,
        content: pinElement.element,
        title: 'Ubicación seleccionada',
      });

      setMarker(newMarker);
      map.setCenter(initialCoordinates);
      map.setZoom(15);
    }
  }, [map, isLoaded, initialCoordinates]);

  // Cleanup marker on unmount
  useEffect(() => {
    return () => {
      if (marker) {
        marker.map = null;
      }
    };
  }, [marker]);

  // Reset selection when modal closes
  useEffect(() => {
    if (!open && initialCoordinates) {
      setSelectedLocation(initialCoordinates);
    } else if (!open) {
      setSelectedLocation(null);
      setSearchQuery(address || '');
    }
  }, [open, initialCoordinates, address]);

  const canConfirm = selectedLocation && isValidCoordinates(selectedLocation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seleccionar Ubicación en el Mapa
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="address-search">Buscar dirección</Label>
              <Input
                id="address-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                placeholder="Buscar dirección o lugar..."
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={isGeocoding || !searchQuery.trim()}
              >
                {isGeocoding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Buscar'
                )}
              </Button>
            </div>
          </div>

          {/* Map */}
          <Card className="flex-1 min-h-0 overflow-hidden">
            {!hasApiKey ? (
              <div className="flex items-center justify-center h-full">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Google Maps no está configurado. Por favor, configura VITE_MAPS_API_KEY en tu archivo .env
                  </AlertDescription>
                </Alert>
              </div>
            ) : !isLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Cargando mapa...</p>
                </div>
              </div>
            ) : loadError ? (
              <div className="flex items-center justify-center h-full">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loadError}</AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="h-full">
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={center}
                  zoom={DEFAULT_ZOOM}
                  options={mapOptions}
                  onLoad={handleMapLoad}
                  onClick={handleMapClick}
                />
              </div>
            )}
          </Card>

          {/* Selected Coordinates Display */}
          {selectedLocation && isValidCoordinates(selectedLocation) && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Coordenadas seleccionadas</Label>
                  <p className="font-mono text-sm">
                    Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                  </p>
                  {searchQuery && (
                    <p className="text-xs text-muted-foreground mt-1">{searchQuery}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Haz clic en el mapa para seleccionar la ubicación exacta, o busca una dirección en el campo de búsqueda.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            <Check className="h-4 w-4 mr-2" />
            Confirmar Ubicación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

