import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { NeighborhoodMap } from './NeighborhoodMap';
import { OpenInGoogleMapsButton } from './OpenInGoogleMapsButton';
import { publicLocationLabel, isValidCoordinates } from '@/utils/publicLocation';

export interface PropertyDetailMapProps {
  propertyId: string;
  title: string;
  neighborhood?: string;
  city?: string;
  coordinates?: { lat: number; lng: number } | null;
  height?: string;
  showHeader?: boolean;
}

export const PropertyDetailMap: React.FC<PropertyDetailMapProps> = ({
  title,
  neighborhood,
  city,
  coordinates,
  showHeader = true,
}) => {
  const { t } = useTranslation();
  const locationText = publicLocationLabel({ neighborhood, city });
  const hasCoords = isValidCoordinates(coordinates);

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <MapPin className="h-5 w-5" />
              {t('maps.location')}
            </CardTitle>
            <OpenInGoogleMapsButton
              neighborhood={neighborhood}
              city={city}
              coordinates={coordinates}
            />
          </div>
          {locationText && (
            <p className="text-sm text-muted-foreground mt-1">{locationText}</p>
          )}
        </CardHeader>
      )}
      <CardContent className={showHeader ? 'p-0 pb-4 px-4' : 'p-4'}>
        {hasCoords ? (
          <NeighborhoodMap
            coordinates={coordinates}
            propertyTitle={title}
            neighborhood={neighborhood}
            city={city}
            places={[]}
            selectedPlaceId={null}
            onSelectPlace={() => undefined}
          />
        ) : (
          <div className="text-center p-6">
            <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {locationText || t('maps.locationUnavailable')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
