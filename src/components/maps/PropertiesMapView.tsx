import { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { PropertyMap, type PropertyMarker } from './PropertyMap';
import { OpenInGoogleMapsButton } from './OpenInGoogleMapsButton';
import { propertyPath } from '@/utils/propertyPath';
import {
  getBoundsCenter,
  isValidCoordinates,
  publicLocationLabel,
} from '@/utils/publicLocation';
import { publicMapCoordinates } from '@/lib/propertyPrivacy';

export interface PropertyForMap {
  id: string;
  slug?: string | null;
  title: string;
  neighborhood?: string;
  city?: string;
  price?: number | string;
  coordinates?: { lat: number; lng: number } | null;
  public_coordinates?: { lat: number; lng: number } | null;
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

  const propertiesWithCoords = useMemo(() => {
    return properties
      .map((property) => ({
        ...property,
        approx: publicMapCoordinates(property),
      }))
      .filter((property) => isValidCoordinates(property.approx));
  }, [properties]);

  const mapCenter = useMemo(() => {
    return getBoundsCenter(propertiesWithCoords.map((property) => property.approx));
  }, [propertiesWithCoords]);

  const markers: PropertyMarker[] = useMemo(() => {
    return propertiesWithCoords.map((property) => ({
      id: property.id,
      position: property.approx!,
      title: property.title,
      price: property.price,
      image: property.images && property.images.length > 0 ? property.images[0] : undefined,
      location: publicLocationLabel(property),
    }));
  }, [propertiesWithCoords]);

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      const match = properties.find((property) => property.id === markerId);
      const key = match?.slug || markerId;
      if (onPropertyClick) {
        onPropertyClick(key);
      } else {
        navigate(match ? propertyPath(match) : `/properties/${markerId}`);
      }
    },
    [navigate, onPropertyClick, properties]
  );

  const first = propertiesWithCoords[0];
  const single = propertiesWithCoords.length === 1;

  if (propertiesWithCoords.length === 0) {
    return (
      <Card className="flex items-center justify-center bg-card" style={{ minHeight: height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">{t('properties.maps.noLocation')}</h3>
          <p className="text-muted-foreground text-sm">{t('properties.maps.noLocationHint')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden" style={{ height }}>
      <div className="absolute left-3 top-3 z-10">
        <OpenInGoogleMapsButton
          neighborhood={single ? first?.neighborhood : undefined}
          city={single ? first?.city : first?.city || 'Medellín'}
          coordinates={mapCenter}
        />
      </div>
      <PropertyMap
        center={mapCenter}
        zoom={single ? 14 : 12}
        markers={markers}
        height={height}
        onMarkerClick={handleMarkerClick}
      />
    </Card>
  );
};
