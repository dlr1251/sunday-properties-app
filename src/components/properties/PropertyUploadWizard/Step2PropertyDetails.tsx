import React, { useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PropertyData, Step2PropertyDetailsProps } from './types';

export const Step2PropertyDetails: React.FC<Step2PropertyDetailsProps> = ({
  propertyData,
  onNumericChange,
  onPropertyTypeChange,
  onStrataChange,
}) => {
  console.log('🏠 Step2PropertyDetails rendering with data:', propertyData);

  const handleNumericInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(`🔢 ${field} changed to:`, e.target.value);
    onNumericChange(field, e.target.value);
  }, [onNumericChange]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="bedrooms">Habitaciones *</Label>
          <Input
            id="bedrooms"
            type="number"
            min="0"
            value={propertyData.bedrooms}
            onChange={handleNumericInputChange('bedrooms')}
          />
        </div>
        <div>
          <Label htmlFor="bathrooms">Baños *</Label>
          <Input
            id="bathrooms"
            type="number"
            min="0"
            value={propertyData.bathrooms}
            onChange={handleNumericInputChange('bathrooms')}
          />
        </div>
        <div>
          <Label htmlFor="area">Área (m²) *</Label>
          <Input
            id="area"
            type="number"
            min="0"
            value={propertyData.area}
            onChange={handleNumericInputChange('area')}
          />
        </div>
        <div>
          <Label htmlFor="parking">Parqueaderos</Label>
          <Input
            id="parking"
            type="number"
            min="0"
            value={propertyData.parking}
            onChange={handleNumericInputChange('parking')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floor">Piso</Label>
          <Input
            id="floor"
            type="number"
            min="0"
            value={propertyData.floor}
            onChange={handleNumericInputChange('floor')}
          />
        </div>
        <div>
          <Label htmlFor="totalFloors">Total Pisos</Label>
          <Input
            id="totalFloors"
            type="number"
            min="0"
            value={propertyData.totalFloors}
            onChange={handleNumericInputChange('totalFloors')}
          />
        </div>
        <div>
          <Label htmlFor="yearBuilt">Año Construcción</Label>
          <Input
            id="yearBuilt"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={propertyData.yearBuilt}
            onChange={handleNumericInputChange('yearBuilt')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-sm font-medium">Tipo de Propiedad *</Label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {[
              { value: "apartment", label: "Apartamento" },
              { value: "house", label: "Casa" },
              { value: "office", label: "Oficina" },
              { value: "commercial", label: "Local Comercial" },
              { value: "warehouse", label: "Bodega" },
              { value: "land", label: "Terreno" },
            ].map((type) => (
              <label
                key={type.value}
                className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                  propertyData.propertyType === type.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="propertyType"
                  value={type.value}
                  checked={propertyData.propertyType === type.value}
                  onChange={(e) => onPropertyTypeChange(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Estrato *</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[1, 2, 3, 4, 5, 6].map((strata) => (
              <label
                key={strata}
                className={`flex items-center justify-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors text-center ${
                  propertyData.strata === strata
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <input
                  type="radio"
                  name="strata"
                  value={strata.toString()}
                  checked={propertyData.strata === strata}
                  onChange={(e) => onStrataChange(e.target.value)}
                  className="text-primary"
                />
                <span className="text-sm font-medium">{strata}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
