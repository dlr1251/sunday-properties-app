import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyMap, PropertyMarker, MapFallback } from './PropertyMap';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { isValidCoordinates, DEFAULT_CENTER } from '@/lib/googleMaps';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, AlertCircle, ExternalLink } from 'lucide-react';

export interface PropertyDetailMapProps {
  propertyId: string;
  title: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  coordinates?: { lat: number; lng: number } | null;
  image?: string;
  height?: string;
  showHeader?: boolean;
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({
  propertyId,
  title,
  address,
  neighborhood,
  city,
  coordinates,
  image,
  height = '400px',
  showHeader = true,
}) => {
  const navigate = useNavigate();
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();

  const hasValidCoordinates = isValidCoordinates(coordinates);

  const handleOpenInGoogleMaps = () => {
    if (!hasValidCoordinates) return;

    const { lat, lng } = coordinates!;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const handleMarkerClick = () => {
    navigate(`/properties/${propertyId}`);
  };

  // No API key
  if (!hasApiKey) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center p-4">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Google Maps no está configurado
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading
  if (!isLoaded) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center" style={{ minHeight: height }}>
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Cargando mapa...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (loadError) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // No coordinates
  if (!hasValidCoordinates) {
    return (
      <Card>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center p-4">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              {address || `${neighborhood || ''}, ${city || ''}`.trim() || 'Dirección no disponible'}
            </p>
            <p className="text-xs text-muted-foreground">
              Coordenadas no disponibles
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create marker for this property
  const marker: PropertyMarker = {
    id: propertyId,
    position: coordinates!,
    title,
    address: address || `${neighborhood || ''}, ${city || ''}`.trim(),
    image,
  };

  const locationText = address || `${neighborhood || ''}, ${city || ''}`.trim();

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInGoogleMaps}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Abrir en Google Maps
            </Button>
          </div>
          {locationText && (
            <p className="text-sm text-muted-foreground mt-1">{locationText}</p>
          )}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div style={{ height }}>
          <PropertyMap
            center={coordinates!}
            zoom={15}
            markers={[marker]}
            height={height}
            onMarkerClick={handleMarkerClick}
            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0 0 8px 8px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

