import React from 'react';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Label } from '../../../ui/label';
import { PropertyFormData } from '../PropertyWizard';

interface BasicDetailsStepProps {
  data: PropertyFormData;
  onUpdate: (updates: Partial<PropertyFormData>) => void;
  isDarkMode?: boolean;
}

export const BasicDetailsStep: React.FC<BasicDetailsStepProps> = ({
  data,
  onUpdate,
  isDarkMode = true
}) => {
  const inputClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : '';
  const selectClasses = isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : '';
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <Label htmlFor="title" className={textPrimary}>Título de la Propiedad *</Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Ej: Hermoso apartamento en zona norte"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>

        {/* Property Type */}
        <div>
          <Label htmlFor="property_type" className={textPrimary}>Tipo de Propiedad *</Label>
          <Select
            value={data.property_type}
            onValueChange={(value) => onUpdate({ property_type: value as any })}
          >
            <SelectTrigger className={`mt-1 ${selectClasses}`}>
              <SelectValue placeholder="Seleccione tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartamento</SelectItem>
              <SelectItem value="house">Casa</SelectItem>
              <SelectItem value="townhouse">Casa de ciudad</SelectItem>
              <SelectItem value="office">Oficina</SelectItem>
              <SelectItem value="commercial">Local comercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price" className={textPrimary}>Precio (COP) *</Label>
          <Input
            id="price"
            type="number"
            value={data.price || ''}
            onChange={(e) => onUpdate({ price: parseInt(e.target.value) || 0 })}
            placeholder="Ej: 350000000"
            className={`mt-1 ${inputClasses}`}
            required
          />
        </div>

        {/* Bedrooms */}
        <div>
          <Label htmlFor="bedrooms" className={textPrimary}>Habitaciones</Label>
          <Select
            value={data.bedrooms.toString()}
            onValueChange={(value) => onUpdate({ bedrooms: parseInt(value) })}
          >
            <SelectTrigger className={`mt-1 ${selectClasses}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Estudio</SelectItem>
              <SelectItem value="1">1 habitación</SelectItem>
              <SelectItem value="2">2 habitaciones</SelectItem>
              <SelectItem value="3">3 habitaciones</SelectItem>
              <SelectItem value="4">4 habitaciones</SelectItem>
              <SelectItem value="5">5+ habitaciones</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bathrooms */}
        <div>
          <Label htmlFor="bathrooms" className={textPrimary}>Baños</Label>
          <Select
            value={data.bathrooms.toString()}
            onValueChange={(value) => onUpdate({ bathrooms: parseInt(value) })}
          >
            <SelectTrigger className={`mt-1 ${selectClasses}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 baño</SelectItem>
              <SelectItem value="2">2 baños</SelectItem>
              <SelectItem value="3">3 baños</SelectItem>
              <SelectItem value="4">4 baños</SelectItem>
              <SelectItem value="5">5+ baños</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Area */}
        <div>
          <Label htmlFor="area" className={textPrimary}>Área (m²)</Label>
          <Input
            id="area"
            type="number"
            value={data.area || ''}
            onChange={(e) => onUpdate({ area: parseInt(e.target.value) || 0 })}
            placeholder="Ej: 75"
            className={`mt-1 ${inputClasses}`}
          />
        </div>

        {/* Parking */}
        <div>
          <Label htmlFor="parking" className={textPrimary}>Parqueaderos</Label>
          <Select
            value={data.parking.toString()}
            onValueChange={(value) => onUpdate({ parking: parseInt(value) })}
          >
            <SelectTrigger className={`mt-1 ${selectClasses}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Sin parqueadero</SelectItem>
              <SelectItem value="1">1 parqueadero</SelectItem>
              <SelectItem value="2">2 parqueaderos</SelectItem>
              <SelectItem value="3">3+ parqueaderos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className={textPrimary}>Descripción *</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Describa las características principales de la propiedad..."
          className={`mt-1 min-h-32 ${inputClasses}`}
          required
        />
        <p className={`text-sm mt-1 ${textSecondary}`}>
          Incluya detalles sobre la ubicación, comodidades, estado de conservación, etc.
        </p>
      </div>

      {/* Additional Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="floor" className={textPrimary}>Piso (opcional)</Label>
          <Input
            id="floor"
            type="number"
            value={data.floor || ''}
            onChange={(e) => onUpdate({ floor: parseInt(e.target.value) || undefined })}
            placeholder="Ej: 5"
            className={`mt-1 ${inputClasses}`}
          />
        </div>

        <div>
          <Label htmlFor="total_floors" className={textPrimary}>Total de pisos</Label>
          <Input
            id="total_floors"
            type="number"
            value={data.total_floors || ''}
            onChange={(e) => onUpdate({ total_floors: parseInt(e.target.value) || undefined })}
            placeholder="Ej: 20"
            className={`mt-1 ${inputClasses}`}
          />
        </div>

        <div>
          <Label htmlFor="year_built" className={textPrimary}>Año de construcción</Label>
          <Input
            id="year_built"
            type="number"
            value={data.year_built || ''}
            onChange={(e) => onUpdate({ year_built: parseInt(e.target.value) || undefined })}
            placeholder="Ej: 2020"
            className={`mt-1 ${inputClasses}`}
          />
        </div>
      </div>
    </div>
  );
};
