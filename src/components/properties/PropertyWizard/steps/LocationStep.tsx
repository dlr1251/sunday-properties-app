import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { PropertyFormData } from '../PropertyWizard';

interface LocationStepProps {
  data: PropertyFormData;
  onUpdate: (updates: Partial<PropertyFormData>) => void;
  isDarkMode?: boolean;
}

export const LocationStep: React.FC<LocationStepProps> = ({
  data,
  onUpdate,
  isDarkMode = true
}) => {
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Address */}
        <div className="md:col-span-2">
          <Label htmlFor="address" className={textPrimary}>Dirección *</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder="Ej: Calle 123 #45-67"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>

        {/* Neighborhood */}
        <div>
          <Label htmlFor="neighborhood" className={textPrimary}>Barrio *</Label>
          <Input
            id="neighborhood"
            value={data.neighborhood}
            onChange={(e) => onUpdate({ neighborhood: e.target.value })}
            placeholder="Ej: Zona Norte"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city" className={textPrimary}>Ciudad *</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onUpdate({ city: e.target.value })}
            placeholder="Ej: Bogotá"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>
      </div>

      {/* Map Placeholder */}
      <div className={`p-8 border-2 border-dashed rounded-lg text-center ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
        <div className={`text-4xl mb-4 ${textSecondary}`}>🗺️</div>
        <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>Seleccionar ubicación en el mapa</h3>
        <p className={textSecondary}>
          Aquí aparecerá un mapa interactivo para seleccionar las coordenadas exactas de la propiedad.
          Por ahora, las coordenadas se establecerán automáticamente basado en la dirección.
        </p>
        <div className="mt-4 text-sm">
          <p className={textSecondary}>Coordenadas actuales:</p>
          <p className={`font-mono ${textPrimary}`}>
            Lat: {data.coordinates.lat || 'No seleccionado'}, Lng: {data.coordinates.lng || 'No seleccionado'}
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-950 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
        <h4 className={`font-semibold mb-2 ${textPrimary}`}>💡 Consejos para la ubicación</h4>
        <ul className={`text-sm space-y-1 ${textSecondary}`}>
          <li>• Use la dirección exacta para mejor visibilidad</li>
          <li>• Incluya referencias cercanas (parques, transporte, comercios)</li>
          <li>• Verifique que la ubicación aparezca correctamente en el mapa</li>
        </ul>
      </div>
    </div>
  );
};
