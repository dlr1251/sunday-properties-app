import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, MapPin, X } from 'lucide-react';
import { FreeMap } from './FreeMap';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  isValidCoordinates,
  type Coordinates,
} from '@/utils/publicLocation';

export interface LocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoordinates?: Coordinates | null;
  onLocationSelect: (coordinates: Coordinates) => void;
  address?: string;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  open,
  onOpenChange,
  initialCoordinates,
  onLocationSelect,
}) => {
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    initialCoordinates && isValidCoordinates(initialCoordinates) ? initialCoordinates : null
  );
  const [latInput, setLatInput] = useState(
    initialCoordinates && isValidCoordinates(initialCoordinates)
      ? String(initialCoordinates.lat)
      : ''
  );
  const [lngInput, setLngInput] = useState(
    initialCoordinates && isValidCoordinates(initialCoordinates)
      ? String(initialCoordinates.lng)
      : ''
  );

  useEffect(() => {
    if (!open) return;
    if (initialCoordinates && isValidCoordinates(initialCoordinates)) {
      setSelectedLocation(initialCoordinates);
      setLatInput(String(initialCoordinates.lat));
      setLngInput(String(initialCoordinates.lng));
    }
  }, [open, initialCoordinates]);

  const center = selectedLocation && isValidCoordinates(selectedLocation)
    ? selectedLocation
    : DEFAULT_MAP_CENTER;

  const markers = useMemo(
    () =>
      selectedLocation && isValidCoordinates(selectedLocation)
        ? [
            {
              id: 'selected',
              position: selectedLocation,
              color: 'hsl(var(--primary))',
              property: true,
              label: t('properties.maps.selectedLocation'),
            },
          ]
        : [],
    [selectedLocation, t]
  );

  const applyManualCoords = useCallback(() => {
    const lat = Number(latInput);
    const lng = Number(lngInput);
    const next = { lat, lng };
    if (isValidCoordinates(next)) {
      setSelectedLocation(next);
    }
  }, [latInput, lngInput]);

  const handleMapClick = useCallback((coords: Coordinates) => {
    setSelectedLocation(coords);
    setLatInput(String(coords.lat));
    setLngInput(String(coords.lng));
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedLocation && isValidCoordinates(selectedLocation)) {
      onLocationSelect(selectedLocation);
      onOpenChange(false);
    }
  }, [selectedLocation, onLocationSelect, onOpenChange]);

  const canConfirm = selectedLocation && isValidCoordinates(selectedLocation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('properties.maps.selectLocation')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="picker-lat">{t('properties.maps.latitude')}</Label>
              <Input
                id="picker-lat"
                value={latInput}
                onChange={(event) => setLatInput(event.target.value)}
                onBlur={applyManualCoords}
                placeholder="6.2476"
              />
            </div>
            <div>
              <Label htmlFor="picker-lng">{t('properties.maps.longitude')}</Label>
              <Input
                id="picker-lng"
                value={lngInput}
                onChange={(event) => setLngInput(event.target.value)}
                onBlur={applyManualCoords}
                placeholder="-75.5658"
              />
            </div>
          </div>

          <Card className="flex-1 min-h-[320px] overflow-hidden">
            {open && (
              <FreeMap
                center={center}
                zoom={selectedLocation ? 14 : DEFAULT_MAP_ZOOM}
                markers={markers}
                onMapClick={handleMapClick}
                heightClassName="h-full min-h-[320px]"
              />
            )}
          </Card>

          {canConfirm && (
            <Card className="p-4">
              <Label className="text-xs text-muted-foreground mb-1">
                {t('properties.maps.selectedCoordinates')}
              </Label>
              <p className="font-mono text-sm">
                Lat: {selectedLocation!.lat.toFixed(6)}, Lng: {selectedLocation!.lng.toFixed(6)}
              </p>
            </Card>
          )}

          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>{t('properties.maps.pickerHint')}</AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            <Check className="h-4 w-4 mr-2" />
            {t('properties.maps.confirmLocation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
