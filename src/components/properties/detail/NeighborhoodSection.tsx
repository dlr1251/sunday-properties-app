import { useMemo, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/core/ErrorBoundary';
import { NeighborhoodMap } from '@/components/maps/NeighborhoodMap';
import { OpenInGoogleMapsButton } from '@/components/maps/OpenInGoogleMapsButton';
import {
  CATEGORY_META,
  NEARBY_PLACE_CATEGORIES,
  groupPlacesByCategory,
  hasValidMapCoordinates,
  parseNearbyPlaces,
  type NearbyPlaceCategory,
} from '@/lib/nearbyPlaces';
import { publicLocationLabel } from '@/utils/publicLocation';
import { Bus, Cross, GraduationCap, Landmark, Leaf, MapPin, ShoppingBag } from 'lucide-react';

const CATEGORY_ICONS: Record<NearbyPlaceCategory, ComponentType<{ className?: string }>> = {
  parks: Leaf,
  transit: Bus,
  health: Cross,
  commerce: ShoppingBag,
  universities: GraduationCap,
  landmarks: Landmark,
};

export function NeighborhoodSection({
  title,
  neighborhood,
  city,
  coordinates,
  nearbyPlaces,
}: {
  title: string;
  neighborhood?: string | null;
  city?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  nearbyPlaces?: unknown;
}) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<NearbyPlaceCategory | 'all'>('all');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const places = useMemo(() => parseNearbyPlaces(nearbyPlaces), [nearbyPlaces]);
  const visiblePlaces = useMemo(
    () => (activeCategory === 'all' ? places : places.filter((place) => place.category === activeCategory)),
    [activeCategory, places]
  );
  const groupedPlaces = useMemo(() => groupPlacesByCategory(visiblePlaces), [visiblePlaces]);
  const hasCoordinates = hasValidMapCoordinates(coordinates);
  const locationLabel = publicLocationLabel({ neighborhood, city });

  if (!hasCoordinates && places.length === 0) {
    return (
      <Card className="p-6 bg-card">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{t('maps.neighborhoodTitle')}</h2>
              {locationLabel && <p className="text-sm text-muted-foreground mt-1">{locationLabel}</p>}
              <p className="text-sm text-muted-foreground mt-3">{t('maps.noMapYet')}</p>
            </div>
          </div>
          <OpenInGoogleMapsButton neighborhood={neighborhood} city={city} coordinates={coordinates} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-card">
      <div className="p-5 sm:p-6 border-b border-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-brand-sky font-medium">
              {t('maps.surroundings')}
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-1">{t('maps.neighborhoodTitle')}</h2>
            {locationLabel && <p className="text-sm text-muted-foreground mt-1">{locationLabel}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {places.length > 0 && (
              <Badge variant="secondary">{t('maps.placesCount', { count: places.length })}</Badge>
            )}
            <OpenInGoogleMapsButton neighborhood={neighborhood} city={city} coordinates={coordinates} />
          </div>
        </div>
      </div>

      {hasCoordinates && (
        <div className="px-4 pt-4 sm:px-6">
          <ErrorBoundary
            fallback={
              <div className="flex h-[280px] sm:h-[360px] lg:h-[420px] items-center justify-center rounded-xl border border-border bg-muted px-4 text-center">
                <p className="text-sm text-muted-foreground">{t('maps.unavailable')}</p>
              </div>
            }
          >
            <NeighborhoodMap
              coordinates={coordinates}
              propertyTitle={title}
              neighborhood={neighborhood}
              city={city}
              places={visiblePlaces}
              selectedPlaceId={selectedPlaceId}
              onSelectPlace={setSelectedPlaceId}
            />
          </ErrorBoundary>
        </div>
      )}

      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{t('maps.nearbyTitle')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('maps.nearbyHint')}</p>
        </div>

        {places.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/40'
              }`}
            >
              {t('common.all')}
            </button>
            {NEARBY_PLACE_CATEGORIES.filter((category) =>
              places.some((place) => place.category === category)
            ).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-border hover:border-primary/40'
                }`}
              >
                {t(`maps.categories.${category}`)}
              </button>
            ))}
          </div>
        )}

        {places.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg bg-muted px-4 py-3">
            {t('maps.noPlaces')}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedPlaces.map((group) => {
              const Icon = CATEGORY_ICONS[group.category];
              return (
                <div key={group.category} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${CATEGORY_META[group.category].color}1A` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: CATEGORY_META[group.category].color }} />
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      {t(`maps.categories.${group.category}`)}
                    </p>
                  </div>
                  <ul className="space-y-1.5">
                    {group.places.map((place) => {
                      const selected = selectedPlaceId === place.id;
                      return (
                        <li key={place.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedPlaceId(place.id)}
                            className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors ${
                              selected
                                ? 'bg-primary/10 ring-1 ring-primary/20'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <p className="text-sm font-medium text-foreground">{place.name}</p>
                            {place.note && (
                              <p className="text-xs text-muted-foreground mt-0.5">{place.note}</p>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
