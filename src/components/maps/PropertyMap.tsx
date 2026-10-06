import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { FreeMap } from './FreeMap';
import { type Coordinates } from '@/utils/publicLocation';

export interface PropertyMarker {
  id: string;
  position: Coordinates;
  title: string;
  price?: number | string;
  image?: string;
  location?: string;
  onClick?: () => void;
}

export interface PropertyMapProps {
  center: Coordinates;
  zoom?: number;
  markers?: PropertyMarker[];
  height?: string;
  className?: string;
  onMarkerClick?: (markerId: string) => void;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  height = '400px',
  className = '',
  onMarkerClick,
}) => {
  return (
    <FreeMap
      center={center}
      zoom={zoom}
      markers={markers.map((marker) => ({
        id: marker.id,
        position: marker.position,
        color: 'hsl(var(--primary))',
        property: true,
        label: marker.title,
        popupHtml: `<div style="font: 600 13px Satoshi, sans-serif; color: hsl(var(--foreground))">${marker.title.replace(
          /[<>&"]/g,
          ''
        )}</div>${
          marker.location
            ? `<div style="font: 12px Satoshi, sans-serif; color: hsl(var(--muted-foreground)); margin-top: 2px">${marker.location.replace(
                /[<>&"]/g,
                ''
              )}</div>`
            : ''
        }`,
      }))}
      onMarkerClick={onMarkerClick}
      heightClassName="h-full"
      className={className}
    />
  );
};

export const MapFallback: React.FC<{ message?: string }> = ({ message = 'Mapa no disponible' }) => {
  return (
    <Card className="flex items-center justify-center bg-card" style={{ minHeight: '400px' }}>
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </Card>
  );
};
