import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PropertyMap, PropertyMarker, MapFallback } from './PropertyMap';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { getBoundsCenter, getBounds, isValidCoordinates } from '@/lib/googleMaps';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';

export interface PropertyForMap {
  id: string;
  title: string;
  address?: string;
  neighborhood?: string;
  city?: string;
  price?: number | string;
  coordinates?: { lat: number; lng: number } | null;
  images?: string[];
  verified?: boolean;
  premium?: boolean;
}

export interface PropertiesMapViewProps {
  properties: PropertyForMap[];
  height?: string;
  onPropertyClick?: (propertyId: string) => void;
}

export const PropertiesMapView: React.FC<PropertiesMapViewProps> = ({
  properties,
  height = '600px',
  onPropertyClick,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded, loadError, hasApiKey } = useGoogleMaps();

  // Filter properties with valid coordinates
  const propertiesWithCoords = useMemo(() => {
    return properties.filter((prop) => isValidCoordinates(prop.coordinates));
  }, [properties]);

  // Calculate center from all properties
  const mapCenter = useMemo(() => {
    const coords = propertiesWithCoords
      .map((p) => p.coordinates)
      .filter(isValidCoordinates) as Array<{ lat: number; lng: number }>;

    return getBoundsCenter(coords);
  }, [propertiesWithCoords]);

  // Convert properties to markers
  const markers: PropertyMarker[] = useMemo(() => {
    return propertiesWithCoords.map((property) => ({
      id: property.id,
      position: property.coordinates!,
      title: property.title,
      price: property.price,
      image: property.images && property.images.length > 0 ? property.images[0] : undefined,
      address: property.address || `${property.neighborhood || ''}, ${property.city || ''}`.trim(),
    }));
  }, [propertiesWithCoords]);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      if (onPropertyClick) {
        onPropertyClick(markerId);
      } else {
        navigate(`/properties/${markerId}`);
      }
    },
    [navigate, onPropertyClick]
  );

  // Loading state
  if (!hasApiKey) {
    return (
      <Card className="flex items-center justify-center" style={{ minHeight: height }}>
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{t('properties.maps.notConfigured')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('properties.maps.notConfiguredHint')}
          </p>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="flex items-center justify-center" style={{ minHeight: height }}>
        <div className="text-center p-8">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('properties.maps.loading')}</p>
        </div>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="flex items-center justify-center" style={{ minHeight: height }}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      </Card>
    );
  }

  // No properties with coordinates
  if (propertiesWithCoords.length === 0) {
    return (
      <Card className="flex items-center justify-center" style={{ minHeight: height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{t('properties.maps.noLocation')}</h3>
          <p className="text-muted-foreground text-sm">
            {t('properties.maps.noLocationHint')}
          </p>
        </div>
      </Card>
    );
  }

  // Calculate zoom based on bounds
  const zoom = propertiesWithCoords.length === 1 ? 15 : 12;

  return (
    <Card className="overflow-hidden" style={{ height }}>
      <PropertyMap
        center={mapCenter}
        zoom={zoom}
        markers={markers}
        height={height}
        onMarkerClick={handleMarkerClick}
        mapContainerStyle={{ width: '100%', height: '100%' }}
      />
    </Card>
  );
};

