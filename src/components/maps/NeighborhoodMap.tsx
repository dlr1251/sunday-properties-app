import { useMemo } from 'react';
import { CATEGORY_META, hasValidMapCoordinates, type NearbyPlace } from '@/lib/nearbyPlaces';
import { approximateNeighborhoodCoords, publicLocationLabel } from '@/utils/publicLocation';
import { FreeMap, escapeHtml } from './FreeMap';

export interface NeighborhoodMapProps {
  coordinates?: { lat: number; lng: number } | null;
  propertyTitle: string;
  neighborhood?: string | null;
  city?: string | null;
  places: NearbyPlace[];
  selectedPlaceId: string | null;
  onSelectPlace: (placeId: string | null) => void;
  heightClassName?: string;
}

export function NeighborhoodMap({
  coordinates,
  propertyTitle,
  neighborhood,
  city,
  places,
  selectedPlaceId,
  onSelectPlace,
  heightClassName = 'h-[280px] sm:h-[360px] lg:h-[420px]',
}: NeighborhoodMapProps) {
  const approx = approximateNeighborhoodCoords(coordinates);
  const locationLabel = publicLocationLabel({ neighborhood, city }) || propertyTitle;
  const hasValidCoordinates = hasValidMapCoordinates(approx);

  const markers = useMemo(() => {
    if (!approx) return [];
    return [
      {
        id: 'neighborhood',
        position: approx,
        color: 'hsl(var(--primary))',
        property: true,
        label: locationLabel,
        popupHtml: `<div style="font: 600 13px Satoshi, sans-serif; color: hsl(var(--foreground))">${escapeHtml(locationLabel)}</div>`,
      },
      ...places.map((place) => ({
        id: place.id,
        position: { lat: place.lat, lng: place.lng },
        color: CATEGORY_META[place.category].color,
        selected: selectedPlaceId === place.id,
        label: place.name,
        popupHtml: `<div style="font: 600 13px Satoshi, sans-serif; color: hsl(var(--foreground))">${escapeHtml(place.name)}</div>${
          place.note
            ? `<div style="font: 12px Satoshi, sans-serif; color: hsl(var(--muted-foreground)); margin-top: 2px">${escapeHtml(place.note)}</div>`
            : ''
        }`,
      })),
    ];
  }, [approx, locationLabel, places, selectedPlaceId]);

  if (!hasValidCoordinates || !approx) {
    return null;
  }

  return (
    <FreeMap
      center={approx}
      zoom={14}
      markers={markers}
      onMarkerClick={(id) => onSelectPlace(id === 'neighborhood' ? null : id)}
      heightClassName={heightClassName}
      overlay={
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-card/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm">
          {locationLabel}
        </div>
      }
    />
  );
}
