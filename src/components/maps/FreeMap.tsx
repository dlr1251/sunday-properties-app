import { useEffect, useRef, useState, type ReactNode } from 'react';
import maplibregl, { type Map as MapLibreMap, type Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { OPENFREEMAP_STYLE_URL, OSM_RASTER_STYLE } from '@/lib/mapLibre';
import { isValidCoordinates, type Coordinates } from '@/utils/publicLocation';

export interface FreeMapMarker {
  id: string;
  position: Coordinates;
  color?: string;
  selected?: boolean;
  property?: boolean;
  label: string;
  popupHtml?: string;
}

interface FreeMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: FreeMapMarker[];
  onMarkerClick?: (id: string) => void;
  onMapClick?: (coords: Coordinates) => void;
  heightClassName?: string;
  className?: string;
  overlay?: ReactNode;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function createPinElement(options: {
  color: string;
  selected?: boolean;
  property?: boolean;
  label: string;
}): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', options.label);
  const size = options.property ? 22 : options.selected ? 18 : 14;
  button.style.cssText = [
    'border: 2px solid hsl(var(--card))',
    `background: ${options.color}`,
    `width: ${size}px`,
    `height: ${size}px`,
    'border-radius: 9999px',
    'box-shadow: 0 8px 18px hsl(var(--foreground) / 0.18)',
    'padding: 0',
    'cursor: pointer',
    options.property ? 'outline: 3px solid hsl(var(--brand-gold))' : '',
    options.selected && !options.property ? 'outline: 2px solid hsl(var(--primary))' : '',
    'transform: translateY(2px)',
  ]
    .filter(Boolean)
    .join(';');
  return button;
}

export function FreeMap({
  center,
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  heightClassName = 'h-[280px] sm:h-[360px] lg:h-[420px]',
  className = '',
  overlay,
}: FreeMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMapClickRef = useRef(onMapClick);
  onMarkerClickRef.current = onMarkerClick;
  onMapClickRef.current = onMapClick;
  const [initError, setInitError] = useState(false);

  const hasCenter = isValidCoordinates(center);

  useEffect(() => {
    if (!containerRef.current || !hasCenter || mapRef.current) return;

    let map: MapLibreMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: OPENFREEMAP_STYLE_URL,
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false,
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    } catch (error) {
      console.error('FreeMap init failed', error);
      setInitError(true);
      return;
    }

    map.on('error', (event) => {
      const message = String((event as { error?: { message?: string } }).error?.message || '');
      if (message.includes('style') || message.includes('fetch')) {
        try {
          map.setStyle(OSM_RASTER_STYLE);
        } catch {
          setInitError(true);
        }
      }
    });

    map.on('click', (event) => {
      onMapClickRef.current?.({ lat: event.lngLat.lat, lng: event.lngLat.lng });
    });

    mapRef.current = map;

    const resize = () => {
      try {
        map.resize();
      } catch {
        // Map may already be removed.
      }
    };
    const frame = window.requestAnimationFrame(resize);
    const later = window.setTimeout(resize, 250);
    const later2 = window.setTimeout(resize, 800);
    map.on('load', resize);
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(later);
      window.clearTimeout(later2);
      window.removeEventListener('resize', resize);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      try {
        map.remove();
      } catch {
        // already gone
      }
      mapRef.current = null;
    };
  }, [hasCenter, center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasCenter) return;

    try {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      markers.forEach((item) => {
        if (!isValidCoordinates(item.position)) return;
        const marker = new maplibregl.Marker({
          element: createPinElement({
            color: item.color || 'hsl(var(--primary))',
            selected: item.selected,
            property: item.property,
            label: item.label,
          }),
          anchor: 'center',
        })
          .setLngLat([item.position.lng, item.position.lat])
          .addTo(map);

        if (item.popupHtml) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(item.popupHtml)
          );
        }

        marker.getElement().addEventListener('click', (event) => {
          event.stopPropagation();
          onMarkerClickRef.current?.(item.id);
          if (item.popupHtml) marker.togglePopup();
        });
        markersRef.current.push(marker);
      });

      if (markers.length > 1) {
        const bounds = new maplibregl.LngLatBounds();
        markers.forEach((item) => {
          if (isValidCoordinates(item.position)) {
            bounds.extend([item.position.lng, item.position.lat]);
          }
        });
        map.fitBounds(bounds, { padding: 56, maxZoom: 14.2, duration: 400 });
      } else {
        map.easeTo({ center: [center.lng, center.lat], zoom, duration: 300 });
      }
    } catch (error) {
      console.error('FreeMap markers failed', error);
    }
  }, [hasCenter, center.lat, center.lng, zoom, markers]);

  if (!hasCenter || initError) {
    return (
      <div
        className={`neighborhood-map flex items-center justify-center overflow-hidden rounded-xl border border-border bg-muted px-4 text-center ${heightClassName} ${className}`}
        data-testid="neighborhood-map-fallback"
      >
        <p className="text-sm text-muted-foreground">Mapa no disponible</p>
      </div>
    );
  }

  return (
    <div
      className={`neighborhood-map relative overflow-hidden rounded-xl border border-border bg-muted ${heightClassName} ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0" data-testid="neighborhood-map" />
      {overlay}
    </div>
  );
}

export { escapeHtml };
