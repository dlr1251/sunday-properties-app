import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { PropertyData, Step1BasicInfoProps } from './types';
import { LocationPickerModal } from '@/components/maps/LocationPickerModal';
import { isValidCoordinates } from '@/lib/googleMaps';

export const Step1BasicInfo: React.FC<Step1BasicInfoProps> = ({
  propertyData,
  onListingTypeChange,
  onTitleChange,
  onDescriptionChange,
  onAddressChange,
  onNeighborhoodChange,
  onCoordinatesChange,
}) => {
  const { t } = useTranslation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  console.log('🎯 Step1BasicInfo rendering with data:', propertyData);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📝 Title input changed:', e.target.value);
    onTitleChange(e.target.value);
  }, [onTitleChange]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log('📝 Description textarea changed:', e.target.value);
    onDescriptionChange(e.target.value);
  }, [onDescriptionChange]);

  const handleAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📝 Address input changed:', e.target.value);
    onAddressChange(e.target.value);
  }, [onAddressChange]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium">{t('properties.wizard.basic.listingType')}</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {[
            { value: 'sale' as const, label: t('properties.listingTypes.sale') },
            { value: 'rental' as const, label: t('properties.listingTypes.rental') },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                propertyData.listingType === opt.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              <input
                type="radio"
                name="listingType"
                value={opt.value}
                checked={propertyData.listingType === opt.value}
                onChange={() => onListingTypeChange(opt.value)}
                className="text-primary"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="title">{t('properties.wizard.basic.titleLabel')}</Label>
        <Input
          id="title"
          placeholder={t('properties.wizard.basic.titlePlaceholder')}
          value={propertyData.title}
          onChange={handleTitleChange}
        />
      </div>

      <div>
        <Label htmlFor="description">{t('properties.wizard.basic.descriptionLabel')}</Label>
        <Textarea
          id="description"
          placeholder={t('properties.wizard.basic.descriptionPlaceholder')}
          rows={4}
          value={propertyData.description}
          onChange={handleDescriptionChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">{t('properties.wizard.basic.addressLabel')}</Label>
          <Input
            id="address"
            placeholder={t('properties.wizard.basic.addressPlaceholder')}
            value={propertyData.address}
            onChange={handleAddressChange}
          />
        </div>
        <div>
          <Label className="text-sm font-medium">{t('properties.wizard.basic.neighborhoodLabel')}</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { value: "el-poblado", label: "El Poblado" },
              { value: "laureles", label: "Laureles" },
              { value: "envigado", label: "Envigado" },
              { value: "sabaneta", label: "Sabaneta" },
              { value: "bello", label: "Bello" },
            ].map((neighborhood) => (
              <label
                key={neighborhood.value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  propertyData.neighborhood === neighborhood.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="neighborhood"
                  value={neighborhood.value}
                  checked={propertyData.neighborhood === neighborhood.value}
                  onChange={(e) => onNeighborhoodChange(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm">{neighborhood.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('properties.wizard.basic.mapLocation')}</Label>
        <div className="h-64 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
          {isValidCoordinates(propertyData.coordinates) ? (
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">{t('properties.wizard.basic.locationSelected')}</p>
              <p className="text-xs text-muted-foreground mb-4">
                Lat: {propertyData.coordinates.lat.toFixed(6)}, Lng: {propertyData.coordinates.lng.toFixed(6)}
              </p>
              <Button variant="outline" onClick={() => setShowLocationPicker(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                {t('properties.wizard.basic.changeLocation')}
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('properties.wizard.basic.mapLocation')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('properties.wizard.basic.mapHint')}
              </p>
              <Button variant="outline" onClick={() => setShowLocationPicker(true)}>
                <MapPin className="h-4 w-4 mr-2" />
                {t('properties.wizard.basic.selectLocation')}
              </Button>
            </div>
          )}
        </div>
      </div>

      <LocationPickerModal
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        initialCoordinates={propertyData.coordinates}
        onLocationSelect={onCoordinatesChange}
        address={propertyData.address}
      />
    </div>
  );
};
